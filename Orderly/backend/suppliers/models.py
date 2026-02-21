from django.db import models

from django.db import models


class Supplier(models.Model):
    name = models.CharField(max_length=255, unique=True)

    # Minimal contact info (optional but useful)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)

    # Nice-to-have timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
