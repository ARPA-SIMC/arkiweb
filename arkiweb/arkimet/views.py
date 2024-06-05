import abc
from functools import cached_property
from pathlib import Path
from typing import Any

import arkimet
from arkimet.cmdline.base import RestrictSectionFilter

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpRequest, HttpResponse, HttpResponseServerError
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
    def dataset_names(self) -> list[str]:
        """Return the datasets requested."""
        return sorted(self.request.GET.getlist("datasets[]", []))

    @cached_property
    def matcher(self) -> arkimet.Matcher:
        """Return the arkimet query."""
        query = self.request.GET.get("query", "")
        return self.arkimet_session.matcher(query)

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

    def get_dataset_config(self) -> arkimet.cfg.Sections:
        """Return configuration for the selected datasets."""
        # Load configuration
        if self.request.user.is_authenticated:
            restrict_filter = RestrictSectionFilter(self.request.user.username)
        else:
            # TODO: this allows everything if not authenticated
            #       (it looks like the behaviour of C++ arkiweb)
            restrict_filter = RestrictSectionFilter("")

        cfg = arkimet.cfg.Sections.parse(self.config_path.as_posix())
        for name, section in cfg.items():
            section["id"] = name
            section["allowed"] = "true" if restrict_filter.is_allowed(section) else "false"

        names = self.dataset_names
        if not names:
            return cfg

        filtered = arkimet.cfg.Sections()
        for name, section in cfg.items():
            if name not in names:
                continue
            filtered[name] = section
        return filtered

    def get(self, request: HttpRequest, **kwargs: Any) -> HttpResponse:
        # https://github.com/ARPA-SIMC/arkiweb?tab=readme-ov-file#get-the-list-of-datasets

        config = self.get_dataset_config()

        # 		arkiweb::ProcessorFactory f;
        # 		f.target = "configfile";
        # 		f.format = "json";
        # 		f.outfile = "";
        # 		std::auto_ptr<arkiweb::Processor> p(f.create());
        #
        # 		std::cout << cgicc::HTTPContentHeader("application/json");
        # 		p->process(config, matcher);

        # void ConfigFileEmitter::process(const arki::ConfigFile& cfg, const arki::Matcher& query) {
        # 	arki::ConfigFile config;
        # 	// If the matcher is not empty, then filter datasets
        # 	if (!query.empty()) {
        #         // TODO: query the summary file if exists, otherwise query the dataset
        #         // and create it.
        # 		for (arki::ConfigFile::const_section_iterator i = cfg.sectionBegin();
        # 				 i != cfg.sectionEnd(); ++i) {
        # 			std::unique_ptr<arki::dataset::Reader> ds(arki::dataset::Reader::create(*i->second));
        # 			arki::Summary summary;
        #             utils::query_cached_summary(i->first, *ds, query, summary);
        # 			if (summary.count() > 0)
        # 			    config.mergeInto(i->first, *i->second);
        # 		}
        # 	} else {
        #         config.merge(cfg);
        #     }
        # 	arkiweb::encoding::BaseEncoder(*emitter).encode(config);
        # }

        return HttpResponse("TODO:datasets")


class FieldsView(APIView):
    """
    fields/ API endpoint.

    Given a list of datasets and a query, return the merged summary for that
    query for each dataset.
    """

    def get(self, request: HttpRequest, **kwargs: Any) -> HttpResponse:
        # https://github.com/ARPA-SIMC/arkiweb?tab=readme-ov-file#get-the-list-of-fields

        # 		std::vector<cgicc::FormEntry> forms;
        # 		arki::ConfigFile config;
        # 		arkiweb::utils::setToDefault(config, datasets);
        #
        # 		arkiweb::ProcessorFactory f;
        # 		f.target = "fields";
        # 		f.format = "json";
        # 		f.outfile = "";
        # 		std::auto_ptr<arkiweb::Processor> p(f.create());
        #
        # 		std::cout << cgicc::HTTPContentHeader("application/json");
        # 		p->process(config, matcher);

        # void FieldsEmitter::process(const arki::ConfigFile& cfg, const arki::Matcher& query) {
        # 	arki::Summary summary;
        # 	for (arki::ConfigFile::const_section_iterator i = cfg.sectionBegin();
        # 			 i != cfg.sectionEnd(); ++i) {
        # 		arki::Summary s;
        # 		std::unique_ptr<arki::dataset::Reader> ds(arki::dataset::Reader::create(*i->second));
        # 		ds->query_summary(query, s);
        # 		summary.add(s);
        # 	}
        #     using authorization::User;
        # 	arkiweb::encoding::FieldsEncoder(*emitter).encode(summary);
        # }

        return HttpResponse("TODO:fields")


class SummaryView(APIView):
    """summary/ API endpoint."""

    def get(self, requoest: HttpRequest, **kwargs: Any) -> HttpResponse:
        # https://github.com/ARPA-SIMC/arkiweb?tab=readme-ov-file#get-the-summary

        # 		std::vector<cgicc::FormEntry> forms;
        # 		arki::ConfigFile config;
        # 		arkiweb::utils::setToDefault(config, datasets);
        #
        # 		arkiweb::ProcessorFactory f;
        # 		f.target = "summary";
        # 		f.format = "json";
        # 		f.outfile = "";
        # 		std::auto_ptr<arkiweb::Processor> p(f.create());
        #
        # 		std::cout << cgicc::HTTPContentHeader("application/json");
        # 		p->process(config, matcher);

        # void SummaryEmitter::process(const arki::ConfigFile& cfg, const arki::Matcher& query) {
        # 	arki::Summary summary;
        # 	for (arki::ConfigFile::const_section_iterator i = cfg.sectionBegin();
        # 			 i != cfg.sectionEnd(); ++i) {
        # 		arki::Summary s;
        # 		std::unique_ptr<arki::dataset::Reader> ds(arki::dataset::Reader::create(*i->second));
        # 		ds->query_summary(query, s);
        # 		summary.add(s);
        # 	}
        # 	arkiweb::encoding::BaseEncoder(*emitter).encode(summary);
        # }
        return HttpResponse("TODO:summary")
