from unittest import mock
from typing import Any, AsyncGenerator

from asgiref.sync import sync_to_async

from django.test import AsyncClient, TestCase
from django.urls import reverse

from arkiweb.arkimet.models import User
from arkiweb.arkimet.views import DataView, StreamingAdapter

from .utils import APITestMixin


class MockQuery:
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        self.arki_query = "dummy"
        self.shutdown_called = False
        self.gen_count = 0

    async def generate_data(self) -> AsyncGenerator[bytes, None]:
        for i in range(10):
            self.gen_count += 1
            yield b"data"

    async def shutdown(self) -> None:
        self.shutdown_called = True


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
            "arkiweb.arkimet.arkimet.DataQuery.build_commandline", autospec=True, return_value=["/bin/seq", "1", "3"]
        ):
            response = await self.user_asyncclient.get(reverse("arkimet:data") + "?" + self.datasets_qs(["test1"]))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers["content-type"], "application/binary")

            buf = b""
            async for chunk in response.streaming_content:
                buf += chunk

            self.assertEqual(buf, b"1\n2\n3\n")

    async def test_stream(self) -> None:
        self.add_dataset("test1", restrict=["mygroup"])
        with mock.patch("arkiweb.arkimet.views.DataQuery", new=MockQuery):
            response = await self.user_asyncclient.get(reverse("arkimet:data") + "?" + self.datasets_qs(["test1"]))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers["content-type"], "application/binary")

            count = 0
            async for chunk in response.streaming_content:
                self.assertEqual(chunk, b"data")
                count += 1
            self.assertEqual(count, 10)

    async def test_stream_closed(self) -> None:
        self.add_dataset("test1", restrict=["mygroup"])
        with mock.patch("arkiweb.arkimet.views.DataQuery", new=MockQuery) as query:
            response = await self.user_asyncclient.get(reverse("arkimet:data") + "?" + self.datasets_qs(["test1"]))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers["content-type"], "application/binary")

            # Dig out the MockQuery object that has been created
            for closer in response._resource_closers:
                if (cself := getattr(closer, "__self__", None)) is None:
                    continue
                if cself.__class__ == StreamingAdapter:
                    adapter = cself
                    mock_query = cself.query
                    break
            else:
                self.fail("could not find the MockQuery object in the response")

            async for chunk in response.streaming_content:
                self.assertEqual(chunk, b"data")
                break
            response.close()

            await adapter.shutdown_coro

            self.assertTrue(mock_query.shutdown_called)
            self.assertEqual(mock_query.gen_count, 1)
