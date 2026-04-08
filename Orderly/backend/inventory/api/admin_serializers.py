from rest_framework import serializers

from inventory.models import InventoryItem


class AdminInventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "name",
            "stock_quantity",
            "unit_of_measure",
            "reorder_level",
        ]
        read_only_fields = ["id"]

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
            and reorder_level > stock_quantity
        ):
            raise serializers.ValidationError(
                {"reorder_level": "Reorder level cannot exceed stock quantity."}
            )

        return attrs