from django.urls import path

from . import views

app_name = "ui"

urlpatterns = [
    path("", views.HomepageView.as_view(), name="homepage"),
]
