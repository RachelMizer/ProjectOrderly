from django.urls import path

from .admin_views import AdminProductListCreateView, AdminProductDetailView

urlpatterns = [
    path("products", AdminProductListCreateView.as_view(), name="admin_products"),
    path(
        "products/<int:productId>",
        AdminProductDetailView.as_view(),
        name="admin_product_detail",
    ),
]