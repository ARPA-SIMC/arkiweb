import abc
import io
import json
import tempfile
from functools import cached_property
from pathlib import Path
from typing import Any

import arkimet

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import (
    HttpRequest,
    HttpResponse,
    HttpResponseBase,
    HttpResponseServerError,
    JsonResponse,
    StreamingHttpResponse,
)
from django.shortcuts import render
from django.views.generic import View

from .arkimet import Arkimet
from .consts import NAME_MAPS


class APIView(abc.ABC, View):
    """Base class for API views."""

    def arkimet(self) -> Arkimet:
        """Return an Arkimet object for this request."""
        return Arkimet(self.request)

    def error(self, message: str) -> HttpResponse:
        """Return an error response."""
        return HttpResponseServerError(message)


class DataView(APIView):
    """data/ API endpoint."""

    def build_commandline(self, config: Path, matcher: str, postprocess: str) -> list[str]:
        """Build an arki-query commandline."""
        cmd = ["arki-query", "--data", "-C", config.as_posix(), matcher]
        if postprocess:
            cmd += ["--postproc", postprocess]
        return cmd

    async def get(self, request: HttpRequest, **kwargs: Any) -> HttpResponseBase:
        # https://github.com/ARPA-SIMC/arkiweb?tab=readme-ov-file#get-the-data
        with self.arkimet() as arki:
            postprocess = self.request.GET.get("postprocess", "")
            if postprocess and arki.config.size() > 1:
                return self.error("Only one dataset is allowed when postprocess parameter is set")

            matcher = arki.matcher.expanded

            async def generate():
                # Note: this is run after get ends, and the arkimet session has
                # been closed
                with tempfile.NamedTemporaryFile() as cfg:
                    arki.config.write(cfg)
                    cfg.flush()
                    cmd = self.build_commandline(Path(cfg.name), matcher, postprocess)
                    yield "TODO"
                    yield ":"
                    yield "async"
                    yield "data"
                    import shlex

                    yield shlex.join(cmd)

            return StreamingHttpResponse(generate(), content_type="application/binary")


class DatasetsView(APIView):
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


class FieldsView(APIView):
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


class SummaryView(APIView):
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
