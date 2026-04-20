from rest_framework import serializers

from settings.models import StoreSettings


class StoreSettingsSerializer(serializers.ModelSerializer):
    taxRate = serializers.DecimalField(
        source="tax_rate",
        max_digits=5,
        decimal_places=2,
        required=False,
    )
    contactEmail = serializers.EmailField(
        source="contact_email",
        required=False,
        allow_blank=True,
    )
    contactPhone = serializers.CharField(
        source="contact_phone",
        required=False,
        allow_blank=True,
    )
    storeName = serializers.CharField(
        source="store_name",
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = StoreSettings
        fields = ["taxRate", "contactEmail", "contactPhone", "storeName"]

    def validate_taxRate(self, value):
        if value < 0:
            raise serializers.ValidationError("Tax rate must be greater than or equal to 0.")
        return value