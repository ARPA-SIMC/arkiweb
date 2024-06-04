from pathlib import Path

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
