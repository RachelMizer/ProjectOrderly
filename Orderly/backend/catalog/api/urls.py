from django.urls import path

from .views import (
    CategoriesView,
    ReadProductsView,
    VariantsView,
    ReadModifiersView,
    CreateProductsView,
    CreateModifierGroupsView,
    CreateModifierOptionsView,
    UpdateCategoriesView,
    UpdateProductsView,
    UpdateVariantsView,
    UpdateModifierGroupsView,
    UpdateModifierOptionsView,
)


urlpatterns = [
    path("categories", CategoriesView.as_view(), name="get_create_category"),
    path("products", ReadProductsView.as_view(), name="list_products"),
    path(
        "products/<int:productId>/variants",
        VariantsView.as_view(),
        name="get_create_variants",
    ),
    path(
        "products/<int:productId>/variants/<int:variantId>/modifiers",
        ReadModifiersView.as_view(),
        name="list_modifiers",
    ),
    path(
        "categories/<int:categoryId>",
        UpdateCategoriesView.as_view(),
        name="update_category",
    ),
    path(
        "categories/<int:categoryId>/products",
        CreateProductsView.as_view(),
        name="create_product",
    ),
    path(
        "products/<int:productId>", UpdateProductsView.as_view(), name="update_product"
    ),
    path(
        "variants/<int:variantId>", UpdateVariantsView.as_view(), name="update_variant"
    ),
    path(
        "variants/<int:variantId>/modifier-groups",
        CreateModifierGroupsView.as_view(),
        name="create_modifier_group",
    ),
    path(
        "modifiers/groups/<int:groupId>",
        UpdateModifierGroupsView.as_view(),
        name="update_modifier_group",
    ),
    path(
        "modifier-groups/<int:groupId>/options",
        CreateModifierOptionsView.as_view(),
        name="create_modifier_option",
    ),
    path(
        "modifiers/options/<int:optionId>",
        UpdateModifierOptionsView.as_view(),
        name="update_modifier_option",
    ),
]
