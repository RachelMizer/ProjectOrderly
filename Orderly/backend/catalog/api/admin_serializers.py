from decimal import Decimal

from rest_framework import serializers

from catalog.models import Product, ProductVariant
from suppliers.models import Supplier


class AdminProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "category",
            "supplier",
            "name",
            "description",
            "has_variants",
            "has_modifiers",
        ]
        read_only_fields = ["id"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("name is required")
        return value.strip()


class AdminSupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ["id", "name", "email", "phone", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class AdminProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "product",
            "name",
            "sku",
            "unit_price",
            "stock_quantity",
            "reorder_level",
        ]
        read_only_fields = ["id", "product"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("name is required")
        return value.strip()

    def validate_unit_price(self, value):
        if value is None:
            raise serializers.ValidationError("unit_price is required")
        if value < Decimal("0.00"):
            raise serializers.ValidationError(
                "unit_price must be greater than or equal to 0"
            )
        return value

    def validate_stock_quantity(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Stock quantity cannot be set below 0.")
        return value

    def validate_reorder_level(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "reorder_level must be greater than or equal to 0"
            )
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

    def create(self, validated_data):
        product = self.context["product"]
        return ProductVariant.objects.create(product=product, **validated_data)


class AdminVariantInventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "name",
            "stock_quantity",
            "reorder_level",
        ]
        read_only_fields = ["id", "name"]

    def validate_stock_quantity(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Stock quantity cannot be set below 0.")
        return value

    def validate_reorder_level(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "reorder_level must be greater than or equal to 0"
            )
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