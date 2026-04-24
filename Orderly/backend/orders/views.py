"""
Views for the Orders API.

These endpoints implement draft-order (cart) functionality and
draft order submission for customers.

Endpoints implemented here:

POST   /api/v1/orders/draft
POST   /api/v1/orders/items
PATCH  /api/v1/orders/items/{orderItemId}
PATCH  /api/v1/orders/{orderId}/submit
"""

from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated


def _validation_error_message(exc):
    if hasattr(exc, "message_dict"):
        parts = []
        for field, msgs in exc.message_dict.items():
            joined = ", ".join(msgs) if isinstance(msgs, list) else str(msgs)
            parts.append(f"{field}: {joined}")
        return "; ".join(parts)
    messages = exc.messages if hasattr(exc, "messages") else [str(exc)]
    return "; ".join(str(m) for m in messages)

from accounts.models import CustomerProfile
from accounts.api.permissions import IsBusinessUser
from orders.models import Order, OrderItem, OrderStatus
from orders.serializers import (
    AddDraftOrderItemSerializer,
    AddDraftOrderItemModifierSerializer,
    SubmitOrderSerializer,
    UpdateDraftOrderItemSerializer,
    UpdateDraftOrderItemModifierSerializer,
    OrderStatusSerializer,
    OrderDetailSerializer,
    OrderHistoryItemSerializer,
    BusinessOrderListSerializer,
    BusinessOrderDetailSerializer,
    CompleteOrderResponseSerializer,
)
from orders.services import (
    add_item_to_order,
    get_or_create_draft_order,
    get_or_create_guest_draft_order,
    order_item_belongs_to_customer,
    order_item_belongs_to_guest,
    get_order_for_guest,
    recalculate_order_totals,
    submit_order,
    update_order_item_quantity,
    validate_order_availability,
    validate_order_has_items,
    validate_order_identity,
    get_customer_profile_for_user,
    get_order_for_customer,
    get_order_history_for_customer,
)


class DraftOrderView(APIView):
    """
    Create or retrieve a draft order.

    Endpoint:
        POST /api/v1/orders/draft

    Behavior:
        - Authenticated: returns or creates the customer's draft order
        - Guest: requires guestEmail in body; returns or creates a guest draft order
    """

    permission_classes = [permissions.AllowAny]

    def get_customer_profile(self, request):
        try:
            return request.user.customer_profile
        except CustomerProfile.DoesNotExist:
            return None

    def post(self, request):
        if request.user.is_authenticated:
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
        else:
            guest_email = request.data.get("guestEmail")
            if not guest_email:
                return Response(
                    {
                        "error": "INVALID_INPUT",
                        "message": "guestEmail is required for guest carts.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            order, created = get_or_create_guest_draft_order(guest_email)

        return Response(
            {
                "id": order.id,
                "created": created,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class DraftOrderItemCreateView(APIView):
    """
    Add a new item to a draft order.

    Endpoint:
        POST /api/v1/orders/items

    Behavior:
        - Authenticated: finds or creates the customer's draft order
        - Guest: requires guestEmail in body
    """

    permission_classes = [permissions.AllowAny]

    def get_customer_profile(self, request):
        try:
            return request.user.customer_profile
        except CustomerProfile.DoesNotExist:
            return None

    def post(self, request):
        serializer = AddDraftOrderItemSerializer(data=request.data, context={})
        serializer.is_valid(raise_exception=True)

        variant = serializer.context["variant"]
        quantity = serializer.validated_data["quantity"]

        if request.user.is_authenticated:
            customer_profile = self.get_customer_profile(request)
            if not customer_profile:
                return Response(
                    {
                        "error": "NOT_AUTHORIZED",
                        "message": "Authenticated user does not have a customer profile.",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            draft_order, _ = get_or_create_draft_order(customer_profile)
        else:
            guest_email = request.data.get("guestEmail")
            if not guest_email:
                return Response(
                    {
                        "error": "INVALID_INPUT",
                        "message": "guestEmail is required for guest carts.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            draft_order, _ = get_or_create_guest_draft_order(guest_email)

        order_item = add_item_to_order(draft_order, variant, quantity)

        try:
            recalculate_order_totals(draft_order)
        except DjangoValidationError as exc:
            return Response(
                {"error": "INVALID_INPUT", "message": _validation_error_message(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
    Update or remove an item in a draft order.

    Endpoint:
        PATCH /api/v1/orders/items/{orderItemId}

    Behavior:
        - Authenticated: verifies customer ownership
        - Guest: requires guestEmail in body to verify ownership
        - quantity = 0 removes the item
    """

    permission_classes = [permissions.AllowAny]

    def get_customer_profile(self, request):
        try:
            return request.user.customer_profile
        except CustomerProfile.DoesNotExist:
            return None

    def patch(self, request, orderItemId):
        order_item = get_object_or_404(OrderItem, pk=orderItemId)

        if request.user.is_authenticated:
            customer_profile = self.get_customer_profile(request)
            if not customer_profile:
                return Response(
                    {
                        "error": "NOT_AUTHORIZED",
                        "message": "Authenticated user does not have a customer profile.",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            if not order_item_belongs_to_customer(order_item, customer_profile):
                return Response(
                    {
                        "error": "NOT_AUTHORIZED",
                        "message": "You do not have permission to modify this order.",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
        else:
            guest_email = request.data.get("guestEmail")
            if not guest_email:
                return Response(
                    {
                        "error": "INVALID_INPUT",
                        "message": "guestEmail is required for guest carts.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not order_item_belongs_to_guest(order_item, guest_email):
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
        try:
            recalculate_order_totals(draft_order)
        except DjangoValidationError as exc:
            return Response(
                {"error": "INVALID_INPUT", "message": _validation_error_message(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

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

class DraftOrderItemModifierCreateView(APIView):
    def post(self, request, orderItemId):
        serializer = AddDraftOrderItemModifierSerializer(
            data=request.data,
            context={
                "request": request,
                "orderItemId": orderItemId
            }
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        result = serializer.save()

        # Recalculate after modifier is created
        order_item = OrderItem.objects.get(pk=orderItemId)
        try:
            recalculate_order_totals(order_item.order)
        except DjangoValidationError as exc:
            return Response(
                {"error": "INVALID_INPUT", "message": _validation_error_message(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(result, status=status.HTTP_201_CREATED)


class DraftOrderItemModifierUpdateView(APIView):
    def patch(self, request, orderModifierId):
        serializer = UpdateDraftOrderItemModifierSerializer(
            data=request.data,
            context={
                "request": request,
                "orderModifierId": orderModifierId
            }
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        instance = serializer.validated_data["order_modifier"]

        result = serializer.update(instance, serializer.validated_data)

        # Recalculate after modifier is updated or removed
        recalculate_order_totals(instance.order_item.order)

        return Response(result, status=status.HTTP_200_OK)


class SubmitOrderView(APIView):
    """
    Submit a customer's DRAFT order.

    Endpoint:
        PATCH /api/v1/orders/{orderId}/submit

    Behavior:
        - verifies authenticated customer ownership
        - validates order has at least one item
        - validates customer XOR guest_email
        - validates availability
        - simulates payment by validating required fields
        - recalculates totals
        - transitions DRAFT -> PENDING

    If validation fails, the order remains in DRAFT status.
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

    def patch(self, request, orderId):
        """
        Handle submit-order requests.
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

        order = get_object_or_404(
            Order.objects.prefetch_related("items__variant__product"),
            pk=orderId,
        )

        if order.customer_id != customer_profile.id:
            return Response(
                {
                    "error": "NOT_AUTHORIZED",
                    "message": "You do not have permission to submit this order.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if order.status != OrderStatus.DRAFT:
            return Response(
                {
                    "error": "INVALID_INPUT",
                    "message": "Only DRAFT orders can be submitted.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = SubmitOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            validate_order_has_items(order)
            validate_order_identity(order)
            validate_order_availability(order)
            order = submit_order(order)
        except DjangoValidationError as exc:
            error_value = (
                exc.message_dict if hasattr(exc, "message_dict") else exc.messages
            )
            return Response(
                {
                    "error": "INVALID_INPUT",
                    "message": error_value,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "id": order.id,
                "status": order.status,
            },
            status=status.HTTP_200_OK,
        )
class OrderStatusView(APIView):
    """
    Return the current lifecycle status for a single order.

    GET /api/v1/orders/{orderId}/status
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, orderId):
        customer_profile = get_customer_profile_for_user(request.user)
        order = get_order_for_customer(orderId, customer_profile)

        serializer = OrderStatusSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderDetailView(APIView):
    """
    Return full order detail / receipt information for a single order.

    GET /api/v1/orders/{orderId}

    Behavior:
        - Business users can view any non-draft order
        - Customers can view their own orders
        - Guests must provide ?guestEmail= for ownership check
        - DRAFT orders return 404 in business/admin workflow context
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, orderId):
        if request.user.is_authenticated:
            if IsBusinessUser().has_permission(request, self):
                order = get_object_or_404(
                    Order.objects.prefetch_related("items__modifiers__modifier_option__group", "items__variant"),
                    pk=orderId,
                )

                if order.status == OrderStatus.DRAFT:
                    return Response(
                        {
                            "error": "NOT_FOUND",
                            "message": "Order not found.",
                        },
                        status=status.HTTP_404_NOT_FOUND,
                    )

                serializer = BusinessOrderDetailSerializer(order)
                return Response(serializer.data, status=status.HTTP_200_OK)

            customer_profile = get_customer_profile_for_user(request.user)
            order = get_order_for_customer(orderId, customer_profile)

            serializer = OrderDetailSerializer(order, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        guest_email = request.query_params.get("guestEmail")
        if not guest_email:
            return Response(
                {
                    "error": "INVALID_INPUT",
                    "message": "guestEmail is required for guest cart access.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = get_order_for_guest(orderId, guest_email)
        serializer = OrderDetailSerializer(order, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class OrderHistoryView(APIView):
    """
    Return the authenticated customer's non-draft orders, newest first.

    GET /api/v1/orders/me
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        customer_profile = get_customer_profile_for_user(request.user)
        orders = get_order_history_for_customer(customer_profile)

        try:
            page = int(request.query_params.get("page", 1))
            page_size = int(request.query_params.get("pageSize", 25))
        except ValueError:
            return Response(
                {
                    "error": "INVALID_INPUT",
                    "message": "page and pageSize must be integers.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if page < 1 or page_size < 1:
            return Response(
                {
                    "error": "INVALID_INPUT",
                    "message": "page and pageSize must be greater than 0.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_count = orders.count()
        start_index = (page - 1) * page_size
        end_index = start_index + page_size

        paged_orders = orders[start_index:end_index]
        serializer = OrderHistoryItemSerializer(paged_orders, many=True)

        next_url = None
        previous_url = None

        if end_index < total_count:
            next_url = f"/api/v1/orders/me?page={page + 1}&pageSize={page_size}"

        if page > 1:
            previous_url = f"/api/v1/orders/me?page={page - 1}&pageSize={page_size}"

        return Response(
            {
                "count": total_count,
                "pageSize": page_size,
                "next": next_url,
                "previous": previous_url,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

class BusinessOrderListView(APIView):
    """
    Business-only order list endpoint.

    Endpoint:
        GET /api/v1/orders

    Behavior:
        - returns non-draft orders only
        - orders results newest first
        - supports optional ?status= filter
    """

    permission_classes = [IsAuthenticated, IsBusinessUser]

    def get(self, request):
        queryset = Order.objects.exclude(
            status=OrderStatus.DRAFT
        ).select_related("customer").order_by("-created_at")

        status_param = request.query_params.get("status")
        if status_param:
            normalized_status = status_param.upper()

            valid_statuses = {choice[0] for choice in OrderStatus.choices}
            if normalized_status not in valid_statuses:
                return Response(
                    {
                        "error": "INVALID_STATUS",
                        "message": "status must be one of: DRAFT, PENDING, COMPLETED, CANCELLED",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            queryset = queryset.filter(status=normalized_status)

        total_count = queryset.count()

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = min(500, max(1, int(request.query_params.get("pageSize", 100))))
        except (ValueError, TypeError):
            page = 1
            page_size = 100

        offset = (page - 1) * page_size
        paginated = queryset[offset: offset + page_size]

        serializer = BusinessOrderListSerializer(paginated, many=True)

        return Response(
            {
                "count": total_count,
                "next": (offset + page_size) < total_count,
                "previous": page > 1,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    
class CompleteOrderView(APIView):
    """
    Business-only order completion endpoint.

    Endpoint:
        PATCH /api/v1/orders/{orderId}/complete

    Behavior:
        - business users can complete pending orders
        - draft orders return 404
        - only PENDING -> COMPLETED is allowed
    """

    permission_classes = [IsAuthenticated, IsBusinessUser]

    def patch(self, request, orderId):
        order = get_object_or_404(Order, pk=orderId)

        if order.status == OrderStatus.DRAFT:
            return Response(
                {
                    "error": "NOT_FOUND",
                    "message": "Order not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.status != OrderStatus.PENDING:
            return Response(
                {
                    "error": "INVALID_STATUS_TRANSITION",
                    "message": "Only pending orders can be marked completed.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = OrderStatus.COMPLETED
        order.save()

        serializer = CompleteOrderResponseSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CancelOrderView(APIView):
    """
    Customer order cancellation endpoint.

    Endpoint:
        PATCH /api/v1/orders/{orderId}/cancel

    Behavior:
        - authenticated customers can cancel their own pending orders
        - only PENDING -> CANCELLED is allowed
        - returns 403 if the order does not belong to the requesting customer
        - returns 400 if the order is not in PENDING status
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, orderId):
        customer_profile = get_customer_profile_for_user(request.user)

        order = get_object_or_404(Order, pk=orderId)

        if order.customer != customer_profile:
            return Response(
                {
                    "error": "FORBIDDEN",
                    "message": "You do not have permission to cancel this order.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if order.status != OrderStatus.PENDING:
            return Response(
                {
                    "error": "INVALID_STATUS_TRANSITION",
                    "message": "Only pending orders can be cancelled.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = OrderStatus.CANCELLED
        order.save()

        return Response(
            {"message": "Order cancelled successfully."},
            status=status.HTTP_200_OK,
        )