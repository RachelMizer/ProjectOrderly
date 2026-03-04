from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models


# --- Validators (simple + reusable) ---

PHONE_VALIDATOR = RegexValidator(
    regex=r"^\+?1?\d{10,15}$",
    message="Enter a valid phone number (10–15 digits, optional +country code).",
)

ZIPCODE_VALIDATOR = RegexValidator(
    regex=r"^\d{5}(-\d{4})?$",
    message="Enter a valid ZIP code (e.g., 12345 or 12345-6789).",
)

# You can tighten this to real USPS codes later if needed
STATE_VALIDATOR = RegexValidator(
    regex=r"^[A-Z]{2}$",
    message="State must be a 2-letter uppercase code (e.g., NC).",
)


class UserRole(models.TextChoices):
    BUSINESS = "BUSINESS", "Business"
    CUSTOMER = "CUSTOMER", "Customer"


class UserRole(models.Model):
    """
    Lightweight role attached to every user.
    (Not a full 'profile' yet.)
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


class CustomerProfile(models.Model):
    """
    Customer-specific info attached to a User.

    NOTE: user is REQUIRED. If user isn't selected in Admin, clean() should
    raise a ValidationError (not crash with RelatedObjectDoesNotExist).
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_profile",
    )

    email_verified = models.BooleanField(default=False)
    street_address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=2, blank=True)
    zipcode = models.CharField(max_length=10, blank=True)

    street_address = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=120, blank=True, default="")
    state = models.CharField(max_length=2, blank=True, default="", validators=[STATE_VALIDATOR])
    zipcode = models.CharField(max_length=10, blank=True, default="", validators=[ZIPCODE_VALIDATOR])
    phone = models.CharField(max_length=20, blank=True, default="", validators=[PHONE_VALIDATOR])

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        """
        Model-level validation.

        IMPORTANT: guard against missing user.
        Admin form validation should show a normal error instead of crashing.
        """
        super().clean()

        # If user is missing, stop here and raise a FORM error.
        # This prevents RelatedObjectDoesNotExist when accessing self.user.
        if not getattr(self, "user_id", None):
            raise ValidationError({"user": "User is required for a CustomerProfile."})

        # Optional: enforce that this user has a UserProfile with role CUSTOMER
        profile = getattr(self.user, "profile", None)
        if profile is None:
            raise ValidationError({"user": "Selected user must have a UserProfile."})

        if profile.role != UserRole.CUSTOMER:
            raise ValidationError({"user": "Selected user must have role CUSTOMER."})

        # Normalize fields (helpful for consistent validation)
        if self.state:
            self.state = self.state.strip().upper()
        if self.zipcode:
            self.zipcode = self.zipcode.strip()
        if self.phone:
            self.phone = "".join(ch for ch in self.phone.strip() if ch.isdigit() or ch == "+")

    def save(self, *args, **kwargs):
        self.full_clean()  # ensures clean() runs on save()
        return super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"CustomerProfile for {self.user.username}"
