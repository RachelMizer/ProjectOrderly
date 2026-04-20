from django.urls import path
from settings.api.views import StoreSettingsView

urlpatterns = [
    path("", StoreSettingsView.as_view(), name="store-settings"),
]