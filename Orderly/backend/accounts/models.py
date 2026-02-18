
from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models


class UserRole(models.TextChoices):
    CUSTOMER = "CUSTOMER", "Customer"
    BUSINESS = "BUSINESS", "Business User"


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
    state = models.CharField(max_length=2, blank=True)
    zipcode = models.CharField(max_length=10, blank=True)

    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[RegexValidator(r"^[0-9+\-\s()]*$", "Enter a valid phone number.")],
    )

    def __str__(self) -> str:
        return f"CustomerProfile for {self.user.username}"

