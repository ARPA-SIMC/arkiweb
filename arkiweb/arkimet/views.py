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

from .arkimet import AsyncArkimet, SyncArkimet, SelectMode, DataQuery
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


class StreamingAdapter:
    """Wrap an asynchronous iterator with"""

    def __init__(
        self,
        resources: ExitStack,
        query: DataQuery,
    ) -> None:
        self.resources = resources
        self.query = query
        self.shutdown_coro = None

    async def __aiter__(self):
        async for chunk in self.query.generate_data():
            yield chunk

    async def close_async(self):
        await self.query.shutdown()
        self.resources.close()

    def close(self):
        self.shutdown_coro = self.close_async
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            asyncio.run(self.shutdown_coro)
        else:
            self.shutdown_coro = loop.create_task(self.shutdown_coro())


class DataView(AsyncAPIView):
    """data/ API endpoint."""

    async def get(self, request: HttpRequest, **kwargs: Any) -> HttpResponseBase:
        # https://github.com/ARPA-SIMC/arkiweb?tab=readme-ov-file#get-the-data
        with await self.arkimet() as arki:
            config = arki.select_datasets(only_allowed=True, select=SelectMode.USER_DEFAULT_NONE)
            if len(config) == 0:
                return self.permission_denied("you do not have the right credentials to download data")

            postprocess = self.request.GET.get("postprocess", "")
            if postprocess and len(config) > 1:
                return self.error("Only one dataset is allowed when postprocess parameter is set")

            query = DataQuery(config, arki.matcher.expanded, postprocess)
            if query.arki_query is None:
                return self.error("arki-query not installed")

            # Transfer ownership of resources to the generator function, so
            # they do not get closed when the view ends
            return StreamingHttpResponse(
                StreamingAdapter(self.resources.pop_all(), query), content_type="application/binary"
            )


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
            config = arki.select_datasets(only_allowed=False, select=SelectMode.USER_DEFAULT_ALL)
            arki.use_datasets(config)
            config = arki.filter_config_by_matcher(config)

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
            config = arki.select_datasets(only_allowed=False, select=SelectMode.USER_DEFAULT_NONE)
            arki.use_datasets(config)

            summary = arkimet.Summary()
            for name in config.keys():
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
            config = arki.select_datasets(only_allowed=False, select=SelectMode.USER_DEFAULT_NONE)
            arki.use_datasets(config)

            summary = arkimet.Summary()
            for name in config.keys():
                with arki.session.dataset_reader(name=name) as reader:
                    reader.query_summary(arki.matcher, summary=summary)

            with io.BytesIO() as buf:
                summary.write(buf, format="json", annotate=True)

                buf.seek(0)
                parsed = json.load(buf)

        return JsonResponse(parsed)
