import abc
import asyncio
import io
import json
import shutil
import subprocess
import tempfile
from contextlib import ExitStack
from functools import cached_property
from pathlib import Path
from typing import Any, Optional

import arkimet

from asgiref.sync import sync_to_async

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import (
    HttpRequest,
    HttpResponse,
    HttpResponseBase,
    HttpResponseForbidden,
    HttpResponseServerError,
    JsonResponse,
    StreamingHttpResponse,
)
from django.shortcuts import render
from django.views.generic import View

from .arkimet import AsyncArkimet, SyncArkimet
from .consts import NAME_MAPS

import logging

log = logging.getLogger("arkimet")


class APIViewBase(View):
    """Base for all API views."""

    #: Manage lifetime of per-request resources
    resources: ExitStack

    def dispatch(self, request: HttpRequest, *args, **kwargs) -> HttpResponseBase:
        self.resources = ExitStack()
        with self.resources:
            return super().dispatch(request, *args, **kwargs)

    def permission_denied(self, message: str) -> HttpResponse:
        """Return a permission denied error message."""
        return HttpResponseForbidden(message, content_type="text/plain")

    def error(self, message: str) -> HttpResponse:
        """Return an error response."""
        return HttpResponseServerError(message)


class AsyncAPIView(APIViewBase):
    """Base class for Async API views."""

    async def arkimet(self) -> AsyncArkimet:
        """Create the Arkimet object for this request."""
        res = AsyncArkimet(self.request)
        await res.init()
        self.resources.enter_context(res)
        return res


class SyncAPIView(APIViewBase):
    """Base class for Sync API views."""

    def arkimet(self) -> SyncArkimet:
        """Create the Arkimet object for this request."""
        res = SyncArkimet(self.request)
        res.init()
        self.resources.enter_context(res)
        return res


class DataView(AsyncAPIView):
    """data/ API endpoint."""

    @cached_property
    def arki_query(self) -> Optional[Path]:
        """Return the path to arki_query."""
        arki_query = shutil.which("arki-query")
        if arki_query is None:
            return None
        return Path(arki_query)

    def build_commandline(self, config: Path, matcher: str, postprocess: str) -> list[str]:
        """Build an arki-query commandline."""
        assert self.arki_query is not None
        cmd = [self.arki_query.as_posix(), "--data", "-C", config.as_posix(), matcher]
        if postprocess:
            cmd += ["--postproc", postprocess]
        return cmd

    async def get(self, request: HttpRequest, **kwargs: Any) -> HttpResponseBase:
        # https://github.com/ARPA-SIMC/arkiweb?tab=readme-ov-file#get-the-data
        if self.arki_query is None:
            return self.error("arki-query not installed")

        with await self.arkimet() as arki:
            config = arki.config_allowed
            if len(config) == 0:
                return self.permission_denied("you do not have the right credentials to download data")

            postprocess = self.request.GET.get("postprocess", "")
            if postprocess and len(config) > 1:
                return self.error("Only one dataset is allowed when postprocess parameter is set")

            matcher = arki.matcher.expanded

            async def log_stderr(stderr):
                while True:
                    line = await stderr.readline()
                    if not line:
                        break
                    log.warning("arki-query: %s", line.rstrip())

            async def generate():
                with (
                    tempfile.NamedTemporaryFile() as cfg,
                    # Transfer ownership of resources to the generator function, so
                    # they do not get closed when the view ends
                    self.resources.pop_all(),
                ):
                    config.write(cfg)
                    cfg.flush()
                    cmd = self.build_commandline(Path(cfg.name), matcher, postprocess)
                    proc = await asyncio.create_subprocess_exec(*cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                    do_log_stderr = asyncio.create_task(log_stderr(proc.stderr))
                    streaming = True

                    while True:
                        tasks = []
                        if do_log_stderr is not None:
                            tasks.append(do_log_stderr)
                        if streaming:
                            tasks.append(proc.stdout.read())
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

                    res = await proc.wait()
                    if res != 0:
                        log.warning("arki-query returned with code %d", res)

            return StreamingHttpResponse(generate(), content_type="application/binary")


class DatasetsView(SyncAPIView):
    """
    datasets/ API endpoint.

    Return a list of dataset configuration files (as JSON), optionally limited
    to datasets that contain data for a query.
    """

    def get(self, request: HttpRequest, **kwargs: Any) -> HttpResponse:
        """Return configuration for the selected datasets."""
        # https://github.com/ARPA-SIMC/arkiweb?tab=readme-ov-file#get-the-list-of-datasets
        with self.arkimet() as arki:
            # Filter datasets by matcher
            arki.use_datasets()
            config = arki.filter_config_by_matcher(arki.config)

            # Serialize dataset configurations
            datasets: list[dict[str, Any]] = []
            for name, section in config.items():
                datasets.append(
                    {
                        "id": name,
                        "name": section.get("id", ""),
                        "description": section.get("description", ""),
                        "bounding": section.get("bounding", ""),
                        "allowed": section.get("allowed"),
                        "postprocess": [p.strip() for p in section.get("postprocess", "").split(",")],
                    }
                )

        return JsonResponse({"datasets": datasets})


class FieldsView(SyncAPIView):
    """
    fields/ API endpoint.

    Given a list of datasets and a query, return the merged summary for that
    query for each dataset.
    """

    def get(self, request: HttpRequest, **kwargs: Any) -> HttpResponse:
        # https://github.com/ARPA-SIMC/arkiweb?tab=readme-ov-file#get-the-list-of-fields
        with self.arkimet() as arki:
            arki.use_datasets()

            summary = arkimet.Summary()
            for name in arki.config.keys():
                with arki.session.dataset_reader(name=name) as reader:
                    reader.query_summary(arki.matcher, summary=summary)

            with io.BytesIO() as buf:
                summary.write_short(buf, format="json", annotate=True)

                buf.seek(0)
                parsed = json.load(buf)

            fields: list[dict[str, Any]] = []
            for name, values in parsed["items"].items():
                if name == "summarystats":
                    continue
                converted: list[dict[str, Any]] = []
                for value in values:
                    converted.append({NAME_MAPS[name].get(k, k): v for k, v in value.items() if k != "type"})
                fields.append(
                    {
                        "type": name,
                        "values": converted,
                    }
                )

            [stats] = [value for name, value in parsed["items"].items() if name == "summarystats"]

        return JsonResponse({"fields": fields, "stats": stats})


class SummaryView(SyncAPIView):
    """summary/ API endpoint."""

    def get(self, requoest: HttpRequest, **kwargs: Any) -> HttpResponse:
        # https://github.com/ARPA-SIMC/arkiweb?tab=readme-ov-file#get-the-summary
        with self.arkimet() as arki:
            arki.use_datasets()

            summary = arkimet.Summary()
            for name in arki.config.keys():
                with arki.session.dataset_reader(name=name) as reader:
                    reader.query_summary(arki.matcher, summary=summary)

            with io.BytesIO() as buf:
                summary.write(buf, format="json", annotate=True)

                buf.seek(0)
                parsed = json.load(buf)

        return JsonResponse(parsed)
