from django.urls import path

from .views import CategoriesView, ProductsView, VariantsView, ModifiersView


urlpatterns = [
    path("categories", CategoriesView.as_view(), name="list_categories"),
    path("products", ProductsView.as_view(), name="list_products"),
    path(
        "products/<int:productId>/variants",
        VariantsView.as_view(),
        name="list_variants",
    ),
    path(
        "products/<int:productId>/variants/<int:variantId>/modifiers",
        ModifiersView.as_view(),
        name="list_modifiers",
    ),
]
