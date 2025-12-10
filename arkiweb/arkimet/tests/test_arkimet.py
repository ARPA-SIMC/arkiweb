import shutil
import sys
import textwrap
from pathlib import Path
from typing import Optional
from unittest import mock

import arkimet

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpRequest
from django.test import RequestFactory, TestCase, override_settings

from arkiweb.arkimet.models import User
from arkiweb.arkimet.arkimet import Arkimet, SyncArkimet, SelectMode, DataQuery

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
            with self.assertRaisesRegex(ImproperlyConfigured, "missing settings.ARKIWEB_CONFIG"):
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

    def test_config_skip_dataset_restrictions(self) -> None:
        # Anonymous user always has allowed=False
        self.add_dataset("test1")
        self.add_dataset("test2")
        with self.arkimet(user=User(username="user", is_superuser=True)) as arki:
            cfg = arki.config
            self.assertEqual(cfg["test1"]["id"], "test1")
            self.assertEqual(cfg["test1"]["allowed"], "true")
            self.assertEqual(cfg["test2"]["id"], "test2")
            self.assertEqual(cfg["test2"]["allowed"], "true")
            self.assertEqual(len(cfg), 2)

    def test_select_datasets_none_allowed(self) -> None:
        self.add_dataset("test1")
        self.add_dataset("test2")
        with self.arkimet() as arki:
            cfg = arki.select_datasets(only_allowed=True)
            self.assertEqual(cfg.keys(), ())

    def test_select_datasets_some_allowed(self) -> None:
        self.add_dataset("test1", restrict=["myorg"])
        self.add_dataset("test2")
        with self.arkimet(user=User(username="user", arkimet_restrict="myorg")) as arki:
            cfg = arki.select_datasets(only_allowed=True)
            self.assertEqual(cfg.keys(), ("test1",))

    def test_select_datasets_all(self) -> None:
        self.add_dataset("test1")
        self.add_dataset("test2")
        with self.arkimet("/datasets?" + self.datasets_qs(["test1"])) as arki:
            cfg = arki.select_datasets(only_allowed=False, select=SelectMode.ALL)
            self.assertEqual(cfg.keys(), ("test1", "test2"))

    def test_select_datasets_default_all(self) -> None:
        self.add_dataset("test1")
        self.add_dataset("test2")
        with self.arkimet("/datasets") as arki:
            cfg = arki.select_datasets(only_allowed=False, select=SelectMode.USER_DEFAULT_ALL)
            self.assertEqual(cfg.keys(), ("test1", "test2"))

        with self.arkimet("/datasets?" + self.datasets_qs(["test1"])) as arki:
            cfg = arki.select_datasets(only_allowed=False, select=SelectMode.USER_DEFAULT_ALL)
            self.assertEqual(cfg.keys(), ("test1",))

    def test_select_datasets_default_none(self) -> None:
        self.add_dataset("test1")
        self.add_dataset("test2")
        with self.arkimet("/datasets") as arki:
            cfg = arki.select_datasets(only_allowed=False, select=SelectMode.USER_DEFAULT_NONE)
            self.assertEqual(cfg.keys(), ())

        with self.arkimet("/datasets?" + self.datasets_qs(["test1"])) as arki:
            cfg = arki.select_datasets(only_allowed=False, select=SelectMode.USER_DEFAULT_NONE)
            self.assertEqual(cfg.keys(), ("test1",))

    def test_get_user_allowlist(self) -> None:
        self.add_dataset("test1")
        self.add_dataset("test2")

        for qs, mode, expected in (
            ("", SelectMode.ALL, ["test1", "test2"]),
            (self.datasets_qs(["test1"]), SelectMode.ALL, ["test1", "test2"]),
            ("", SelectMode.USER_DEFAULT_ALL, ["test1", "test2"]),
            (self.datasets_qs(["test1"]), SelectMode.USER_DEFAULT_ALL, ["test1"]),
            (self.datasets_qs(["test2"]), SelectMode.USER_DEFAULT_ALL, ["test2"]),
            ("", SelectMode.USER_DEFAULT_NONE, []),
            (self.datasets_qs(["test1"]), SelectMode.USER_DEFAULT_NONE, ["test1"]),
            (self.datasets_qs(["test2"]), SelectMode.USER_DEFAULT_NONE, ["test2"]),
        ):
            with self.subTest(qs=qs, mode=mode):
                with self.arkimet(f"/datasets?{qs}") as arki:
                    self.assertEqual(arki.get_user_allowlist(mode), frozenset(expected))

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


class TestDataQuery(TestMixin, TestCase):
    async def test_simple(self) -> None:
        with mock.patch.object(
            DataQuery, "build_commandline", autospec=True, return_value=[shutil.which("seq"), "1", "3"]
        ):
            query = DataQuery(arkimet.cfg.Sections(), None, "")
            data = []
            async for el in query.generate_data():
                data.append(el)
            await query.shutdown()
            self.assertEqual(data, [b"1\n2\n3\n"])

    async def test_log_error_code(self) -> None:
        with mock.patch.object(DataQuery, "build_commandline", autospec=True, return_value=[shutil.which("false")]):
            query = DataQuery(arkimet.cfg.Sections(), None, "")
            data = []
            with self.assertLogs() as lg:
                async for el in query.generate_data():
                    data.append(el)
                await query.shutdown()
            self.assertEqual(data, [])
            self.assertEqual(lg.output, ["WARNING:arkimet:arki-query returned with code 1"])

    async def test_log_stderr(self) -> None:
        with mock.patch.object(DataQuery, "build_commandline", autospec=True, return_value=[shutil.which("tar")]):
            query = DataQuery(arkimet.cfg.Sections(), None, "")
            data = []
            with self.assertLogs() as lg:
                async for el in query.generate_data():
                    data.append(el)
                await query.shutdown()
            self.assertEqual(data, [])
            self.assertRegex(lg.output[0], r"WARNING:arkimet:arki-query: .+/tar: You must specify one of the")
            self.assertEqual(lg.output[-1], "WARNING:arkimet:arki-query returned with code 2")

    async def test_close_stdout_write_stderr(self) -> None:
        script = self.workdir / "script.py"
        script.write_text(
            textwrap.dedent(
                """
                import sys
                sys.stdout.write("out")
                sys.stdout.close()
                sys.stderr.write("err")
                sys.stderr.close()
                raise SystemExit(0)
                """
            )
        )
        with mock.patch.object(
            DataQuery, "build_commandline", autospec=True, return_value=[sys.executable, script.as_posix()]
        ):
            query = DataQuery(arkimet.cfg.Sections(), None, "")
            data = []
            with self.assertLogs() as lg:
                async for el in query.generate_data():
                    data.append(el)
                await query.shutdown()
            self.assertEqual(data, [b"out"])
            self.assertEqual(lg.output, ["WARNING:arkimet:arki-query: err"])

    async def test_write_stdout_close_stderr(self) -> None:
        script = self.workdir / "script.py"
        script.write_text(
            textwrap.dedent(
                """
                import sys
                sys.stderr.close()
                sys.stdout.write("out")
                raise SystemExit(0)
                """
            )
        )
        with mock.patch.object(
            DataQuery, "build_commandline", autospec=True, return_value=[sys.executable, script.as_posix()]
        ):
            query = DataQuery(arkimet.cfg.Sections(), None, "")
            data = []
            async for el in query.generate_data():
                data.append(el)
            await query.shutdown()
            self.assertEqual(data, [b"out"])

    async def test_close_stdout_close_stderr(self) -> None:
        script = self.workdir / "script.py"
        script.write_text(
            textwrap.dedent(
                """
                import sys
                sys.stderr.close()
                sys.stdout.close()
                raise SystemExit(0)
                """
            )
        )
        with mock.patch.object(
            DataQuery, "build_commandline", autospec=True, return_value=[sys.executable, script.as_posix()]
        ):
            query = DataQuery(arkimet.cfg.Sections(), None, "")
            data = []
            async for el in query.generate_data():
                data.append(el)
            await query.shutdown()
            self.assertEqual(data, [])
