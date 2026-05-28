from django.db import models


class Region(models.Model):
    name = models.CharField(max_length=120, unique=True)
    country = models.CharField(max_length=100, default="US", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class StateProvince(models.Model):
    name = models.CharField(max_length=120)
    abbreviation = models.CharField(max_length=10, blank=True, default="")
    region = models.ForeignKey(
        Region,
        on_delete=models.CASCADE,
        related_name="states",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        unique_together = [("region", "name")]

    def __str__(self):
        abbr = f" ({self.abbreviation})" if self.abbreviation else ""
        return f"{self.name}{abbr} — {self.region.name}"


class Location(models.Model):
    location_number = models.PositiveIntegerField(unique=True)
    name = models.CharField(max_length=200)
    region = models.ForeignKey(
        Region,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="locations",
    )
    state_province = models.ForeignKey(
        StateProvince,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="locations",
    )
    manager_name = models.CharField(max_length=200, blank=True, default="")
    address = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=120, blank=True, default="")
    state = models.CharField(max_length=2, blank=True, default="")
    zip_code = models.CharField(max_length=10, blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["location_number"]

    def __str__(self):
        return f"#{self.location_number} {self.name}"
