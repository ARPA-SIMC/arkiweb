import abc
import io
import json
from functools import cached_property
from pathlib import Path
from typing import Any

import arkimet
from arkimet.cmdline.base import RestrictSectionFilter

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpRequest, HttpResponse, HttpResponseServerError, JsonResponse
from django.shortcuts import render
from django.views.generic import View


class APIView(abc.ABC, View):
    """Base class for API views."""

    arkimet_session: arkimet.dataset.Session

    @cached_property
    def config_path(self) -> Path:
        """Return the path to the arkiweb config file."""
        result = getattr(settings, "ARKIWEB_CONFIG", None)
        if result is None:
            raise ImproperlyConfigured("missing settings.ARKIWEB_CONFIG")
        return Path(result)

    @cached_property
    def config(self) -> arkimet.cfg.Sections:
        """Return the dataset configuration file."""
        # Load configuration
        if self.request.user.is_authenticated:
            restrict_filter = RestrictSectionFilter(self.request.user.username)
        else:
            # TODO: this allows everything if not authenticated
            #       (it looks like the behaviour of C++ arkiweb)
            restrict_filter = RestrictSectionFilter("")

        config = arkimet.cfg.Sections.parse(self.config_path.as_posix())
        for name, section in config.items():
            section["id"] = name
            section["allowed"] = "true" if restrict_filter.is_allowed(section) else "false"

        # Filter config keeping only datasets named in self.dataset_names
        names = self.dataset_names
        if names:
            filtered = arkimet.cfg.Sections()
            for name, section in config.items():
                if name not in names:
                    continue
                filtered[name] = section
            config = filtered

        return config

    @cached_property
    def dataset_names(self) -> frozenset[str]:
        """Return the datasets requested."""
        return frozenset(self.request.GET.getlist("datasets[]", []))

    @cached_property
    def matcher(self) -> arkimet.Matcher:
        """Return the arkimet query."""
        query = self.request.GET.get("query", "")
        return self.arkimet_session.matcher(query)

    def dataset_has_data(self, name: str) -> bool:
        """Check if a dataset has data for the current matcher."""
        with self.arkimet_session.dataset_reader(name=name) as reader:
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
            self.arkimet_session.add_dataset(section)

    def error(self, message: str) -> HttpResponse:
        """Return an error response."""
        return HttpResponseServerError()

    def setup(self, request: HttpRequest, *args, **kwargs) -> None:
        """Add an arkimet session to the view."""
        super().setup(request, *args, **kwargs)
        self.arkimet_session = arkimet.dataset.Session()
        self.arkimet_session.__enter__()

    def dispatch(self, request: HttpRequest, *args, **kwargs) -> HttpResponse:
        """Create an arkimet session for the duration of this request."""
        try:
            return super().dispatch(request, *args, **kwargs)
        finally:
            self.arkimet_session.__exit__(None, None, None)
            del self.arkimet_session

    def __del__(self) -> None:
        """Make sure arkimet_session is cleaned up."""
        if hasattr(self, "arkimet_session"):
            self.arkimet_session.__exit__(None, None, None)
            del self.arkimet_session


class DataView(APIView):
    """data/ API endpoint."""

    def get(self, request: HttpRequest, **kwargs: Any) -> HttpResponse:
        # https://github.com/ARPA-SIMC/arkiweb?tab=readme-ov-file#get-the-data

        # 		std::vector<cgicc::FormEntry> forms;
        # 		arki::ConfigFile config;
        # 		arkiweb::utils::setToDefault(config, datasets);
        # 		arkiweb::authorization::User::get().remove_unallowed(config);
        #
        # 		if (!arkiweb::authorization::User::get().is_allowed(matcher, config)) {
        # 			std::cout << cgicc::HTTPStatusHeader(403,
        # 																					 "Forbidden request");
        # 			return 0;
        # 		}
        #
        # 		std::string postprocess = cgi("postprocess");
        #
        # 		if (!postprocess.empty() && datasets.size() > 1) {
        # 			std::cout << cgicc::HTTPStatusHeader(400,
        # 																					 "Only one dataset[] value is allowed "
        # 																					 "when postprocess parameter is set ");
        # 			return 0;
        # 		}
        #
        # 		arkiweb::ProcessorFactory f;
        # 		f.target = "data";
        # 		f.outfile = "";
        # 		f.postprocess = postprocess;
        # 		std::auto_ptr<arkiweb::Processor> p(f.create());
        #
        # 		std::cout << cgicc::HTTPContentHeader("application/binary");
        # 		p->process(config, matcher);
        #

        # void BinaryDataEmitter::process(const arki::ConfigFile& cfg, const arki::Matcher& query) {
        #     auto out = std::unique_ptr<arki::utils::sys::NamedFileDescriptor>(new arki::core::Stdout);
        # 	arki::dataset::ByteQuery q;
        # 	if (postprocess.empty()) {
        # 		q.setData(query);
        # 	} else {
        # 		q.setPostprocess(query, postprocess);
        # 	}
        #     using authorization::User;
        #     std::vector<std::unique_ptr<arki::dataset::Reader>> datasets;
        #     arki::dataset::Merged merger;
        #     for (auto i = cfg.sectionBegin(); i != cfg.sectionEnd(); ++i) {
        #         merger.add_dataset(*(i->second));
        #     }
        #     merger.query_bytes(q, *out);
        # }

        return HttpResponse("TODO:data")


class DatasetsView(APIView):
    """
    datasets/ API endpoint.

    Return a list of dataset configuration files (as JSON), optionally limited
    to datasets that contain data for a query.
    """

    def get(self, request: HttpRequest, **kwargs: Any) -> HttpResponse:
        """Return configuration for the selected datasets."""
        # https://github.com/ARPA-SIMC/arkiweb?tab=readme-ov-file#get-the-list-of-datasets

        # Filter datasets by matcher
        self.use_datasets()
        config = self.filter_config_by_matcher(self.config)

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
        self.use_datasets()

        summary = arkimet.Summary()
        for name in self.config.keys():
            with self.arkimet_session.dataset_reader(name=name) as reader:
                reader.query_summary(self.matcher, summary=summary)

        with io.BytesIO() as buf:
            summary.write_short(buf, format="json", annotate=True)

            buf.seek(0)
            parsed = json.load(buf)

        # Convert arkimet's json format to the one expected by the API
        NAME_MAPS: dict[str, dict[str, str]] = {
            "origin": {
                "style": "s",
                "centre": "ce",
                "subcentre": "sc",
                "desc": "desc",
                "process": "pr",
                "process_type": "pt",
                "background_process_id": "bi",
                "process_id": "pi",
                "wmo": "wmo",
                "rad": "rad",
                "plc": "plc",
            },
            "product": {
                "style": "s",
                "origin": "or",
                "table": "ta",
                "product": "pr",
                "centre": "ce",
                "discipline": "di",
                "category": "ca",
                "number": "no",
                "table_version": "tv",
                "local_table_version": "ltv",
                "type": "ty",
                "subtype": "st",
                "local_subtype": "ls",
                "value": "va",
                "object": "ob",
                "id": "id",
            },
            "level": {
                "style": "s",
                "type": "lt",
                "scale": "sc",
                "scale1": "s1",
                "scale2": "s2",
                "value": "va",
                "value1": "v1",
                "value2": "v2",
                "l1": "l1",
                "l2": "l2",
                "min": "mi",
                "max": "ma",
            },
            "timerange": {
                "style": "s",
                "type": "ty",
                "unit": "un",
                "p1": "p1",
                "p2": "p2",
                "value": "va",
                "step_len": "sl",
                "step_unit": "su",
                "stat_type": "pt",
                "stat_len": "pl",
                "stat_unit": "pu",
            },
            "area": {
                "style": "s",
                "id": "id",
                "value": "va",
            },
            "proddef": {
                "style": "s",
                "value": "va",
            },
            "run": {
                "style": "s",
                "value": "va",
            },
        }
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
        self.use_datasets()

        summary = arkimet.Summary()
        for name in self.config.keys():
            with self.arkimet_session.dataset_reader(name=name) as reader:
                reader.query_summary(self.matcher, summary=summary)

        with io.BytesIO() as buf:
            summary.write(buf, format="json", annotate=True)

            buf.seek(0)
            parsed = json.load(buf)

        return JsonResponse(parsed)
