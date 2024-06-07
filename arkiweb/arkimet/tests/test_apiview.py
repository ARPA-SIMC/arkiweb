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
