from rest_framework import serializers

from catalog.models import (
    Category,
    Product,
    ProductVariant,
    ModifierGroup,
    ModifierOption,
)


class CategoriesSerializer(serializers.Serializer):
    imageUrl = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "imageUrl"]

    # Will use later to support images. For now, returns None for imageUrl field to match API Contract
    def get_imageUrl(self, obj):
        return None


class ProductsSerializer(serializers.Serializer):
    pass


class VariantsSerializer(serializers.Serializer):
    pass


class ModifiersSerializer(serializers.Serializer):
    pass
