"""
Views for the Orders API.

These endpoints implement draft-order (cart) functionality used by
customers while building an order.

Endpoints implemented here:

POST   /api/v1/orders/draft
POST   /api/v1/orders/items
PATCH  /api/v1/orders/items/{orderItemId}
"""

from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomerProfile
from orders.models import OrderItem
from orders.serializers import (
    AddDraftOrderItemSerializer,
    UpdateDraftOrderItemSerializer,
)
from orders.services import (
    add_item_to_order,
    get_or_create_draft_order,
    order_item_belongs_to_customer,
    recalculate_order_totals,
    update_order_item_quantity,
)


class DraftOrderView(APIView):
    """
    Create or retrieve a customer's draft order.

    Endpoint:
        POST /api/v1/orders/draft

    Behavior:
        - Returns the customer's current draft order
        - If no draft order exists, one is created automatically
        - Returns only the draft order id and whether it was newly created
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_customer_profile(self, request):
        """
        Retrieve the authenticated user's CustomerProfile.

        Returns None if the user does not have a customer profile.
        """
        try:
            return request.user.customer_profile
        except CustomerProfile.DoesNotExist:
            return None

    def post(self, request):
        """
        Handle POST requests to create or retrieve the draft order.
        """
        customer_profile = self.get_customer_profile(request)

        if not customer_profile:
            return Response(
                {
                    "error": "NOT_AUTHORIZED",
                    "message": "Authenticated user does not have a customer profile.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        order, created = get_or_create_draft_order(customer_profile)

        return Response(
            {
                "id": order.id,
                "created": created,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class DraftOrderItemCreateView(APIView):
    """
    Add a new item to the authenticated customer's draft order.

    Endpoint:
        POST /api/v1/orders/items

    Request Body Example:
        {
            "variantId": 5,
            "quantity": 2
        }

    Behavior:
        - Finds or creates the user's draft order
        - Adds the product variant to the cart
        - If the variant already exists in the cart, quantity increases
        - Recalculates cart totals
        - Returns a simple success response with orderId and orderItemId
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_customer_profile(self, request):
        """
        Retrieve the authenticated user's CustomerProfile.

        Returns None if the user does not have a customer profile.
        """
        try:
            return request.user.customer_profile
        except CustomerProfile.DoesNotExist:
            return None

    def post(self, request):
        """
        Handle POST requests for adding items to the cart.
        """
        customer_profile = self.get_customer_profile(request)

        if not customer_profile:
            return Response(
                {
                    "error": "NOT_AUTHORIZED",
                    "message": "Authenticated user does not have a customer profile.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AddDraftOrderItemSerializer(data=request.data, context={})
        serializer.is_valid(raise_exception=True)

        variant = serializer.context["variant"]
        quantity = serializer.validated_data["quantity"]

        draft_order, _ = get_or_create_draft_order(customer_profile)
        order_item = add_item_to_order(draft_order, variant, quantity)

        recalculate_order_totals(draft_order)

        return Response(
            {
                "message": "order updated",
                "orderId": draft_order.id,
                "orderItemId": order_item.id,
            },
            status=status.HTTP_201_CREATED,
        )


class DraftOrderItemUpdateView(APIView):
    """
    Update or remove an item in the customer's draft order.

    Endpoint:
        PATCH /api/v1/orders/items/{orderItemId}

    Request Body Example:
        {
            "quantity": 3
        }

    Behavior:
        - Updates quantity of an existing cart item
        - If quantity = 0, the item is removed
        - Recalculates order totals
        - Returns a simple success response indicating whether
          quantity was updated or the item was removed
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_customer_profile(self, request):
        """
        Retrieve the authenticated user's CustomerProfile.

        Returns None if the user does not have a customer profile.
        """
        try:
            return request.user.customer_profile
        except CustomerProfile.DoesNotExist:
            return None

    def patch(self, request, orderItemId):
        """
        Handle PATCH requests to update an order item.
        """
        customer_profile = self.get_customer_profile(request)

        if not customer_profile:
            return Response(
                {
                    "error": "NOT_AUTHORIZED",
                    "message": "Authenticated user does not have a customer profile.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        order_item = get_object_or_404(OrderItem, pk=orderItemId)

        if not order_item_belongs_to_customer(order_item, customer_profile):
            return Response(
                {
                    "error": "NOT_AUTHORIZED",
                    "message": "You do not have permission to modify this order.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = UpdateDraftOrderItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        quantity = serializer.validated_data["quantity"]

        draft_order = order_item.order
        updated_item = update_order_item_quantity(order_item, quantity)

        recalculate_order_totals(draft_order)

        if updated_item is None:
            return Response(
                {
                    "message": "item removed",
                    "orderId": draft_order.id,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "message": "quantity updated",
                "orderId": draft_order.id,
                "orderItemId": updated_item.id,
            },
            status=status.HTTP_200_OK,
        )