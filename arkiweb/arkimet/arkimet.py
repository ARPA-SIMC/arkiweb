import asyncio
import contextlib
import shutil
import subprocess
import tempfile
from enum import Enum, auto
from functools import cached_property
from pathlib import Path
from typing import Callable, Optional, AsyncGenerator

import arkimet
from arkimet.cmdline.base import RestrictSectionFilter

from asgiref.sync import sync_to_async

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpRequest
import logging

log = logging.getLogger("arkimet")


class SelectMode(Enum):
    """Control user selection of datasets."""

    #: Select all datasets
    ALL = auto()
    #: Honor user selection, all datasets if not provided
    USER_DEFAULT_ALL = auto()
    #: Honor user selection, no datasets if not provided
    USER_DEFAULT_NONE = auto()


class Arkimet(contextlib.ExitStack):
    """Access arkimet datasets."""

    request: HttpRequest
    session: arkimet.dataset.Session
    #: Path to the arkiweb config file
    config_path: Path
    #: Dataset configuration file
    config: arkimet.cfg.Sections

    def __init__(self, request: HttpRequest) -> None:
        super().__init__()
        self.request = request
        self.session = arkimet.dataset.Session()

        if (path := getattr(settings, "ARKIWEB_CONFIG", None)) is None:
            raise ImproperlyConfigured("missing settings.ARKIWEB_CONFIG")
        self.config_path = Path(path)

    def __enter__(self) -> "Arkimet":
        super().__enter__()
        self.enter_context(self.session)
        return self

    def get_user_allowlist(self, select: SelectMode = SelectMode.ALL) -> frozenset[str]:
        """Build an allowlist of user-selected dataset names."""
        if select == SelectMode.ALL:
            return frozenset(self.config.keys())
        elif select == SelectMode.USER_DEFAULT_ALL:
            if "datasets[]" in self.request.GET:
                return frozenset(self.request.GET.getlist("datasets[]", []))
            else:
                return frozenset(self.config.keys())
        elif select == SelectMode.USER_DEFAULT_NONE:
            if "datasets[]" in self.request.GET:
                return frozenset(self.request.GET.getlist("datasets[]", []))
            else:
                return frozenset()
        else:
            raise ValueError(f"Invalid select mode {select!r}")

    def select_datasets(self, only_allowed: bool = True, select: SelectMode = SelectMode.ALL) -> arkimet.cfg.Sections:
        """
        Select datasets from the configuration.

        :param only_allowed: if True keep only datasets with allowed=true
        """
        user_allowlist = self.get_user_allowlist(select)

        res = arkimet.cfg.Sections()
        for name, section in self.config.items():
            if only_allowed and section["allowed"] != "true":
                continue
            if name not in user_allowlist:
                continue
            res[name] = section

        return res

    @cached_property
    def matcher(self) -> arkimet.Matcher:
        """Return the arkimet query."""
        query = self.request.GET.get("query", "")
        return self.session.matcher(query)

    def dataset_has_data(self, name: str) -> bool:
        """Check if a dataset has data for the current matcher."""
        with self.session.dataset_reader(name=name) as reader:
            summary = reader.query_summary(self.matcher)
        return summary.count > 0

    def filter_config_by_matcher(self, config: arkimet.cfg.Sections) -> arkimet.cfg.Sections:
        """Filter config keeping only datasets that have data for self.matcher."""
        if self.matcher.expanded == "":  # TODO: implement matcher.empty()
            return config

        filtered = arkimet.cfg.Sections()
        for name, section in config.items():
            if self.dataset_has_data(name):
                filtered[name] = section
        return filtered

    def use_datasets(self, config: Optional[arkimet.cfg.Sections] = None) -> None:
        """
        Add configured datasets to the arkimet session.

        This allows to later instantiate datasets by name from the session.
        """
        if config is None:
            config = self.config
        for name, section in config.items():
            self.session.add_dataset(section)

    def _set_config(self, section_is_allowed: Callable[[arkimet.cfg.Section], bool]) -> None:
        config = arkimet.cfg.Sections.parse(self.config_path.as_posix())
        for name, section in config.items():
            section["id"] = name
            section["allowed"] = "true" if section_is_allowed(section) else "false"
        self.config = config


def allow_all(section: arkimet.cfg.Section) -> bool:
    """Restrict filter allowing all datasets."""
    return True


def deny_all(section: arkimet.cfg.Section) -> bool:
    """Restrict filter denying all datasets."""
    return False


class SyncArkimet(Arkimet):
    def init(self) -> None:
        # Load configuration
        if not self.request.user.is_authenticated:
            restrict_filter = deny_all
        elif self.request.user.skip_dataset_restrictions:
            restrict_filter = allow_all
        elif self.request.user.arkimet_restrict:
            restrict_filter = RestrictSectionFilter(self.request.user.arkimet_restrict).is_allowed
        else:
            restrict_filter = deny_all
        self._set_config(restrict_filter)


class AsyncArkimet(Arkimet):
    async def init(self) -> None:
        # Ugly hack to resolve the lazy user object in an async context.
        # One could use auser() from django 5.0, but we are not there yet.
        # See https://code.djangoproject.com/ticket/31920
        await sync_to_async(bool)(self.request.user)

        # Load configuration
        if not self.request.user.is_authenticated:
            restrict_filter = deny_all
        elif self.request.user.skip_dataset_restrictions:
            restrict_filter = allow_all
        elif self.request.user.arkimet_restrict:
            restrict_filter = RestrictSectionFilter(self.request.user.arkimet_restrict).is_allowed
        else:
            restrict_filter = deny_all
        self._set_config(restrict_filter)


class DataQuery:
    def __init__(self, config: arkimet.cfg.Sections, matcher: arkimet.Matcher, postprocess: str = "") -> None:
        self.config = config
        self.matcher = matcher
        self.postprocess = postprocess
        self.arki_query: Optional[Path] = None
        if (arki_query := shutil.which("arki-query")) is not None:
            self.arki_query = Path(arki_query)
        self.proc = None

    def build_commandline(self, config: Path) -> list[str]:
        """Build an arki-query commandline."""
        assert self.arki_query is not None
        cmd = [self.arki_query.as_posix()]

        if self.postprocess:
            cmd += ["--postproc", self.postprocess]
        else:
            cmd += ["--data"]

        cmd += ["-C", config.as_posix(), self.matcher]

        return cmd

    async def log_stderr(self, stderr):
        while True:
            line = await stderr.readline()
            if not line:
                break
            log.warning("arki-query: %s", line.rstrip().decode(errors="replace"))

    async def shutdown(self) -> None:
        if self.proc is None:
            return
        res = await self.proc.wait()
        if res != 0:
            log.warning("arki-query returned with code %d", res)

    async def generate_data(self) -> AsyncGenerator[bytes, None]:
        with tempfile.NamedTemporaryFile() as cfg:
            self.config.write(cfg)
            cfg.flush()
            cmd = self.build_commandline(Path(cfg.name))
            self.proc = await asyncio.create_subprocess_exec(*cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            do_log_stderr = asyncio.create_task(self.log_stderr(self.proc.stderr))
            streaming = True

            while True:
                tasks = []
                if do_log_stderr is not None:
                    tasks.append(do_log_stderr)
                if streaming:
                    tasks.append(self.proc.stdout.read())
                if not tasks:
                    break
                done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
                for task in done:
                    if task == do_log_stderr:
                        do_log_stderr = None
                    else:
                        buffer = await task
                        if buffer:
                            yield buffer
                        else:
                            streaming = False
