from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q, F


class OrderStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    PENDING = "PENDING", "Pending"
    PAID = "PAID", "Paid"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"


class PaymentType(models.TextChoices):
    CREDIT_CARD = "CREDIT_CARD", "Credit Card"
    CASH = "CASH", "Cash"
    OTHER = "OTHER", "Other"


class Order(models.Model):
    """
    Represents a single customer transaction.

    Supports:
      - registered customer orders (customer set)
      - guest checkout (guest_email set)
    """

    customer = models.ForeignKey(
        "accounts.CustomerProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    guest_email = models.EmailField(null=True, blank=True)

    order_date = models.DateTimeField(auto_now_add=True)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_payment_due = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.DRAFT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
        ]
        constraints = [
            # XOR: Either customer OR guest_email must be set, but not both.
            models.CheckConstraint(
                condition=(
                    (Q(customer__isnull=False) & Q(guest_email__isnull=True))
                    | (Q(customer__isnull=True) & Q(guest_email__isnull=False))
                ),
                name="order_customer_xor_guest_email",
            ),
            # Money fields must be >= 0
            models.CheckConstraint(
                condition=Q(subtotal__gte=0),
                name="order_subtotal_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(tax_amount__gte=0),
                name="order_tax_amount_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(total_payment_due__gte=0),
                name="order_total_payment_due_gte_0",
            ),
            # Total must equal subtotal + tax (DB-level integrity)
            models.CheckConstraint(
                condition=Q(total_payment_due=F("subtotal") + F("tax_amount")),
                name="order_total_equals_subtotal_plus_tax",
            ),
            # Only one DRAFT order per customer
        models.UniqueConstraint(
            fields=["customer"],
            condition=Q(status=OrderStatus.DRAFT),
            name="uniq_draft_order_per_customer",
        ),
        ]

    def clean(self):
        errors = {}

        # App-level XOR validation (friendlier than only DB error)
        has_customer = self.customer_id is not None
        has_guest = bool(self.guest_email)
        if has_customer == has_guest:  # both True or both False
            errors["customer"] = "Provide either a customer OR a guest email (not both)."
            errors["guest_email"] = "Provide either a customer OR a guest email (not both)."

        # Money ranges (extra safety beyond DB constraints)
        if self.subtotal is not None and self.subtotal < 0:
            errors["subtotal"] = "Subtotal cannot be negative."
        if self.tax_amount is not None and self.tax_amount < 0:
            errors["tax_amount"] = "Tax amount cannot be negative."
        if self.total_payment_due is not None and self.total_payment_due < 0:
            errors["total_payment_due"] = "Total payment due cannot be negative."

        # Cross-field: total must match subtotal + tax
        if (
            self.subtotal is not None
            and self.tax_amount is not None
            and self.total_payment_due is not None
        ):
            expected_total = (self.subtotal or Decimal("0")) + (self.tax_amount or Decimal("0"))
            # Quantize-safe compare (DecimalField will handle rounding)
            if self.total_payment_due != expected_total:
                errors["total_payment_due"] = "Total payment due must equal subtotal + tax amount."

        # Optional business rule: if not draft, require at least one item
        # (Skip if not saved yet; related manager not available without PK)
        if self.pk and self.status != OrderStatus.DRAFT:
            if not self.items.exists():
                errors["status"] = "Non-draft orders must have at least one item."

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        # Keep totals consistent automatically
        self.subtotal = self.subtotal or Decimal("0")
        self.tax_amount = self.tax_amount or Decimal("0")
        self.total_payment_due = (self.subtotal + self.tax_amount)

        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        who = self.customer.user.username if self.customer else (self.guest_email or "guest")
        return f"Order #{self.id} ({who})"


class OrderItem(models.Model):
    """
    Represents one purchased variant within an order.
    """

    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="items",
    )
    variant = models.ForeignKey(
        "catalog.ProductVariant",
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    unit_price_charged = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    item_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        indexes = [
            models.Index(fields=["order"]),
            models.Index(fields=["variant"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(unit_price_charged__gte=0),
                name="order_item_unit_price_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(item_total__gte=0),
                name="order_item_total_gte_0",
            ),
            # item_total must equal quantity * unit_price_charged
            models.CheckConstraint(
                condition=Q(item_total=F("quantity") * F("unit_price_charged")),
                name="order_item_total_equals_qty_times_unit_price",
            ),
        ]

    def clean(self):
        errors = {}

        if self.quantity is None or self.quantity < 1:
            errors["quantity"] = "Quantity must be at least 1."

        if self.unit_price_charged is not None and self.unit_price_charged < 0:
            errors["unit_price_charged"] = "Unit price cannot be negative."

        # Cross-field: item_total must match qty * unit price
        if self.quantity is not None and self.unit_price_charged is not None:
            expected_total = Decimal(self.quantity) * (self.unit_price_charged or Decimal("0"))
            if self.item_total is not None and self.item_total != expected_total:
                errors["item_total"] = "Item total must equal quantity * unit price charged."

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        # Auto-calc item_total
        qty = self.quantity or 0
        price = self.unit_price_charged or Decimal("0")
        self.item_total = Decimal(qty) * price

        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.order} — {self.variant} x{self.quantity}"


class OrderItemModifier(models.Model):
    """
    Captures which modifier options were selected for an OrderItem.
    """

    order_item = models.ForeignKey(
        "orders.OrderItem",
        on_delete=models.CASCADE,
        related_name="modifiers",
    )
    modifier_option = models.ForeignKey(
        "catalog.ModifierOption",
        on_delete=models.PROTECT,
        related_name="order_item_modifiers",
    )
    quantity = models.IntegerField(default=1)
    price_adjustment_charged = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["order_item", "modifier_option"],
                name="uniq_modifier_option_per_order_item",
            ),
            models.CheckConstraint(
                condition=Q(price_adjustment_charged__gte=0),
                name="order_item_modifier_price_adj_gte_0",
            ),
        ]

    def clean(self):
        if self.price_adjustment_charged is not None and self.price_adjustment_charged < 0:
            raise ValidationError({"price_adjustment_charged": "Price adjustment cannot be negative."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.order_item} — {self.modifier_option}"


class Payment(models.Model):
    """
    Payment attempts / transactions for an order.
    """

    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="payments",
    )
    payment_type = models.CharField(max_length=20, choices=PaymentType.choices)
    total = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    payment_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-payment_date"]
        indexes = [
            models.Index(fields=["order"]),
            models.Index(fields=["payment_date"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(total__gte=0),
                name="payment_total_gte_0",
            ),
        ]

    def clean(self):
        # Extra guard in case total is set directly
        if self.total is not None and self.total < 0:
            raise ValidationError({"total": "Payment total cannot be negative."})

        # Optional: block payments on cancelled orders
        if self.order_id and self.order and self.order.status == OrderStatus.CANCELLED:
            raise ValidationError({"order": "Cannot create payments for cancelled orders."})

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"Payment #{self.id} — Order #{self.order_id} — {self.total}"