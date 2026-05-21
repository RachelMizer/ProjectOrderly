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


class UserRoleChoices(models.TextChoices):
    STORE_MANAGER = "STORE_MANAGER", "Store Manager"
    EMPLOYEE = "EMPLOYEE", "Employee"
    CUSTOMER = "CUSTOMER", "Customer"
    EXECUTIVE = "EXECUTIVE", "Executive"
    SUPPORT = "SUPPORT", "Support"


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
        choices=UserRoleChoices.choices,
        default=UserRoleChoices.CUSTOMER,
    )
    class StatusChoices(models.TextChoices):
        ONLINE  = "ONLINE",  "Online"
        OFFLINE = "OFFLINE", "Offline"
        BUSY    = "BUSY",    "Busy"
        AWAY    = "AWAY",    "Away"

    password_changed_at = models.DateTimeField(null=True, blank=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    city   = models.CharField(max_length=120, blank=True, default="")
    state  = models.CharField(max_length=2,   blank=True, default="")
    status = models.CharField(
        max_length=10,
        choices=StatusChoices.choices,
        default=StatusChoices.OFFLINE,
    )

    def __str__(self) -> str:
        username = getattr(self.user, "username", str(self.user))
        return f"{username} ({self.role})"


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
    street_address = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=120, blank=True, default="")
    state = models.CharField(
        max_length=2,
        blank=True,
        default="",
        validators=[STATE_VALIDATOR],
    )
    zipcode = models.CharField(
        max_length=10,
        blank=True,
        default="",
        validators=[ZIPCODE_VALIDATOR],
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        default="",
        validators=[PHONE_VALIDATOR],
    )

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

        # Enforce that this user has a UserRole with role CUSTOMER
        profile = getattr(self.user, "profile", None)
        if profile is None:
            raise ValidationError({"user": "Selected user must have a UserRole."})

        if profile.role != UserRoleChoices.CUSTOMER:
            raise ValidationError({"user": "Selected user must have role CUSTOMER."})

        # Normalize fields (helpful for consistent validation)
        if self.state:
            self.state = self.state.strip().upper()
        if self.zipcode:
            self.zipcode = self.zipcode.strip()
        if self.phone:
            raw = self.phone.strip()
            self.phone = "".join(ch for ch in raw if ch.isdigit() or ch == "+")

    def save(self, *args, **kwargs):
        self.full_clean()  # ensures clean() runs on save()
        return super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"CustomerProfile for {self.user.username}"


class DeletedAccount(models.Model):
    first_name = models.CharField(max_length=150, blank=True, default="")
    last_name  = models.CharField(max_length=150, blank=True, default="")
    email      = models.EmailField()
    role       = models.CharField(max_length=20, blank=True, default="")
    deleted_at = models.DateTimeField(auto_now_add=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="deletions_performed",
    )
    deleted_by_name = models.CharField(max_length=300, blank=True, default="")

    class Meta:
        ordering = ["-deleted_at"]

    def __str__(self):
        return f"Deleted: {self.email} (by {self.deleted_by_name or 'unknown'})"