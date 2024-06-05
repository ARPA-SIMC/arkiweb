from pathlib import Path
from unittest import mock

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.test import RequestFactory, TestCase, override_settings

from arkiweb.arkimet.views import APIView


class TestView(APIView):
    """Concrete test version of APIView."""

    pass


class APIViewTests(TestCase):
    def make_view(self, url: str = "/") -> TestView:
        """Instantiate the test view."""
        factory = RequestFactory()
        request = factory.get(url)
        view = TestView()
        view.setup(request)
        return view

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

    def test_dataset_names(self) -> None:
        view = self.make_view("/fields?datasets%5B%5D=foo&datasets%5B%5D=bar")
        self.assertEqual(view.dataset_names, ["bar", "foo"])

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

    def test_matcher(self) -> None:
        view = self.make_view("/datasets")
        self.assertEqual(view.matcher.expanded, "")

        view = self.make_view("/datasets?query=product:GRIB2")
        self.assertEqual(view.matcher.expanded, "product:GRIB2")
