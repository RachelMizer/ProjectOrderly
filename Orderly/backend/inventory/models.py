from django.db import models
from django.core.exceptions import ValidationError


class UnitOfMeasure(models.TextChoices):
    UNITS = "units", "Units"
    OZ = "oz", "Ounces"
    LB = "lb", "Pounds"
    G = "g", "Grams"
    ML = "ml", "Milliliters"
    L = "l", "Liters"


class InventoryItem(models.Model):
    name = models.CharField(max_length=200, unique=True)
    stock_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit_of_measure = models.CharField(
        max_length=10,
        choices=UnitOfMeasure.choices,
        default=UnitOfMeasure.UNITS,
    )
    reorder_level = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["name"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(stock_quantity__gte=0),
                name="inv_item_stock_qty_gte_0",
            ),
            models.CheckConstraint(
                condition=models.Q(reorder_level__isnull=True)
                | models.Q(reorder_level__gte=0),
                name="inv_item_reorder_level_gte_0_or_null",
            ),
            models.CheckConstraint(
                condition=models.Q(reorder_level__isnull=True)
                | models.Q(stock_quantity__gte=models.F("reorder_level")),
                name="inv_item_stock_qty_gte_reorder_level",
            ),
        ]

    def clean(self):
        if self.stock_quantity is not None and self.stock_quantity < 0:
            raise ValidationError(
                {"stock_quantity": "Stock quantity cannot be negative."}
            )

        if self.reorder_level is not None:
            if self.reorder_level < 0:
                raise ValidationError(
                    {"reorder_level": "Reorder level cannot be negative."}
                )
            if self.stock_quantity is not None and self.reorder_level > self.stock_quantity:
                raise ValidationError(
                    {"reorder_level": "Reorder level cannot exceed stock quantity."}
                )

        if not self.pk:
            return

        old = self.__class__.objects.get(pk=self.pk)
        if old.unit_of_measure != self.unit_of_measure:
            if self.variant_usages.exists() or self.modifier_usages.exists():
                raise ValidationError(
                    {
                        "unit_of_measure": (
                            "Cannot change unit_of_measure while this item is used in recipes."
                        )
                    }
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.name} ({self.unit_of_measure})"


class VariantInventoryUsage(models.Model):
    variant = models.ForeignKey(
        "catalog.ProductVariant",
        on_delete=models.CASCADE,
        related_name="inventory_usage",
    )
    inventory_item = models.ForeignKey(
        "inventory.InventoryItem",
        on_delete=models.PROTECT,
        related_name="variant_usages",
    )
    quantity_used = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["variant", "inventory_item"],
                name="uniq_inventory_item_per_variant_recipe",
            ),
            models.CheckConstraint(
                condition=models.Q(quantity_used__gt=0),
                name="variant_usage_qty_used_gt_0",
            ),
        ]

    def clean(self):
        if self.quantity_used is None or self.quantity_used <= 0:
            raise ValidationError(
                {"quantity_used": "Quantity used must be greater than 0."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return (
            f"{self.variant} uses {self.quantity_used} "
            f"{self.inventory_item.unit_of_measure} {self.inventory_item.name}"
        )


class ModifierInventoryUsage(models.Model):
    modifier_option = models.ForeignKey(
        "catalog.ModifierOption",
        on_delete=models.CASCADE,
        related_name="inventory_usage",
    )
    inventory_item = models.ForeignKey(
        "inventory.InventoryItem",
        on_delete=models.PROTECT,
        related_name="modifier_usages",
    )
    quantity_used = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["modifier_option", "inventory_item"],
                name="uniq_inventory_item_per_modifier_option",
            ),
            models.CheckConstraint(
                condition=models.Q(quantity_used__gt=0),
                name="modifier_usage_qty_used_gt_0",
            ),
        ]

    def clean(self):
        if self.quantity_used is None or self.quantity_used <= 0:
            raise ValidationError(
                {"quantity_used": "Quantity used must be greater than 0."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return (
            f"{self.modifier_option} uses {self.quantity_used} "
            f"{self.inventory_item.unit_of_measure} {self.inventory_item.name}"
        )