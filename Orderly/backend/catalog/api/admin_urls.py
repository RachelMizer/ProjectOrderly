from django.urls import path

from .admin_views import (
    AdminCategoryDetailView,
    AdminCategoryListCreateView,
    AdminModifierGroupDetailView,
    AdminModifierGroupListCreateView,
    AdminModifierOptionDetailView,
    AdminModifierOptionListCreateView,
    AdminProductDetailView,
    AdminProductListCreateView,
    AdminProductVariantDetailView,
    AdminProductVariantListCreateView,
    AdminVariantDetailView,
    AdminVariantListCreateView,
)

urlpatterns = [
    path("categories", AdminCategoryListCreateView.as_view(), name="admin_categories"),
    path("categories/<int:categoryId>", AdminCategoryDetailView.as_view(), name="admin_category_detail"),
    path("products", AdminProductListCreateView.as_view(), name="admin_products"),
    path("products/<int:productId>", AdminProductDetailView.as_view(), name="admin_product_detail"),
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
    path("variants", AdminVariantListCreateView.as_view(), name="admin_variants"),
    path("variants/<int:variantId>", AdminVariantDetailView.as_view(), name="admin_variant_detail"),
    path("modifier-groups", AdminModifierGroupListCreateView.as_view(), name="admin_modifier_groups"),
    path(
        "modifier-groups/<int:groupId>",
        AdminModifierGroupDetailView.as_view(),
        name="admin_modifier_group_detail",
    ),
    path(
        "modifier-groups/<int:groupId>/options",
        AdminModifierOptionListCreateView.as_view(),
        name="admin_modifier_options",
    ),
    path(
        "modifier-groups/<int:groupId>/options/<int:optionId>",
        AdminModifierOptionDetailView.as_view(),
        name="admin_modifier_option_detail",
    ),
]
