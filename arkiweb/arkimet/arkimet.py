import contextlib
from functools import cached_property
from pathlib import Path

import arkimet
from arkimet.cmdline.base import RestrictSectionFilter

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpRequest


class Arkimet(contextlib.ExitStack):
    """Access arkimet datasets."""

    def __init__(self, request: HttpRequest) -> None:
        super().__init__()
        self.request = request
        self.session = arkimet.dataset.Session()

    def __enter__(self) -> "Arkimet":
        super().__enter__()
        self.enter_context(self.session)
        return self

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
        restrict_filter = RestrictSectionFilter(self.request.user.arkimet_restrict)
        config = arkimet.cfg.Sections.parse(self.config_path.as_posix())
        for name, section in config.items():
            section["id"] = name
            section["allowed"] = "true" if restrict_filter.is_allowed(section) else "false"

        # Filter config keeping only datasets named in self.dataset_names
        names = self.dataset_names
        if names is not None:
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
