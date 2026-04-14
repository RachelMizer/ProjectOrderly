from django.contrib import admin

from .models import DailySale, SalesImportBatch


@admin.register(SalesImportBatch)
class SalesImportBatchAdmin(admin.ModelAdmin):
    list_display = ("file_name", "month", "year", "imported_at")
    search_fields = ("file_name",)
    list_filter = ("year", "month")
    ordering = ("-year", "-month", "-imported_at")


@admin.register(DailySale)
class DailySaleAdmin(admin.ModelAdmin):
    list_display = (
        "sale_date",
        "product_name",
        "variant_name",
        "units_sold",
        "unit_price",
        "daily_revenue",
        "import_batch",
    )
    search_fields = ("product_name", "variant_name", "variant__sku")
    list_filter = ("sale_date", "import_batch__year", "import_batch__month")
    autocomplete_fields = ("variant", "import_batch")
    ordering = ("-sale_date", "product_name", "variant_name")