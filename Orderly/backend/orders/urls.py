"""
URL routes for the Orders API.

These routes expose both:
- customer draft/cart and order submission workflows
- business order fulfillment workflows
"""

from django.urls import path

from orders.views import (
    DraftOrderView,
    DraftOrderItemCreateView,
    DraftOrderItemUpdateView,
    DraftOrderItemModifierCreateView,
    DraftOrderItemModifierUpdateView,
    SubmitOrderView,
    OrderDetailView,
    OrderStatusView,
    OrderHistoryView,
    BusinessOrderListView,
    CompleteOrderView,
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

    # Add modifier to an existing draft order item
    # POST /api/v1/orders/items/{orderItemId}/modifiers
    path(
        "items/<int:orderItemId>/modifiers",
        DraftOrderItemModifierCreateView.as_view(),
        name="draft-order-item-modifier-create",
    ),

    # Update or remove an existing order item modifier
    # PATCH /api/v1/orders/items/modifiers/{orderModifierId}
    path(
        "items/modifiers/<int:orderModifierId>",
        DraftOrderItemModifierUpdateView.as_view(),
        name="draft-order-item-modifier-update",
    ),

    # Submit draft order
    # PATCH /api/v1/orders/{orderId}/submit
    path(
        "<int:orderId>/submit",
        SubmitOrderView.as_view(),
        name="submit-order",
    ),

    # Finalize order
    # PATCH /api/v1/orders/{orderId}/complete
    path(
        "<int:orderId>/complete",
        CompleteOrderView.as_view(),
        name="complete-order",
    ),

    # GET /api/v1/orders
    # Business-only order list (non-draft orders, optional status filter)
    path(
        "",
        BusinessOrderListView.as_view(),
        name="business-order-list",
    ),

    # Retrieve full order detail / receipt
    # GET /api/v1/orders/{orderId}
    path(
        "<int:orderId>",
        OrderDetailView.as_view(),
        name="order-detail",
    ),

    # Retrieve order status only
    # GET /api/v1/orders/{orderId}/status
    path(
        "<int:orderId>/status",
        OrderStatusView.as_view(),
        name="order-status",
    ),

    # Retrieve authenticated customer's order history
    # GET /api/v1/orders/me
    path(
        "me",
        OrderHistoryView.as_view(),
        name="order-history",
    ),
]