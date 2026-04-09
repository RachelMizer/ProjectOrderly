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