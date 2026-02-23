from django.contrib import admin
from .models import Order, OrderItem, OrderItemModifier, Payment


class OrderItemModifierInline(admin.TabularInline):
    model = OrderItemModifier
    extra = 0


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "status", "customer", "guest_email", "total_payment_due", "created_at")
    list_filter = ("status",)
    search_fields = ("id", "guest_email", "customer__user__username", "customer__user__email")
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "variant", "quantity", "unit_price_charged", "item_total")
    search_fields = ("order__id", "variant__sku", "variant__name", "variant__product__name")
    inlines = [OrderItemModifierInline]


@admin.register(OrderItemModifier)
class OrderItemModifierAdmin(admin.ModelAdmin):
    list_display = ("order_item", "modifier_option", "price_adjustment_charged")
    search_fields = ("modifier_option__name", "order_item__order__id")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "payment_type", "total", "payment_date")
    list_filter = ("payment_type",)
    search_fields = ("order__id",)

