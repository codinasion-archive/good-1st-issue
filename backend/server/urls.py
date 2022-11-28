from django.urls import path
from . import views

urlpatterns = [
    # Github webhook
    path("update/", views.ServerUpdateView.as_view(), name="ServerUpdateView"),
]
