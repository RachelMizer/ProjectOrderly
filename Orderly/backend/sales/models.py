from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class SalesImportBatch(models.Model):
    """
    Tracks each imported monthly sales file.
    Example: 08-2025_sales.csv
    """

    file_name = models.CharField(max_length=255, unique=True)
    month = models.PositiveSmallIntegerField()
    year = models.PositiveSmallIntegerField()
    imported_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-year", "-month", "-imported_at"]
        constraints = [
            models.CheckConstraint(
                condition=Q(month__gte=1) & Q(month__lte=12),
                name="sales_batch_month_between_1_12",
            ),
            models.CheckConstraint(
                condition=Q(year__gte=2000),
                name="sales_batch_year_gte_2000",
            ),
            models.CheckConstraint(
                condition=~Q(file_name=""),
                name="sales_batch_file_name_not_empty",
            ),
        ]

    def clean(self):
        errors = {}

        if not self.file_name or not self.file_name.strip():
            errors["file_name"] = "File name cannot be blank."

        if self.month is None or not (1 <= self.month <= 12):
            errors["month"] = "Month must be between 1 and 12."

        if self.year is None or self.year < 2000:
            errors["year"] = "Year must be 2000 or later."

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        if self.file_name:
            self.file_name = self.file_name.strip()

        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.file_name} ({self.month:02d}/{self.year})"


class DailySale(models.Model):
    """
    One row per daily CSV sales record.
    Links to ProductVariant, but also stores name snapshots so reporting
    still works even if catalog names change later.
    """

    sale_date = models.DateField()

    variant = models.ForeignKey(
        "catalog.ProductVariant",
        on_delete=models.PROTECT,
        related_name="daily_sales",
    )

    import_batch = models.ForeignKey(
        "sales.SalesImportBatch",
        on_delete=models.PROTECT,
        related_name="daily_sales",
    )

    product_name = models.CharField(max_length=255)
    variant_name = models.CharField(max_length=255)

    units_sold = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    daily_revenue = models.DecimalField(max_digits=12, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-sale_date", "product_name", "variant_name"]
        constraints = [
            models.UniqueConstraint(
                fields=["sale_date", "variant"],
                name="uniq_daily_sale_per_variant_per_day",
            ),
            models.CheckConstraint(
                condition=Q(units_sold__gte=0),
                name="daily_sale_units_sold_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(unit_price__gte=0),
                name="daily_sale_unit_price_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(daily_revenue__gte=0),
                name="daily_sale_daily_revenue_gte_0",
            ),
            models.CheckConstraint(
                condition=~Q(product_name=""),
                name="daily_sale_product_name_not_empty",
            ),
            models.CheckConstraint(
                condition=~Q(variant_name=""),
                name="daily_sale_variant_name_not_empty",
            ),
        ]

    def clean(self):
        errors = {}

        if self.sale_date is None:
            errors["sale_date"] = "Sale date is required."

        if self.variant_id is None:
            errors["variant"] = "Variant is required."

        if self.import_batch_id is None:
            errors["import_batch"] = "Import batch is required."

        if not self.product_name or not self.product_name.strip():
            errors["product_name"] = "Product name cannot be blank."

        if not self.variant_name or not self.variant_name.strip():
            errors["variant_name"] = "Variant name cannot be blank."

        if self.units_sold is None or self.units_sold < 0:
            errors["units_sold"] = "Units sold must be 0 or greater."

        if self.unit_price is None or self.unit_price < 0:
            errors["unit_price"] = "Unit price must be 0 or greater."

        if self.daily_revenue is None or self.daily_revenue < 0:
            errors["daily_revenue"] = "Daily revenue must be 0 or greater."

        if (
            self.units_sold is not None
            and self.unit_price is not None
            and self.daily_revenue is not None
        ):
            expected = (Decimal(self.units_sold) * self.unit_price).quantize(
                Decimal("0.01")
            )
            actual = self.daily_revenue.quantize(Decimal("0.01"))
            if expected != actual:
                errors["daily_revenue"] = (
                    f"Daily revenue must equal units_sold × unit_price ({expected})."
                )

        if self.variant_id:
            expected_product_name = self.variant.product.name
            expected_variant_name = self.variant.name

            if self.product_name and self.product_name.strip() != expected_product_name:
                errors["product_name"] = (
                    f"Product name must match linked variant product: "
                    f"{expected_product_name}."
                )

            if self.variant_name and self.variant_name.strip() != expected_variant_name:
                errors["variant_name"] = (
                    f"Variant name must match linked variant name: "
                    f"{expected_variant_name}."
                )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        if self.product_name:
            self.product_name = self.product_name.strip()

        if self.variant_name:
            self.variant_name = self.variant_name.strip()

        if self.variant_id:
            if not self.product_name:
                self.product_name = self.variant.product.name
            if not self.variant_name:
                self.variant_name = self.variant.name

        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return (
            f"{self.sale_date} | {self.product_name} - {self.variant_name} | "
            f"{self.units_sold} sold | ${self.daily_revenue}"
        )