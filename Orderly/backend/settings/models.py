from decimal import Decimal

from django.core.validators import RegexValidator, MinValueValidator
from django.db import models


PHONE_VALIDATOR = RegexValidator(
    regex=r"^\+?1?\d{10,15}$",
    message="Enter a valid phone number (10–15 digits, optional +country code).",
)


class StoreSettings(models.Model):
    # Core business info
    store_name = models.CharField(max_length=255, blank=True, default="")
    store_tagline = models.CharField(max_length=255, blank=True, default="")
    show_tagline = models.BooleanField(default=True)
    hours = models.CharField(max_length=255, blank=True, default="")

    # Media / branding
    store_image = models.ImageField(upload_to="store/", blank=True, null=True)
    favicon     = models.ImageField(upload_to="store/", blank=True, null=True)

    # Store contact
    store_phone = models.CharField(max_length=20, blank=True, default="")

    # Addresses
    store_address = models.TextField(blank=True, default="")
    hq_address = models.TextField(blank=True, default="")

    # Contact
    contact_email = models.EmailField(blank=True, default="")
    contact_phone = models.CharField(
        max_length=20,
        blank=True,
        default="",
        validators=[PHONE_VALIDATOR],
    )

    # Financial
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(0)],
    )

    # Storefront appearance
    page_background_color    = models.CharField(max_length=7, blank=True, default="#ffffff")
    header_special_text_color = models.CharField(max_length=7, blank=True, default="#111111")
    header_text_color        = models.CharField(max_length=7, blank=True, default="#333333")
    nav_bg_color             = models.CharField(max_length=7, blank=True, default="#222222")
    nav_link_color           = models.CharField(max_length=7, blank=True, default="#ffffff")
    nav_text_color           = models.CharField(max_length=7, blank=True, default="#ffffff")
    main_link_color          = models.CharField(max_length=7, blank=True, default="#555555")
    main_text_color          = models.CharField(max_length=7, blank=True, default="#333333")
    footer_bg_color          = models.CharField(max_length=7, blank=True, default="#222222")
    footer_link_color        = models.CharField(max_length=7, blank=True, default="#ffffff")
    btn_bg_color             = models.CharField(max_length=7, blank=True, default="#eeeeee")
    btn_text_color           = models.CharField(max_length=7, blank=True, default="#333333")
    section_bg_1_color       = models.CharField(max_length=7, blank=True, default="#f5f0e8")
    section_bg_2_color       = models.CharField(max_length=7, blank=True, default="#e8f0f5")
    font_choice              = models.CharField(max_length=50, blank=True, default="munson")

    # Metadata
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Store Settings"
        verbose_name_plural = "Store Settings"

    def save(self, *args, **kwargs):
        if not self.pk and StoreSettings.objects.exists():
            raise ValueError("Only one StoreSettings instance is allowed.")
        super().save(*args, **kwargs)

    def __str__(self):
        return "Store Settings"