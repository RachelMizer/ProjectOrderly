"""
Service-layer utilities for the Orders app.

This module contains business logic used by the Orders API views,
including draft-order (cart) functionality and order submission logic.

Separating business logic into a service layer helps keep API views
thin and focused on HTTP request/response handling while ensuring
that order-related rules are implemented in a single reusable place.

Key responsibilities implemented here include:

- Creating or retrieving a customer's active draft order (cart)
- Adding items to the cart
- Updating or removing cart items
- Recalculating order totals after cart changes
- Verifying that an order item belongs to the authenticated customer
- Validating whether a draft order can be submitted
- Transitioning an order from DRAFT to PENDING
- Fetching a customer's order safely for read-only detail/status endpoints

These helpers are used by the following endpoints:

    POST   /api/v1/orders/draft
    POST   /api/v1/orders/items
    PATCH  /api/v1/orders/items/{orderItemId}
    PATCH  /api/v1/orders/{orderId}/submit
    GET    /api/v1/orders/{orderId}S
    GET    /api/v1/orders/{orderId}/status

By centralizing this logic, the application maintains consistency
across views and simplifies testing and future enhancements
(such as modifier support, pricing rules, and order completion flows).
"""

from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db.models import Sum
from rest_framework.exceptions import NotFound, PermissionDenied

from accounts.models import CustomerProfile
from orders.models import Order, OrderItem, OrderItemModifier, OrderStatus
from .exceptions import NotAuthorizedException


def get_or_create_guest_draft_order(guest_email):
    """
    Return the guest's active DRAFT order identified by guest_email token.
    Create one if it does not exist.
    """
    order, created = Order.objects.get_or_create(
        guest_email=guest_email,
        status=OrderStatus.DRAFT,
        defaults={
            "subtotal": Decimal("0.00"),
            "tax_amount": Decimal("0.00"),
        },
    )
    return order, created


def order_item_belongs_to_guest(order_item, guest_email):
    """
    Return True if the order item belongs to the guest's active DRAFT order.
    """
    return (
        order_item.order.guest_email == guest_email
        and order_item.order.status == OrderStatus.DRAFT
    )


def get_order_for_guest(order_id, guest_email):
    """
    Return an order if it exists and belongs to the given guest token.

    Raises:
    - NotFound if the order does not exist
    - NotAuthorizedException if the order belongs to a different guest
    """
    try:
        order = (
            Order.objects.prefetch_related(
                "items__variant__product",
                "items__modifiers__modifier_option__group",
            )
            .get(pk=order_id)
        )
    except Order.DoesNotExist as exc:
        raise NotFound("Order not found.") from exc

    if order.guest_email != guest_email:
        raise NotAuthorizedException("You do not have permission to access this order.")

    return order


def get_or_create_draft_order(customer_profile):
    """
    Return the customer's active DRAFT order.
    Create one if it does not exist.
    """

    order, created = Order.objects.get_or_create(
        customer=customer_profile,
        status=OrderStatus.DRAFT,
        defaults={
            "subtotal": Decimal("0.00"),
            "tax_amount": Decimal("0.00"),
        },
    )

    return order, created


def recalculate_order_totals(order):
    """
    Recalculate subtotal, tax_amount, and total_payment_due
    based on the order's current items.
    """

    item_subtotal = (
        order.items.aggregate(total=Sum("item_total"))["total"]
        or Decimal("0.00")
    )
    modifier_subtotal = (
        OrderItemModifier.objects.filter(order_item__order=order)
        .aggregate(total=Sum("price_adjustment_charged"))["total"]
        or Decimal("0.00")
    )
    subtotal = item_subtotal + modifier_subtotal

    # Wake County, NC: 4.75% state + 2.5% county/transit = 7.25%
    WAKE_COUNTY_TAX_RATE = Decimal("0.0725")
    tax_amount = (subtotal * WAKE_COUNTY_TAX_RATE).quantize(Decimal("0.01"))

    order.subtotal = subtotal
    order.tax_amount = tax_amount
    order.save()

    return order


def add_item_to_order(order, variant, quantity):
    """
    Add a variant to the order as a new line item.

    Each call creates a separate OrderItem so that individual
    items can be customized and edited independently.
    """

    order_item = OrderItem.objects.create(
        order=order,
        variant=variant,
        quantity=quantity,
        unit_price_charged=variant.unit_price,
    )

    return order_item


def update_order_item_quantity(order_item, quantity):
    """
    Update an order item's quantity.

    If quantity is 0, remove the item from the order.
    """

    if quantity == 0:
        order_item.delete()
        return None

    order_item.quantity = quantity
    order_item.save()

    return order_item


def order_item_belongs_to_customer(order_item, customer_profile):
    """
    Return True if the order item belongs to the customer's
    active DRAFT order.
    """

    return (
        order_item.order.customer_id == customer_profile.id
        and order_item.order.status == OrderStatus.DRAFT
    )


def validate_order_has_items(order):
    """
    Ensure the order contains at least one item before submission.
    """

    if not order.items.exists():
        raise ValidationError(
            "Order must contain at least one item before submission."
        )


def validate_order_identity(order):
    """
    Ensure the order satisfies customer XOR guest_email rules.

    A valid order must have either:
    - a customer, or
    - a guest_email

    but not both.
    """

    has_customer = order.customer_id is not None
    has_guest = bool(order.guest_email)

    if has_customer == has_guest:
        raise ValidationError(
            "Order must have either a customer or a guest email, but not both."
        )


def validate_order_availability(order):
    """
    Validate that all stock-tracked variants in the order have enough
    quantity available to fulfill the order.

    Variants with stock_quantity=None are treated as non-stock-tracked
    and are therefore considered available.
    """

    errors = []

    for item in order.items.select_related("variant", "variant__product"):
        variant = item.variant

        if (
            variant.stock_quantity is not None
            and variant.stock_quantity < item.quantity
        ):
            errors.append(
                f"Insufficient stock for {variant.product.name} - {variant.name}. "
                f"Requested {item.quantity}, available {variant.stock_quantity}."
            )

    if errors:
        raise ValidationError(errors)


def submit_order(order):
    """
    Recalculate totals and transition an order from DRAFT to PENDING.

    Pricing remains locked because OrderItem.unit_price_charged
    was captured when the item was added to the cart and is not
    overwritten during submission.
    """

    if order.status != OrderStatus.DRAFT:
        raise ValidationError("Only DRAFT orders can be submitted.")

    recalculate_order_totals(order)

    order.status = OrderStatus.PENDING
    order.save()

    return order


def get_customer_profile_for_user(user):
    """
    Return the CustomerProfile for the authenticated user.

    Raises PermissionDenied if the user does not have a customer profile.
    """

    try:
        return CustomerProfile.objects.get(user=user)
    except CustomerProfile.DoesNotExist as exc:
        raise PermissionDenied("You do not have permission to view orders.") from exc


def get_order_for_customer(order_id, customer_profile):
    """
    Return an order if it exists and belongs to the given customer profile.

    Raises:
    - NotFound if the order does not exist
    - PermissionDenied if the order belongs to a different customer
    """

    try:
        order = (
            Order.objects.select_related("customer")
            .prefetch_related(
                "items__variant__product",
                "items__modifiers__modifier_option__group",
            )
            .get(pk=order_id)
        )
    except Order.DoesNotExist as exc:
        raise NotFound("Order not found.") from exc

    if order.customer_id != customer_profile.id:
        raise NotAuthorizedException("You do not have permission to access this order.")

    return order

def get_order_history_for_customer(customer_profile):
    """
    Return the customer's non-draft orders, newest first.
    """

    return (
        Order.objects.filter(customer=customer_profile)
        .exclude(status=OrderStatus.DRAFT)
        .order_by("-created_at")
    )
