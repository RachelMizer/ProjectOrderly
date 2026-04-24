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
    showTagline = serializers.BooleanField(
        source="show_tagline",
        required=False,
    )
    storePhone = serializers.CharField(
        source="store_phone",
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

    # Storefront appearance
    pageBackgroundColor     = serializers.CharField(source="page_background_color",     required=False, allow_blank=True)
    headerSpecialTextColor  = serializers.CharField(source="header_special_text_color", required=False, allow_blank=True)
    headerTextColor         = serializers.CharField(source="header_text_color",         required=False, allow_blank=True)
    navBgColor              = serializers.CharField(source="nav_bg_color",              required=False, allow_blank=True)
    navLinkColor            = serializers.CharField(source="nav_link_color",            required=False, allow_blank=True)
    navTextColor            = serializers.CharField(source="nav_text_color",            required=False, allow_blank=True)
    mainLinkColor           = serializers.CharField(source="main_link_color",           required=False, allow_blank=True)
    mainTextColor           = serializers.CharField(source="main_text_color",           required=False, allow_blank=True)
    footerBgColor           = serializers.CharField(source="footer_bg_color",           required=False, allow_blank=True)
    footerLinkColor         = serializers.CharField(source="footer_link_color",         required=False, allow_blank=True)
    btnBgColor              = serializers.CharField(source="btn_bg_color",              required=False, allow_blank=True)
    btnTextColor            = serializers.CharField(source="btn_text_color",            required=False, allow_blank=True)
    sectionBg1Color         = serializers.CharField(source="section_bg_1_color",        required=False, allow_blank=True)
    sectionBg2Color         = serializers.CharField(source="section_bg_2_color",        required=False, allow_blank=True)
    fontChoice              = serializers.CharField(source="font_choice",               required=False, allow_blank=True)

    # Image fields
    storeImage = serializers.ImageField(
        source="store_image",
        required=False,
        allow_null=True,
    )
    favicon = serializers.ImageField(
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
            "showTagline",
            "storePhone",
            "hours",
            "storeAddress",
            "hqAddress",
            "storeImage",
            "favicon",
            "pageBackgroundColor",
            "headerSpecialTextColor",
            "headerTextColor",
            "navBgColor",
            "navLinkColor",
            "navTextColor",
            "mainLinkColor",
            "mainTextColor",
            "footerBgColor",
            "footerLinkColor",
            "btnBgColor",
            "btnTextColor",
            "sectionBg1Color",
            "sectionBg2Color",
            "fontChoice",
        ]

    def validate_taxRate(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Tax rate must be greater than or equal to 0."
            )
        return value