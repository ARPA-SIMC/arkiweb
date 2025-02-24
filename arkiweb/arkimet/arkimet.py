import contextlib
from functools import cached_property
from pathlib import Path
from typing import Callable

import arkimet
from arkimet.cmdline.base import RestrictSectionFilter

from asgiref.sync import sync_to_async

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpRequest


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

    @cached_property
    def config_allowed(self) -> arkimet.cfg.Sections:
        """Return configuration with allowed=True."""
        res = arkimet.cfg.Sections()
        for name, section in self.config.items():
            if section["allowed"] == "true":
                res[name] = section
        return res

    @cached_property
    def dataset_names(self) -> frozenset[str]:
        """Return the datasets requested."""
        return frozenset(self.request.GET.getlist("datasets[]", []))

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

    def use_datasets(self) -> None:
        """
        Add configured datasets to the arkimet session.

        This allows to later instantiate datasets by name from the session.
        """
        for name, section in self.config.items():
            self.session.add_dataset(section)

    def _set_config(self, section_is_allowed: Callable[["arkimet.config.Section"], bool]) -> None:
        config = arkimet.cfg.Sections.parse(self.config_path.as_posix())
        for name, section in config.items():
            section["id"] = name
            section["allowed"] = "true" if section_is_allowed(section) else "false"

        # Filter config keeping only datasets named in self.dataset_names
        names = self.dataset_names
        if names:
            filtered = arkimet.cfg.Sections()
            for name, section in config.items():
                if name not in names:
                    continue
                filtered[name] = section
            config = filtered

        self.config = config


class SyncArkimet(Arkimet):
    def init(self) -> None:
        # Load configuration
        if self.request.user.is_authenticated and self.request.user.arkimet_restrict:
            restrict_filter = RestrictSectionFilter(self.request.user.arkimet_restrict).is_allowed
        else:
            restrict_filter = lambda x: False
        self._set_config(restrict_filter)


class AsyncArkimet(Arkimet):
    async def init(self) -> None:
        # Ugly hack to resolve the lazy user object in an async context.
        # One could use auser() from django 5.0, but we are not there yet.
        # See https://code.djangoproject.com/ticket/31920
        await sync_to_async(bool)(self.request.user)

        # Load configuration
        if self.request.user.is_authenticated and self.request.user.arkimet_restrict:
            restrict_filter = RestrictSectionFilter(self.request.user.arkimet_restrict).is_allowed
        else:
            restrict_filter = lambda x: False
        self._set_config(restrict_filter)
