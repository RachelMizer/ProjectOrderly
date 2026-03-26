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
    SubmitOrderView,
    DraftOrderItemModifierCreateView,
    DraftOrderItemModifierUpdateView
)

urlpatterns = [
    # Retrieve the customer's draft order (cart)
    # POST /api/v1/orders/draft
    path(
        "draft",
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

    # Submit draft order
    # PATCH /api/v1/orders/{orderId}/submit
    path(
        "<int:orderId>/submit",
        SubmitOrderView.as_view(),
        name="submit-order",
    ),
    

    # Add Modifier to draft order
    # POST /api/v1/orders/items/{orderItemId}/modifiers
    path (
        "items/<int:orderItemId>/modifiers", 
        DraftOrderItemModifierCreateView.as_view(),
        name="draft-order-modifier-create"
    ),

    # Update or remove modifer from draft order
    # POST /api/v1/orders/items/{orderModifierId}
    path (
        "items/<int:orderModifierId>",
        DraftOrderItemModifierUpdateView.as_view(),
        name="draft-order-modifier-update"
    )
]