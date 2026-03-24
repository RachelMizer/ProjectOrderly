"""
Serializers for the Orders API.

These serializers convert Order-related Django model objects into JSON responses
for the frontend and validate incoming request data for cart operations.

Used primarily by the Draft Order (cart) API endpoints:

GET    /api/v1/orders?status=DRAFT
POST   /api/v1/orders/items
PATCH  /api/v1/orders/items/{orderItemId}
PATCH  /api/v1/orders/{orderId}/submit
"""

from rest_framework import serializers
from catalog.models import ProductVariant
from orders.models import Order, OrderItem, OrderItemModifier


class OrderItemModifierSerializer(serializers.ModelSerializer):
    """
    Serializer representing a modifier applied to an OrderItem.

    Used in cart responses to display selected modifier options
    (e.g., extra cheese, add bacon) and their price adjustments.
    """

    optionId = serializers.IntegerField(source="modifier_option.id", read_only=True)
    name = serializers.CharField(source="modifier_option.name", read_only=True)

    priceAdjustmentCharged = serializers.DecimalField(
        source="price_adjustment_charged",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = OrderItemModifier
        fields = [
            "optionId",
            "name",
            "priceAdjustmentCharged",
        ]


class DraftOrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer representing an individual item in a draft order (cart).

    Converts OrderItem model data into the response format expected by
    the frontend cart interface.
    """

    itemId = serializers.IntegerField(source="id", read_only=True)

    variantId = serializers.IntegerField(source="variant.id", read_only=True)
    productName = serializers.CharField(source="variant.product.name", read_only=True)
    variantName = serializers.CharField(source="variant.name", read_only=True)

    quantity = serializers.IntegerField(read_only=True)

    unitPriceCharged = serializers.DecimalField(
        source="unit_price_charged",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    itemTotal = serializers.DecimalField(
        source="item_total",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    modifiers = OrderItemModifierSerializer(many=True, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "itemId",
            "variantId",
            "productName",
            "variantName",
            "quantity",
            "unitPriceCharged",
            "itemTotal",
            "modifiers",
        ]


class DraftOrderSerializer(serializers.ModelSerializer):
    """
    Serializer representing a customer's draft order (cart).

    This serializer returns the full cart structure including:
    - order identifier
    - list of cart items
    - calculated totals
    """

    orderId = serializers.IntegerField(source="id", read_only=True)

    items = DraftOrderItemSerializer(many=True, read_only=True)

    totals = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "orderId",
            "status",
            "items",
            "totals",
        ]

    def get_totals(self, obj):
        """
        Format totals in the structure expected by the API contract.
        """
        return {
            "subtotal": obj.subtotal,
            "taxAmount": obj.tax_amount,
            "totalPaymentDue": obj.total_payment_due,
        }


class AddDraftOrderItemSerializer(serializers.Serializer):
    """
    Serializer used for adding a new item to a draft order (cart).

    Validates incoming request data for POST /api/v1/orders/items.

    Expected request format:
    {
        "variantId": <int>,
        "quantity": <int>
    }
    """

    variantId = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

    def validate_variantId(self, value):
        """
        Validate that the provided ProductVariant exists.

        The resolved variant object is stored in serializer context
        so views can use it without querying the database again.
        """

        try:
            variant = ProductVariant.objects.select_related("product").get(pk=value)
        except ProductVariant.DoesNotExist as exc:
            raise serializers.ValidationError("Invalid variantId.") from exc

        self.context["variant"] = variant
        return value


class UpdateDraftOrderItemSerializer(serializers.Serializer):
    """
    Serializer used for updating an existing order item.

    Used by PATCH /api/v1/orders/items/{orderItemId}.

    Setting quantity to 0 removes the item from the cart.
    """

    quantity = serializers.IntegerField(min_value=0)


class AddDraftOrderItemModifierSerializer(serializers.Serializer):
    pass


class UpdateDraftOrderItemModifierSerializer(serializers.Serializer):
    pass


class SubmitOrderSerializer(serializers.Serializer):
    """
    Validate the minimum payment information required to submit
    a draft order.

    Payment simulation rules:
    - CASH requires only paymentType
    - CREDIT_CARD requires cardLast4
    - OTHER requires otherDetails
    """

    paymentType = serializers.ChoiceField(
        choices=["CREDIT_CARD", "CASH", "OTHER"]
    )
    cardLast4 = serializers.CharField(
        required=False,
        allow_blank=False,
        max_length=4,
    )
    otherDetails = serializers.CharField(
        required=False,
        allow_blank=False,
    )

    def validate(self, attrs):
        """
        Validate payment simulation requirements based on payment type.
        """
        payment_type = attrs.get("paymentType")

        if payment_type == "CREDIT_CARD" and not attrs.get("cardLast4"):
            raise serializers.ValidationError(
                {"cardLast4": "cardLast4 is required when paymentType is CREDIT_CARD."}
            )

        if payment_type == "OTHER" and not attrs.get("otherDetails"):
            raise serializers.ValidationError(
                {"otherDetails": "otherDetails is required when paymentType is OTHER."}
            )

        return attrs