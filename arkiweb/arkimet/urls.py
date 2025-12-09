from django.urls import path

from . import views

app_name = "arkimet"

urlpatterns = [
    path("data", views.DataView.as_view(), name="data"),
    path("datasets", views.DatasetsView.as_view(), name="datasets"),
    path("fields", views.FieldsView.as_view(), name="fields"),
    path("summary", views.SummaryView.as_view(), name="summary"),
]
