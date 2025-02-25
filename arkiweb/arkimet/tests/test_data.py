from unittest import mock

from asgiref.sync import sync_to_async

from django.test import AsyncClient, TestCase
from django.urls import reverse

from arkiweb.arkimet.models import User
from arkiweb.arkimet.views import DataView

from .utils import APITestMixin


class Data(APITestMixin[DataView], TestCase):
    view_class = DataView

    def setUp(self):
        super().setUp()
        self.user = User.objects.create(username="user", arkimet_restrict="mygroup")
        self.user_asyncclient = AsyncClient()
        # I could not find a way to call force_login from an async method, so
        # I'm preparing a logged in client here
        self.user_asyncclient.force_login(self.user)

    def test_get_not_authenticated(self) -> None:
        self.add_dataset("test1")
        response = self.client.get(reverse("arkimet:data") + "?" + self.datasets_qs(["test1"]))
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.headers["content-type"], "text/plain")
        self.assertEqual(response.content.decode(), "you do not have the right credentials to download data")

    def test_get_unfiltered(self) -> None:
        self.client.force_login(self.user)
        self.add_dataset("test1", restrict=["mygroup"])
        response = self.client.get(reverse("arkimet:data"))
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.headers["content-type"], "text/plain")
        self.assertEqual(response.content.decode(), "you do not have the right credentials to download data")

    async def test_get(self) -> None:
        self.add_dataset("test1", restrict=["mygroup"])
        self.import_file("test1", "cosmo_t2m_2021_1_10_0_0_0+12.arkimet")
        with mock.patch(
            "arkiweb.arkimet.views.DataView.build_commandline", autospec=True, return_value=["/bin/seq", "1", "3"]
        ):
            response = await self.user_asyncclient.get(reverse("arkimet:data") + "?" + self.datasets_qs(["test1"]))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers["content-type"], "application/binary")

            buf = b""
            async for chunk in response.streaming_content:
                buf += chunk

            self.assertEqual(buf, b"1\n2\n3\n")
