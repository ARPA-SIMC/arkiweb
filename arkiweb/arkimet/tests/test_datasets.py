import tempfile
from contextlib import ExitStack, contextmanager
from pathlib import Path
from typing import Optional

from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase, override_settings

from arkiweb.arkimet.models import User
from arkiweb.arkimet.views import DatasetsView


class DatasetsTests(TestCase):
    def setUp(self):
        self.stack = ExitStack()
        self.stack.__enter__()
        self.addCleanup(self.stack.__exit__, None, None, None)
        self.workdir = Path(self.stack.enter_context(tempfile.TemporaryDirectory()))

    def make_view(self, url: str = "/", user: Optional[User] = None) -> DatasetsView:
        """Instantiate the test view."""
        factory = RequestFactory()
        request = factory.get(url)
        if user is None:
            request.user = AnonymousUser()
        else:
            request.user = user
        view = DatasetsView()
        view.setup(request)
        return view

    def write_config(self, text: str) -> None:
        """Write an arkimet config file and configure django to use it."""
        config = self.workdir / "arkimet.cfg"
        config.write_text(text)
        self.stack.enter_context(override_settings(ARKIWEB_CONFIG=config.as_posix()))

    def test_get_dataset_config(self) -> None:
        self.write_config(
            """
[test1]

[test2]
"""
        )
        view = self.make_view("/datasets")
        cfg = view.get_dataset_config()
        self.assertEqual(cfg["test1"]["id"], "test1")
        self.assertEqual(cfg["test1"]["allowed"], "true")
        self.assertEqual(cfg["test2"]["id"], "test2")
        self.assertEqual(cfg["test2"]["allowed"], "true")
        self.assertEqual(len(cfg), 2)

    def test_get_dataset_config_restricted(self) -> None:
        self.write_config(
            """
[test1]
restrict = user

[test2]
"""
        )
        view = self.make_view("/datasets", user=User(username="user"))
        cfg = view.get_dataset_config()
        self.assertEqual(cfg["test1"]["id"], "test1")
        self.assertEqual(cfg["test1"]["allowed"], "true")
        self.assertEqual(cfg["test2"]["id"], "test2")
        self.assertEqual(cfg["test2"]["allowed"], "false")
        self.assertEqual(len(cfg), 2)

    def test_get_dataset_config_filtered(self) -> None:
        self.write_config(
            """
[test1]

[test2]
"""
        )
        view = self.make_view("/datasets?datasets%5B%5D=test1")
        cfg = view.get_dataset_config()
        self.assertEqual(cfg["test1"]["id"], "test1")
        self.assertEqual(cfg["test1"]["allowed"], "true")
        self.assertEqual(len(cfg), 1)
