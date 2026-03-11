from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class Supplier(models.Model):
    name = models.CharField(max_length=255, unique=True)

    # Minimal contact info
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            # Prevent empty supplier names at DB level
            models.CheckConstraint(
                condition=~Q(name=""),
                name="supplier_name_not_empty",
            ),
        ]

    def clean(self):
        errors = {}

        # Name validation
        if not self.name or not self.name.strip():
            errors["name"] = "Supplier name cannot be blank."

        if self.name and len(self.name.strip()) < 2:
            errors["name"] = "Supplier name is too short."

        # Phone normalization sanity check (lightweight)
        if self.phone:
            cleaned_phone = self.phone.strip()
            if len(cleaned_phone) < 7:
                errors["phone"] = "Phone number looks invalid."

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        # Normalize whitespace
        if self.name:
            self.name = self.name.strip()

        if self.phone:
            self.phone = self.phone.strip()

        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name