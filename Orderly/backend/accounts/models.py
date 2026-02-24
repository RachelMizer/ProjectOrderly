from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models


class UserRole(models.TextChoices):
    CUSTOMER = "CUSTOMER", "Customer"
    BUSINESS = "BUSINESS", "Business User"


# --- Validators must be defined BEFORE the models use them ---
STATE_VALIDATOR = RegexValidator(
    regex=r"^[A-Z]{2}$",
    message="State must be a 2-letter uppercase abbreviation (e.g., NC).",
)

ZIPCODE_VALIDATOR = RegexValidator(
    regex=r"^\d{5}(-\d{4})?$",
    message="Zipcode must be 5 digits or ZIP+4 (e.g., 27502 or 27502-1234).",
)

PHONE_VALIDATOR = RegexValidator(
    regex=r"^[0-9+\-\s()]*$",
    message="Enter a valid phone number.",
)


class UserProfile(models.Model):
    """
    Lightweight profile attached to every user.
    Stores role (customer vs business user).
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER,
    )

    def __str__(self) -> str:
        return f"{self.user.username} ({self.role})"

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)


class CustomerProfile(models.Model):
    """
    Customer-specific fields. Exists only for users with role=CUSTOMER.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_profile",
    )

    street_address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)

    state = models.CharField(
        max_length=2,
        blank=True,
        validators=[STATE_VALIDATOR],
    )
    zipcode = models.CharField(
        max_length=10,
        blank=True,
        validators=[ZIPCODE_VALIDATOR],
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[PHONE_VALIDATOR],
    )

    def __str__(self) -> str:
        return f"CustomerProfile for {self.user.username}"

    def clean(self):
        profile = getattr(self.user, "profile", None)
        if profile and profile.role != UserRole.CUSTOMER:
            raise ValidationError(
                {"user": "CustomerProfile can only be created for users with role=CUSTOMER."}
            )

        if self.state and not self.zipcode:
            raise ValidationError({"zipcode": "Zipcode is required when state is provided."})

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)