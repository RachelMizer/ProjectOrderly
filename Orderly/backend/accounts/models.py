from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models


class UserRoleChoices(models.TextChoices):
    CUSTOMER = "CUSTOMER", "Customer"
    BUSINESS = "BUSINESS", "Business User"


class UserRole(models.Model):
    """
    Lightweight role attached to every user.
    (Not a full 'profile' yet.)
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="role",
    )

    role_choice = models.CharField(
        max_length=20,
        choices=UserRoleChoices.choices,
        default=UserRoleChoices.CUSTOMER,
    )

    def __str__(self) -> str:
        return f"{self.user.username} ({self.role_choice})"

    def save(self, *args, **kwargs):
        # Ensures role validation runs even if created/updated outside forms/admin.
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

    # Keep these optional, but validate format if provided
    state = models.CharField(max_length=2, blank=True, validators=[STATE_VALIDATOR])
    zipcode = models.CharField(
        max_length=10, blank=True, validators=[ZIPCODE_VALIDATOR]
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[PHONE_VALIDATOR],
    )

    def __str__(self) -> str:
        return f"CustomerProfile for {self.user.username}"

    def clean(self):
        """
        Cross-field / cross-model validation:
        CustomerProfile should only exist for users whose UserRole.role == CUSTOMER.
        """
        # If the user doesn't have a UserRole yet, we can't validate role reliably.
        # (This can happen during initial object creation ordering.)
        profile = getattr(self.user, "role", None)
        if profile and profile.role != UserRoleChoices.CUSTOMER:
            raise ValidationError(
                {
                    "user": "CustomerProfile can only be created for users with role=CUSTOMER."
                }
            )

        # Optional: prevent partial invalid address combos
        if self.state and not self.zipcode:
            raise ValidationError(
                {"zipcode": "Zipcode is required when state is provided."}
            )

    def save(self, *args, **kwargs):
        # Makes sure clean() runs for programmatic saves too.
        self.full_clean()
        return super().save(*args, **kwargs)
