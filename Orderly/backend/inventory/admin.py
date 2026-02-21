from django.contrib import admin
from .models import InventoryItem, VariantInventoryUsage, ModifierInventoryUsage


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ("name", "stock_quantity", "unit_of_measure", "reorder_level")
    search_fields = ("name",)
    list_filter = ("unit_of_measure",)


@admin.register(VariantInventoryUsage)
class VariantInventoryUsageAdmin(admin.ModelAdmin):
    list_display = ("variant", "inventory_item", "quantity_used")
    search_fields = ("variant__product__name", "variant__name", "inventory_item__name")


@admin.register(ModifierInventoryUsage)
class ModifierInventoryUsageAdmin(admin.ModelAdmin):
    list_display = ("modifier_option", "inventory_item", "quantity_used")
    search_fields = ("modifier_option__name", "inventory_item__name")

