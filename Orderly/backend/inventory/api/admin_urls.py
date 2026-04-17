from django.urls import path

from .admin_views import AdminInventoryListCreateView, AdminInventoryDetailView, AdminLowStockView
from .admin_reports_view import AdminSalesSummaryView, AdminProductPerformanceView

urlpatterns = [
    path("inventory", AdminInventoryListCreateView.as_view(), name="admin_inventory"),

    path(
        "inventory/<int:itemId>",
        AdminInventoryDetailView.as_view(),
        name="admin_inventory_detail",
    ),

    path(
        "inventory/low-stock",
        AdminLowStockView.as_view(),
        name="admin_low_stock",
    ),

    path(
        "reports/sales-summary",
        AdminSalesSummaryView.as_view(),
        name="admin_sales_summary",
    ),
    path(
        "reports/product-performance",
        AdminProductPerformanceView.as_view(),
        name="admin_product_performance",
    ),
]