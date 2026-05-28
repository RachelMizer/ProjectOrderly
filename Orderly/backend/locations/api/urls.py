from django.urls import path
from .views import (
    LocationDetailView, LocationListView,
    RegionDetailView, RegionListView,
    StateProvinceDetailView, StateProvinceListView,
)

urlpatterns = [
    path("", LocationListView.as_view(), name="location-list"),
    path("<int:pk>/", LocationDetailView.as_view(), name="location-detail"),
    path("regions/", RegionListView.as_view(), name="region-list"),
    path("regions/<int:pk>/", RegionDetailView.as_view(), name="region-detail"),
    path("states/", StateProvinceListView.as_view(), name="state-list"),
    path("states/<int:pk>/", StateProvinceDetailView.as_view(), name="state-detail"),
]
