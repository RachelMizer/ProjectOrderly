from rest_framework import serializers

from catalog.models import (
    Category,
    Product,
    ProductVariant,
    ModifierGroup,
    ModifierOption,
)

##################
# READ SERIALIZERS
##################


class ReadCategoriesSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "imageUrl"]

    # Will use later to support images. For now, returns None for imageUrl field to match API Contract
    def get_imageUrl(self, obj):
        return None


class ReadProductSerializer(serializers.ModelSerializer):
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

    # Will use later to support images. For now, returns None for imageUrl field to match API Contract
    def get_imageUrl(self, obj):
        return None


class ReadVariantSerializer(serializers.ModelSerializer):
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


class ReadModifierOptionSerializer(serializers.ModelSerializer):
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


class ReadModifierGroupSerializer(serializers.ModelSerializer):
    minSelections = serializers.IntegerField(source="min_selections")
    maxSelections = serializers.IntegerField(source="max_selections")
    options = ReadModifierOptionSerializer(many=True, read_only=True)
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


####################
# CREATE SERIALIZERS
####################


class CreateCategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["name"]

    def validate_name(self, value):
        if Category.objects.filter(name=value).exists():
            raise serializers.ValidationError("category name not unique")
        return value


class CreateProductsSerializer(serializers.ModelSerializer):
    supplierId = serializers.IntegerField(
        source="supplier_id", required=False, allow_null=True
    )

    class Meta:
        model = Product
        fields = ["name", "supplierId"]

    def validate(self, data):
        category_id = self.context.get("categoryId")

        if not Category.objects.filter(id=category_id).exists():
            raise serializers.ValidationError("invalid categoryId")

        name = data.get("name")

        if Product.objects.filter(category_id=category_id, name=name).exists():
            raise serializers.ValidationError("name not unique")

        return data

    def create(self, validated_data):
        category_id = self.context.get("categoryId")

        return Product.objects.create(
            category_id=category_id,
            has_variants=False,
            has_modifiers=False,
            **validated_data
        )


class CreateVariantsSerializer(serializers.ModelSerializer):
    SKU = serializers.CharField(source="sku")
    unitPrice = serializers.DecimalField(
        max_digits=10, decimal_places=2, source="unit_price"
    )
    stockQuantity = serializers.IntegerField(source="stock_quantity", required=False)
    reorderLevel = serializers.IntegerField(source="reorder_level", required=False)

    class Meta:
        model = ProductVariant
        fields = [
            "name",
            "SKU",
            "unitPrice",
            "stockQuantity",
            "reorderLevel",
        ]

    def validate(self, data):
        product_id = self.context.get("productId")

        if not Product.objects.filter(id=product_id).exists():
            raise serializers.ValidationError("invalid productId")

        name = data.get("name")
        sku = data.get("sku")
        unit_price = data.get("unit_price")
        stock_quantity = data.get("stock_quantity")
        reorder_level = data.get("reorder_level")

        if ProductVariant.objects.filter(product_id=product_id, name=name).exists():
            raise serializers.ValidationError("name not unique in product")

        if ProductVariant.objects.filter(sku=sku).exists():
            raise serializers.ValidationError("SKU not unique")

        if unit_price is not None and unit_price < 0:
            raise serializers.ValidationError("unitPrice must be >= 0")

        if stock_quantity is not None and stock_quantity < 0:
            raise serializers.ValidationError("stockQuantity must be >= 0")

        if reorder_level is not None and reorder_level < 0:
            raise serializers.ValidationError("reorderLevel must be >= 0")

        return data

    def create(self, validated_data):
        product_id = self.context.get("productId")

        return ProductVariant.objects.create(product_id=product_id, **validated_data)


class CreateModifierGroupsSerializer(serializers.ModelSerializer):
    minSelections = serializers.IntegerField(source="min_selections")
    maxSelections = serializers.IntegerField(source="max_selections")

    class Meta:
        model = ModifierGroup
        fields = [
            "name",
            "required",
            "minSelections",
            "maxSelections",
        ]

    def validate(self, data):
        variant_id = self.context.get("variantId")

        if not ProductVariant.objects.filter(id=variant_id).exists():
            raise serializers.ValidationError("invalid variantId")

        name = data.get("name")
        min_sel = data.get("min_selections", 0)
        max_sel = data.get("max_selections")
        required = data.get("required")

        if ModifierGroup.objects.filter(variant_id=variant_id, name=name).exists():
            raise serializers.ValidationError("name not unique per variant")

        if min_sel < 0:
            raise serializers.ValidationError("minSelections must be >= 0")

        if max_sel < min_sel:
            raise serializers.ValidationError("maxSelections must be >= minSelections")

        if required and min_sel < 1:
            raise serializers.ValidationError(
                "required groups must have minSelections >= 1"
            )

        return data

    def create(self, validated_data):
        variant_id = self.context.get("variantId")

        return ModifierGroup.objects.create(variant_id=variant_id, **validated_data)


class CreateModifierOptionsSerializer(serializers.ModelSerializer):
    priceAdjustment = serializers.DecimalField(
        max_digits=10, decimal_places=2, source="price_adjustment"
    )

    class Meta:
        model = ModifierOption
        fields = [
            "name",
            "priceAdjustment",
        ]

    def validate(self, data):
        group_id = self.context.get("groupId")

        if not ModifierGroup.objects.filter(id=group_id).exists():
            raise serializers.ValidationError("invalid groupId")

        name = data.get("name")

        if ModifierOption.objects.filter(group_id=group_id, name=name).exists():
            raise serializers.ValidationError("name not unique")

        return data

    def create(self, validated_data):
        group_id = self.context.get("groupId")

        return ModifierOption.objects.create(group_id=group_id, **validated_data)


####################
# UPDATE SERIALIZERS
####################


class UpdateCategoriesSerializer(serializers.ModelSerializer):
    pass


class UpdateProductsSerializer(serializers.ModelSerializer):
    pass


class UpdateVariantsSerializer(serializers.ModelSerializer):
    pass


class UpdateModifierGroupsSerializer(serializers.ModelSerializer):
    pass


class UpdateModifierOptionsSerializer(serializers.ModelSerializer):
    pass
