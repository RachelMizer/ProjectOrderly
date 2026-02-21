
from django.conf import settings
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

