from django.urls import path

from .admin_views import AdminInventoryListCreateView, AdminInventoryDetailView

urlpatterns = [
    path("inventory", AdminInventoryListCreateView.as_view(), name="admin_inventory"),
    path(
        "inventory/<int:itemId>",
        AdminInventoryDetailView.as_view(),
        name="admin_inventory_detail",
    ),
]