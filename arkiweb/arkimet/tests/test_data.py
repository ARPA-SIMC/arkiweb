from unittest import mock

from django.test import AsyncClient, TestCase
from django.urls import reverse

from arkiweb.arkimet.views import DataView

from .utils import APITestMixin


class Data(APITestMixin[DataView], TestCase):
    view_class = DataView

    async def test_get(self) -> None:
        client = AsyncClient()
        self.add_dataset("test1")
        self.import_file("test1", "cosmo_t2m_2021_1_10_0_0_0+12.arkimet")
        with mock.patch(
            "arkiweb.arkimet.views.DataView.build_commandline", autospec=True, return_value=["seq", "1", "3"]
        ):
            response = await client.get(reverse("arkimet:data") + "?datasets%5B%5D=cosmo")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers["content-type"], "application/binary")

            buf = b""
            async for chunk in response.streaming_content:
                buf += chunk

            self.assertEqual(buf, b"1\n2\n3\n")
