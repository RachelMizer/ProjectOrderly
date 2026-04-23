from rest_framework import serializers

from settings.models import StoreSettings


class StoreSettingsSerializer(serializers.ModelSerializer):
    # Existing fields
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

    # New fields
    storeTagline = serializers.CharField(
        source="store_tagline",
        required=False,
        allow_blank=True,
    )
    hours = serializers.CharField(
        required=False,
        allow_blank=True,
    )
    storeAddress = serializers.CharField(
        source="store_address",
        required=False,
        allow_blank=True,
    )
    hqAddress = serializers.CharField(
        source="hq_address",
        required=False,
        allow_blank=True,
    )

    # Image field
    storeImage = serializers.ImageField(
        source="store_image",
        required=False,
        allow_null=True,
    )

    class Meta:
        model = StoreSettings
        fields = [
            "taxRate",
            "contactEmail",
            "contactPhone",
            "storeName",
            "storeTagline",
            "hours",
            "storeAddress",
            "hqAddress",
            "storeImage",
        ]

    def validate_taxRate(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Tax rate must be greater than or equal to 0."
            )
        return value