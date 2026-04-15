from rest_framework import serializers

from inventory.models import InventoryItem
from catalog.models import ProductVariant


class AdminInventoryItemSerializer(serializers.ModelSerializer):
    affected_products = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "name",
            "stock_quantity",
            "unit_of_measure",
            "reorder_level",
            "affected_products",
        ]
        read_only_fields = ["id"]

    def get_affected_products(self, obj):
        names = set()
        for usage in obj.variant_usages.select_related("variant__product").all():
            names.add(usage.variant.product.name)
        for usage in obj.modifier_usages.select_related(
            "modifier_option__group__variant__product"
        ).all():
            names.add(usage.modifier_option.group.variant.product.name)
        return sorted(names)

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("name is required")
        return value.strip()

    def validate_stock_quantity(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative.")
        return value

    def validate_reorder_level(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Reorder level cannot be negative.")
        return value

    def validate(self, attrs):
        return attrs


class LowStockVariantSerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    stockQuantity = serializers.IntegerField(source="stock_quantity", read_only=True)
    reorderLevel = serializers.IntegerField(source="reorder_level", read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "name",
            "stockQuantity",
            "reorderLevel",
        ]


class LowStockInventorySerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    stockQuantity = serializers.DecimalField(
        source="stock_quantity",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    reorderLevel = serializers.DecimalField(
        source="reorder_level",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "name",
            "stockQuantity",
            "reorderLevel",
        ]