from pathlib import Path
from typing import Optional
from unittest import mock

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpRequest
from django.test import RequestFactory, TestCase, override_settings

from arkiweb.arkimet.models import User
from arkiweb.arkimet.arkimet import Arkimet, SyncArkimet

from .utils import TestMixin


class ArkimetTests(TestMixin, TestCase):
    def arkimet(self, url: str = "/", user: Optional[User] = None) -> Arkimet:
        """Instantiate the test view."""
        factory = RequestFactory()
        request = factory.get(url)
        if user is None:
            request.user = AnonymousUser()
        else:
            request.user = user
        res = SyncArkimet(request)
        res.init()
        return res

    def test_session_lifetime(self) -> None:
        with mock.patch("arkimet.dataset.Session", autospec=True):
            arki = self.arkimet()
            session = arki.session
            session.__enter__.assert_not_called()
            session.__exit__.assert_not_called()

            with arki:
                session.__enter__.assert_called_once()
                session.__exit__.assert_not_called()

            session.__enter__.assert_called_once()
            session.__exit__.assert_called_once()

    def test_config_path(self) -> None:
        test = self.workdir / "test.cfg"
        test.write_text("")
        with override_settings(ARKIWEB_CONFIG=test.as_posix()):
            with self.arkimet() as arki:
                self.assertEqual(arki.config_path, test)

        with override_settings():
            if hasattr(settings, "ARKIWEB_CONFIG"):
                del settings.ARKIWEB_CONFIG
            with self.assertRaisesRegexp(ImproperlyConfigured, "missing settings.ARKIWEB_CONFIG"):
                self.arkimet()

    def test_config(self) -> None:
        # Anonymous user always has allowed=False
        self.add_dataset("test1")
        self.add_dataset("test2")
        with self.arkimet() as arki:
            cfg = arki.config
            self.assertEqual(cfg["test1"]["id"], "test1")
            self.assertEqual(cfg["test1"]["allowed"], "false")
            self.assertEqual(cfg["test2"]["id"], "test2")
            self.assertEqual(cfg["test2"]["allowed"], "false")
            self.assertEqual(len(cfg), 2)

            filtered = arki.config_allowed
            self.assertEqual(filtered.keys(), ())

    def test_config_restricted(self) -> None:
        # Authenticated user applies restrict
        self.add_dataset("test1", restrict=["myorg"])
        self.add_dataset("test2")
        with self.arkimet(user=User(username="user", arkimet_restrict="myorg")) as arki:
            cfg = arki.config
            self.assertEqual(cfg["test1"]["id"], "test1")
            self.assertEqual(cfg["test1"]["allowed"], "true")
            self.assertEqual(cfg["test2"]["id"], "test2")
            self.assertEqual(cfg["test2"]["allowed"], "false")
            self.assertEqual(len(cfg), 2)

            filtered = arki.config_allowed
            self.assertEqual(filtered.keys(), ("test1",))

    def test_config_empty_restrict(self) -> None:
        # Authenticated user with empty restrict is like anonymous
        self.add_dataset("test1", restrict=["myorg"])
        self.add_dataset("test2")
        with self.arkimet(user=User(username="user", arkimet_restrict="")) as arki:
            cfg = arki.config
            self.assertEqual(cfg["test1"]["id"], "test1")
            self.assertEqual(cfg["test1"]["allowed"], "false")
            self.assertEqual(cfg["test2"]["id"], "test2")
            self.assertEqual(cfg["test2"]["allowed"], "false")
            self.assertEqual(len(cfg), 2)

            filtered = arki.config_allowed
            self.assertEqual(filtered.keys(), ())

    def test_config_filtered(self) -> None:
        self.add_dataset("test1")
        self.add_dataset("test2")
        with self.arkimet("/datasets?datasets%5B%5D=test1") as arki:
            cfg = arki.config
            self.assertEqual(cfg["test1"]["id"], "test1")
            self.assertEqual(cfg["test1"]["allowed"], "false")
            self.assertEqual(len(cfg), 1)

    def test_dataset_names(self) -> None:
        with self.arkimet("/fields?datasets%5B%5D=foo&datasets%5B%5D=bar") as arki:
            self.assertEqual(arki.dataset_names, {"bar", "foo"})

    def test_matcher(self) -> None:
        with self.arkimet() as arki:
            self.assertEqual(arki.matcher.expanded, "")

        with self.arkimet("/datasets?query=product:GRIB2") as arki:
            self.assertEqual(arki.matcher.expanded, "product:GRIB2")

    def test_use_datasets(self) -> None:
        self.add_dataset("test1")
        self.add_dataset("test2")
        with self.arkimet() as arki:
            self.assertEqual(arki.session.datasets(), [])
            arki.use_datasets()
            self.assertEqual(sorted(ds.name for ds in arki.session.datasets()), ["test1", "test2"])


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
