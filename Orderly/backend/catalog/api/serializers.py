from rest_framework import serializers

from catalog.models import (
    Category,
    Product,
    ProductVariant,
    ModifierGroup,
    ModifierOption,
)


class CategorieSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "imageUrl"]

    # Will use later to support images. For now, returns None for imageUrl field to match API Contract
    def get_imageUrl(self, obj):
        return None


class ProductSerializer(serializers.ModelSerializer):
    hasVariants = serializers.BooleanField(source="has_variants")
    hasModifiers = serializers.BooleanField(source="has_modifiers")
    minPrice = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    imageUrl = serializers.SerializerMethodField()
    categoryId = serializers.IntegerField(source="category_id", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "categoryId",
            "hasVariants",
            "hasModifiers",
            "minPrice",
            "imageUrl",
        ]

    def get_imageUrl(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class VariantSerializer(serializers.ModelSerializer):
    unitPrice = serializers.DecimalField(
        source="unit_price", max_digits=10, decimal_places=2, read_only=True
    )
    stockQuantity = serializers.IntegerField(source="stock_quantity", read_only=True)
    imageUrl = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "name",
            "unitPrice",
            "stockQuantity",
            "imageUrl",
        ]

    def get_imageUrl(self, obj):
        return None


class ModifierOptionSerializer(serializers.ModelSerializer):
    priceAdjustment = serializers.DecimalField(
        source="price_adjustment", max_digits=10, decimal_places=2, read_only=True
    )
    imageUrl = serializers.SerializerMethodField()

    class Meta:
        model = ModifierOption
        fields = [
            "id",
            "name",
            "priceAdjustment",
            "imageUrl",
        ]

    # Will use later to support images. For now, returns None for imageUrl field to match API Contract
    def get_imageUrl(self, obj):
        return None


class ModifierGroupSerializer(serializers.ModelSerializer):
    minSelections = serializers.IntegerField(source="min_selections")
    maxSelections = serializers.IntegerField(source="max_selections")
    options = ModifierOptionSerializer(many=True, read_only=True)
    count = serializers.SerializerMethodField()

    class Meta:
        model = ModifierGroup
        fields = [
            "id",
            "name",
            "required",
            "minSelections",
            "maxSelections",
            "count",
            "options",
        ]

    def get_count(self, obj):
        return len(obj.options.all())
