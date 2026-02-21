from django.contrib import admin
from .models import Category, Product, ProductVariant, ModifierGroup, ModifierOption


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "supplier", "has_variants", "has_modifiers")
    list_filter = ("category", "has_variants", "has_modifiers")
    search_fields = ("name",)


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("product", "name", "sku", "unit_price", "stock_quantity", "reorder_level")
    list_filter = ("product",)
    search_fields = ("product__name", "name", "sku")


@admin.register(ModifierGroup)
class ModifierGroupAdmin(admin.ModelAdmin):
    list_display = ("variant", "name", "required", "min_selections", "max_selections")
    list_filter = ("required",)
    search_fields = ("variant__product__name", "variant__name", "name")


@admin.register(ModifierOption)
class ModifierOptionAdmin(admin.ModelAdmin):
    list_display = ("group", "name", "price_adjustment")
    search_fields = ("group__name", "name")

