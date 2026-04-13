from django.urls import path

from .admin_views import (
    AdminInventoryListCreateView,
    AdminInventoryDetailView,
    AdminLowStockView,   # ✅ add this
)

urlpatterns = [
    path("inventory", AdminInventoryListCreateView.as_view(), name="admin_inventory"),

    path(
        "inventory/<int:itemId>",
        AdminInventoryDetailView.as_view(),
        name="admin_inventory_detail",
    ),

    # ✅ NEW endpoint
    path(
        "inventory/low-stock",
        AdminLowStockView.as_view(),
        name="admin_low_stock",
    ),
]