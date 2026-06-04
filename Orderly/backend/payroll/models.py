from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class PayPeriod(models.Model):
    store = models.ForeignKey(
        "locations.Location",
        on_delete=models.CASCADE,
        related_name="pay_periods",
    )
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_pay_periods",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_date"]
        unique_together = [("store", "name")]

    def clean(self):
        if self.start_date and self.end_date and self.end_date <= self.start_date:
            raise ValidationError({"end_date": "End date must be after start date."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.store} — {self.name} ({self.start_date} to {self.end_date})"


class PunchRecord(models.Model):
    IN  = "IN"
    OUT = "OUT"
    PUNCH_CHOICES = [(IN, "Clock In"), (OUT, "Clock Out")]

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="punch_records",
    )
    store = models.ForeignKey(
        "locations.Location",
        on_delete=models.CASCADE,
        related_name="punch_records",
    )
    timestamp = models.DateTimeField()
    punch_type = models.CharField(max_length=3, choices=PUNCH_CHOICES)
    note = models.CharField(max_length=200, blank=True, default="")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="punches_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

    @property
    def is_editable(self):
        return timezone.now() - self.timestamp <= timedelta(days=30)

    def __str__(self):
        return f"{self.employee.username} — {self.punch_type} at {self.timestamp}"
