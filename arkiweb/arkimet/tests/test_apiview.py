from pathlib import Path
from unittest import mock

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.test import RequestFactory, TestCase, override_settings

from arkiweb.arkimet.models import User
from arkiweb.arkimet.views import APIView

from .utils import APITestMixin


class TestView(APIView):
    """Concrete test version of APIView."""

    pass


class APIViewTests(APITestMixin[TestView], TestCase):
    view_class = TestView

    def test_session_presence(self) -> None:
        view = self.make_view("/datasets")
        self.assertTrue(hasattr(view, "arkimet_session"))

        view.dispatch(view.request)
        self.assertFalse(hasattr(view, "arkimet_session"))

    def test_session_lifetime(self) -> None:
        with mock.patch("arkimet.dataset.Session", autospec=True):
            view = self.make_view("/datasets")
            session = view.arkimet_session
            session.__enter__.assert_called_once()
            session.__exit__.assert_not_called()
            view.dispatch(view.request)
            session.__enter__.assert_called_once()
            session.__exit__.assert_called_once()

    def test_session_del(self) -> None:
        with mock.patch("arkimet.dataset.Session", autospec=True):
            view = self.make_view("/datasets")
            session = view.arkimet_session
            session.__enter__.assert_called_once()
            session.__exit__.assert_not_called()
            del view
            session.__enter__.assert_called_once()
            session.__exit__.assert_called_once()

    def test_config_path(self) -> None:
        with override_settings(ARKIWEB_CONFIG="test"):
            view = self.make_view()
            self.assertEqual(view.config_path, Path("test"))

        with override_settings():
            if hasattr(settings, "ARKIWEB_CONFIG"):
                del settings.ARKIWEB_CONFIG
            view = self.make_view()
            with self.assertRaisesRegexp(ImproperlyConfigured, "missing settings.ARKIWEB_CONFIG"):
                view.config_path

    def test_config(self) -> None:
        self.add_dataset("test1")
        self.add_dataset("test2")
        view = self.make_view("/")
        cfg = view.config
        self.assertEqual(cfg["test1"]["id"], "test1")
        self.assertEqual(cfg["test1"]["allowed"], "true")
        self.assertEqual(cfg["test2"]["id"], "test2")
        self.assertEqual(cfg["test2"]["allowed"], "true")
        self.assertEqual(len(cfg), 2)

    def test_config_restricted(self) -> None:
        self.add_dataset("test1", restrict=["user"])
        self.add_dataset("test2")
        view = self.make_view("/", user=User(username="user"))
        cfg = view.config
        self.assertEqual(cfg["test1"]["id"], "test1")
        self.assertEqual(cfg["test1"]["allowed"], "true")
        self.assertEqual(cfg["test2"]["id"], "test2")
        self.assertEqual(cfg["test2"]["allowed"], "false")
        self.assertEqual(len(cfg), 2)

    def test_config_filtered(self) -> None:
        self.add_dataset("test1")
        self.add_dataset("test2")
        view = self.make_view("/datasets?datasets%5B%5D=test1")
        cfg = view.config
        self.assertEqual(cfg["test1"]["id"], "test1")
        self.assertEqual(cfg["test1"]["allowed"], "true")
        self.assertEqual(len(cfg), 1)

    def test_dataset_names(self) -> None:
        view = self.make_view("/fields?datasets%5B%5D=foo&datasets%5B%5D=bar")
        self.assertEqual(view.dataset_names, {"bar", "foo"})

    def test_matcher(self) -> None:
        view = self.make_view("/datasets")
        self.assertEqual(view.matcher.expanded, "")

        view = self.make_view("/datasets?query=product:GRIB2")
        self.assertEqual(view.matcher.expanded, "product:GRIB2")

    def test_use_datasets(self) -> None:
        self.add_dataset("test1")
        self.add_dataset("test2")
        view = self.make_view("/")
        self.assertEqual(view.arkimet_session.datasets(), [])
        view.use_datasets()
        self.assertEqual(sorted(ds.name for ds in view.arkimet_session.datasets()), ["test1", "test2"])


#    def dataset_has_data(self, name: str) -> bool:
#        """Check if a dataset has data for the current matcher."""
#        with self.arkimet_session.dataset_reader(name) as reader:
#            summary = reader.query_summary(self.matcher)
#        return summary.count > 0
#
#    def filter_config_by_matcher(self, config: arkimet.cfg.Sections) -> arkimet.cfg.Sections:
#        """Filter config keeping only datasets that have data for self.matcher."""
#        if self.matcher.expanded == "":  # TODO: implement matcher.empty()
#            return config
#
#        filtered = arkimet.cfg.Sections()
#        for name, section in config.items():
#            if self.dataset_has_data(name):
#                filtered[name] = section
#        return filtered
