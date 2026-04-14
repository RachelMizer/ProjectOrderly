from django.urls import path
from .views import (
    SalesSummaryView,
    BestSellersView,
    WorstSellersView,
    SalesByCategoryView,
)

urlpatterns = [
    path("sales/summary", SalesSummaryView.as_view(), name="sales-summary"),
    path("sales/best-sellers", BestSellersView.as_view(), name="best-sellers"),
    path("sales/worst-sellers", WorstSellersView.as_view(), name="worst-sellers"),
    path("sales/by-category", SalesByCategoryView.as_view(), name="sales-by-category"),
]
