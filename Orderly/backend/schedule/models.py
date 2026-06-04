from django.db import models
from django.conf import settings


class StoreShift(models.Model):
    store = models.ForeignKey(
        "locations.Location",
        on_delete=models.CASCADE,
        related_name="shifts",
    )
    name = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        unique_together = [("store", "name")]
        ordering = ["sort_order", "start_time"]

    def __str__(self):
        return f"{self.store} — {self.name} ({self.start_time:%H:%M}–{self.end_time:%H:%M})"


class ShiftAssignment(models.Model):
    store = models.ForeignKey(
        "locations.Location",
        on_delete=models.CASCADE,
        related_name="shift_assignments",
    )
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shift_assignments",
    )
    date = models.DateField()
    shift = models.ForeignKey(
        StoreShift,
        on_delete=models.CASCADE,
        related_name="assignments",
    )

    class Meta:
        unique_together = [("employee", "date", "shift")]
        ordering = ["date", "shift__sort_order", "shift__start_time"]

    def __str__(self):
        return f"{self.employee.get_full_name()} — {self.shift.name} on {self.date}"
