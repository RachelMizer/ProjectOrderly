"""
Service-layer utilities for the Orders app.

This module contains business logic used by the Orders API views,
particularly the draft-order (cart) functionality.

Separating business logic into a service layer helps keep API views
thin and focused on HTTP request/response handling while ensuring
that order-related rules are implemented in a single reusable place.

Key responsibilities implemented here include:

- Creating or retrieving a customer's active draft order (cart)
- Adding items to the cart
- Updating or removing cart items
- Recalculating order totals after cart changes
- Verifying that an order item belongs to the authenticated customer

These helpers are used by the following endpoints:

    POST   /api/v1/orders/draft
    POST   /api/v1/orders/items
    PATCH  /api/v1/orders/items/{orderItemId}

By centralizing this logic, the application maintains consistency
across views and simplifies testing and future enhancements
(such as modifier support and pricing rules).
"""

from decimal import Decimal
from django.db.models import Sum
from orders.models import Order, OrderItem, OrderStatus


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

    subtotal = (
        order.items.aggregate(total=Sum("item_total"))["total"]
        or Decimal("0.00")
    )

    # Placeholder until tax rules are finalized
    tax_amount = Decimal("0.00")

    order.subtotal = subtotal
    order.tax_amount = tax_amount
    order.save()

    return order


def add_item_to_order(order, variant, quantity):
    """
    Add a variant to the order.

    For B3.2.2, if the variant is already in the draft order,
    increase its quantity instead of creating a duplicate row.
    """

    order_item = order.items.filter(variant=variant).first()

    if order_item:
        order_item.quantity += quantity
        order_item.save()
    else:
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