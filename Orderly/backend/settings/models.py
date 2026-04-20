from django.core.validators import RegexValidator, MinValueValidator
from django.db import models
from decimal import Decimal

PHONE_VALIDATOR = RegexValidator(
    regex=r"^\+?1?\d{10,15}$",
    message="Enter a valid phone number (10–15 digits, optional +country code).",
)


class StoreSettings(models.Model):
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(0)],
    )
    contact_email = models.EmailField(blank=True, default="")
    contact_phone = models.CharField(
        max_length=20,
        blank=True,
        default="",
        validators=[PHONE_VALIDATOR],
    )
    store_name = models.CharField(max_length=255, blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.pk and StoreSettings.objects.exists():
            raise ValueError("Only one StoreSettings instance is allowed.")
        super().save(*args, **kwargs)

    def __str__(self):
        return "Store Settings"
    
    class Meta:
        verbose_name = "Store Settings"
        verbose_name_plural = "Store Settings"
