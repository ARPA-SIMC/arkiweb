from django.test import TestCase
from django.urls import reverse

from arkiweb.arkimet.views import DatasetsView

from .utils import APITestMixin


class DatasetsTests(APITestMixin[DatasetsView], TestCase):
    view_class = DatasetsView

    def test_get(self) -> None:
        self.add_dataset("test1")
        self.add_dataset("test2", postprocess=["foo", "bar"])
        response = self.client.get(reverse("arkimet:datasets"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "datasets": [
                    {
                        "id": "test1",
                        "name": "test1",
                        "allowed": "false",
                        "bounding": "",
                        "description": "",
                        "postprocess": [""],
                    },
                    {
                        "id": "test2",
                        "name": "test2",
                        "allowed": "false",
                        "bounding": "",
                        "description": "",
                        "postprocess": ["foo", "bar"],
                    },
                ]
            },
        )
