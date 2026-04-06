from rest_framework import serializers

from catalog.models import Product
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

class AdminSupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ["id", "name", "email", "phone", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]