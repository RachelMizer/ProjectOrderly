"""
Views for the Orders API.

These endpoints implement the Draft Order (cart) functionality used by
customers while building an order.

Endpoints implemented here:

GET    /api/v1/orders?status=DRAFT
POST   /api/v1/orders/items
PATCH  /api/v1/orders/items/{orderItemId}
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404

from accounts.models import CustomerProfile
from catalog.models import ProductVariant
from orders.models import OrderItem
from orders.serializers import (
    DraftOrderSerializer,
    AddDraftOrderItemSerializer,
    UpdateDraftOrderItemSerializer,
)
from orders.services import (
    get_or_create_draft_order,
    recalculate_order_totals,
    add_item_to_order,
    update_order_item_quantity,
    order_item_belongs_to_customer,
)


class DraftOrderView(APIView):
    """
    Retrieve the authenticated customer's draft order (cart).

    Endpoint:
        GET /api/v1/orders?status=DRAFT

    Behavior:
        - Returns the customer's current draft order
        - If no draft order exists, one is created automatically
        - Used by the frontend to load the cart on page refresh
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_customer_profile(self, request):
        """
        Retrieve the authenticated user's CustomerProfile.

        Raises a 403 error if the user does not have a customer profile.
        """

        try:
            return request.user.customer_profile
        except CustomerProfile.DoesNotExist:
            return None

    def get(self, request):
        """
        Handle GET requests to retrieve the draft order.

        Query parameters:
            status=DRAFT (required for this endpoint)

        Returns:
            JSON representation of the customer's cart.
        """

        status_param = request.query_params.get("status")

        if status_param != "DRAFT":
            return Response(
                {"error": "Only status=DRAFT is supported."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        customer_profile = self.get_customer_profile(request)

        if not customer_profile:
            return Response(
                {"error": "Authenticated user does not have a customer profile."},
                status=status.HTTP_403_FORBIDDEN,
            )

        draft_order, _ = get_or_create_draft_order(customer_profile)

        draft_order = recalculate_order_totals(draft_order)

        serializer = DraftOrderSerializer(draft_order)

        return Response(serializer.data, status=status.HTTP_200_OK)


class DraftOrderItemCreateView(APIView):
    """
    Add a new item to the authenticated customer's draft order (cart).

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
        - Returns the updated cart
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_customer_profile(self, request):
        """
        Retrieve the authenticated user's CustomerProfile.
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
                {"error": "Authenticated user does not have a customer profile."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AddDraftOrderItemSerializer(data=request.data, context={})
        serializer.is_valid(raise_exception=True)

        variant = serializer.context["variant"]
        quantity = serializer.validated_data["quantity"]

        draft_order, _ = get_or_create_draft_order(customer_profile)

        add_item_to_order(draft_order, variant, quantity)

        draft_order = recalculate_order_totals(draft_order)

        response_serializer = DraftOrderSerializer(draft_order)

        return Response(response_serializer.data, status=status.HTTP_200_OK)


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
        - Returns the updated cart
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_customer_profile(self, request):
        """
        Retrieve the authenticated user's CustomerProfile.
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
                {"error": "Authenticated user does not have a customer profile."},
                status=status.HTTP_403_FORBIDDEN,
            )

        order_item = get_object_or_404(OrderItem, pk=orderItemId)

        if not order_item_belongs_to_customer(order_item, customer_profile):
            return Response(
                {"error": "You do not have permission to modify this item."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = UpdateDraftOrderItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        quantity = serializer.validated_data["quantity"]

        update_order_item_quantity(order_item, quantity)

        draft_order = order_item.order

        draft_order = recalculate_order_totals(draft_order)

        response_serializer = DraftOrderSerializer(draft_order)

        return Response(response_serializer.data, status=status.HTTP_200_OK)