from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q


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
            models.CheckConstraint(
                condition=(
                    (Q(customer__isnull=False) & Q(guest_email__isnull=True))
                    | (Q(customer__isnull=True) & Q(guest_email__isnull=False))
                ),
                name="order_customer_xor_guest_email",
            )
        ]



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
    price_adjustment_charged = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["order_item", "modifier_option"],
                name="uniq_modifier_option_per_order_item",
            )
        ]

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

    def __str__(self) -> str:
        return f"Payment #{self.id} — Order #{self.order_id} — {self.total}"

