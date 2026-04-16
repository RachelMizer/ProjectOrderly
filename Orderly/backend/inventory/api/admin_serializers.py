from rest_framework import serializers

from inventory.models import InventoryItem


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
        stock_quantity = attrs.get(
            "stock_quantity",
            getattr(self.instance, "stock_quantity", None),
        )
        reorder_level = attrs.get(
            "reorder_level",
            getattr(self.instance, "reorder_level", None),
        )

        if (
            reorder_level is not None
            and stock_quantity is not None
            and stock_quantity > 0
            and reorder_level > stock_quantity
        ):
            raise serializers.ValidationError(
                {"reorder_level": "Reorder level cannot exceed stock quantity."}
            )

        return attrs