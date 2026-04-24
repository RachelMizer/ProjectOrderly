from django.urls import path

from .admin_views import (
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
    AdminProductListCreateView,
    AdminProductDetailView,
    AdminProductVariantListCreateView,
    AdminProductVariantDetailView,
)

urlpatterns = [
    path("categories", AdminCategoryListCreateView.as_view(), name="admin_categories"),
    path("categories/<int:categoryId>", AdminCategoryDetailView.as_view(), name="admin_category_detail"),
    path("products", AdminProductListCreateView.as_view(), name="admin_products"),
    path(
        "products/<int:productId>",
        AdminProductDetailView.as_view(),
        name="admin_product_detail",
    ),
    path(
        "products/<int:productId>/variants",
        AdminProductVariantListCreateView.as_view(),
        name="admin_product_variants",
    ),
    path(
        "products/<int:productId>/variants/<int:variantId>",
        AdminProductVariantDetailView.as_view(),
        name="admin_product_variant_detail",
    ),
]