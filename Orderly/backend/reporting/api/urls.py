from django.urls import path
from .views import (
    SalesSummaryView,
    BestSellersView,
    WorstSellersView,
    SalesByCategoryView,
)
from .export_views import ExportOrdersView, ExportInventoryView, ExportProductsView

urlpatterns = [
    path("sales/summary", SalesSummaryView.as_view(), name="sales-summary"),
    path("sales/best-sellers", BestSellersView.as_view(), name="best-sellers"),
    path("sales/worst-sellers", WorstSellersView.as_view(), name="worst-sellers"),
    path("sales/by-category", SalesByCategoryView.as_view(), name="sales-by-category"),
    path("export/orders", ExportOrdersView.as_view(), name="export-orders"),
    path("export/inventory", ExportInventoryView.as_view(), name="export-inventory"),
    path("export/products", ExportProductsView.as_view(), name="export-products"),
]
