import sys
import tempfile
from contextlib import ExitStack, contextmanager
from pathlib import Path
from typing import Generic, Optional, Type, TypeVar

import arkimet

from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase, override_settings
from django.views.generic import View

from arkiweb.arkimet.models import User

VIEW = TypeVar("VIEW", bound=View)


class TestMixin:
    def setUp(self):
        self.stack = ExitStack()
        self.stack.__enter__()
        self.addCleanup(self.stack.__exit__, None, None, None)
        self.workdir = Path(self.stack.enter_context(tempfile.TemporaryDirectory()))
        self.config_path = self.workdir / "arkimet.cfg"
        self.datasets_path = self.workdir / "datasets"
        self.stack.enter_context(override_settings(ARKIWEB_CONFIG=self.config_path.as_posix()))
        self.testdata_path = Path(sys.argv[0]).parent / "testdata" / "data"

    def add_dataset(
        self,
        name: str,
        restrict: Optional[list[str]] = None,
        type: str = "iseg",
        step: str = "daily",
        format: str = "grib",
        postprocess: Optional[list[str]] = None,
    ) -> None:
        """Create the given dataset and add it to the config file."""
        path = self.datasets_path / name
        path.mkdir(parents=True)
        with self.config_path.open("at") as fd:
            print(f"[{name}]", file=fd)
            print(f"name = {name}", file=fd)
            print(f"type = {type}", file=fd)
            print(f"path = {path}", file=fd)
            print(f"step = {step}", file=fd)
            print(f"format = {format}", file=fd)
            if restrict:
                print(f"restrict = {','.join(restrict)}", file=fd)
            if postprocess:
                print(f"postprocess = {','.join(postprocess)}", file=fd)

    def import_file(self, dataset_name: str, file_name: str) -> None:
        """Import the given file from test data into the configured dataset."""
        with (self.testdata_path / file_name).open("rb") as src:
            batch = arkimet.Metadata.read_bundle(src)

        config = arkimet.cfg.Sections.parse(self.config_path.as_posix())
        with arkimet.dataset.Session() as session:
            ds_config = config[dataset_name]

            with session.dataset_writer(cfg=ds_config) as writer:
                writer.acquire_batch(batch)


class APITestMixin(TestMixin, Generic[VIEW]):
    view_class: Type[VIEW]

    def make_view(self, url: str = "/", user: Optional[User] = None) -> VIEW:
        """Instantiate the test view."""
        factory = RequestFactory()
        request = factory.get(url)
        if user is None:
            request.user = AnonymousUser()
        else:
            request.user = user
        view = self.view_class()
        view.setup(request)
        return view
