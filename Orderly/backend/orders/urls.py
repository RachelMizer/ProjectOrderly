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
    OrderDetailView,
    OrderStatusView,
    OrderHistoryView,
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