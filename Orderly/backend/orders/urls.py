"""
URL routes for the Orders API.

These routes expose the draft order (cart) functionality used by
the customer ordering workflow.
"""

from django.urls import path

from orders.views import (
    DraftOrderView,
    DraftOrderItemCreateView,
    DraftOrderItemUpdateView,
)

urlpatterns = [
    # Retrieve the customer's draft order (cart)
    # GET /api/v1/orders?status=DRAFT
    path(
        "",
        DraftOrderView.as_view(),
        name="draft-order",
    ),

    # Add item to draft order
    # POST /api/v1/orders/items
    path(
        "items",
        DraftOrderItemCreateView.as_view(),
        name="draft-order-item-create",
    ),

    # Update or remove item from draft order
    # PATCH /api/v1/orders/items/{orderItemId}
    path(
        "items/<int:orderItemId>",
        DraftOrderItemUpdateView.as_view(),
        name="draft-order-item-update",
    ),
]