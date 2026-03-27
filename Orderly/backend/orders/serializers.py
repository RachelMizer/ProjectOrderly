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
from django.db.models import Sum
from rest_framework import serializers
from catalog.models import ProductVariant, ModifierOption, ModifierGroup
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
    # Currently does not validate order ownership

    guestEmail = serializers.EmailField(required=False)
    modifierId = serializers.IntegerField()

    def validate(self, data):
        request = self.context.get("request")
        order_item_id = self.context.get("orderItemId")

        modifier_id = data.get("modifierId")
        guest_email = data.get("guestEmail")

        user = request.user if request else None

        if not user or not user.is_authenticated:
            if not guest_email:
                raise serializers.ValidationError({
                    "error": "INVALID_INPUT",
                    "message": "guestEmail required if not authenticated"
                })
            
        try:
            order_item = OrderItem.objects.select_related("order", "variant").get(id=order_item_id)
        except OrderItem.DoesNotExist:
            raise serializers.ValidationError({
                "error": "NO_ORDER",
                "message": "customer does not have a draft order or no matching order item"
            })
        
        order = order_item.order

        if user.is_authenticated:
            if not order.customer or order.customer.user != user:
                raise serializers.ValidationError({
                    "error": "NOT_AUTHORIZED",
                    "message": "you do not have permission to modify this order"
                })
        else:
            if order.guest_email != guest_email:
                raise serializers.ValidationError({
                   "error": "NOT_AUTHORIZED",
                   "message": "you do not have permission to modify this order" 
                })

        if order.status != "DRAFT":
            raise serializers.ValidationError({
                "error": "NO_ORDER",
                "message": "customer does not have a draft order or no matching order item"
            })
        
        try:
            modifier = ModifierOption.objects.select_related("modifier_group").get(id=modifier_id)
        except ModifierOption.DoesNotExist:
            raise serializers.ValidationError({
                "error": "INVALID_INPUT",
                "message": "bad modifierId"
            })
        
        group = modifier.modifier_group
        if group.variant_id != order_item.variant_id:
            raise serializers.ValidationError({
                "error": "INVALID_INPUT",
                "message": "modifier does not belong to this product"
            })
        
        max_selections = group.max_selections

        if max_selections is not None:
            existing_total = OrderItemModifier.objects.filter(
                order_item=order_item,
                modifier_option__modifier_group=group
            ).aggregate(total=Sum("quantity"))["total"] or 0

            if existing_total + 1 > max_selections:
                raise serializers.ValidationError({
                    "error": "INVALID_INPUT",
                    "message": "max selections exceeded"
                })
        
        data["order_item"] = order_item
        data["modifier"] = modifier

        return data
    
    def create(self, validated_data):
        order_item = validated_data["order_item"]
        modifier = validated_data["modifier"]

        order_modifier = OrderItemModifier.objects.create(
            order_item=order_item,
            modifier_option=modifier,
            price_adjustment_charged=modifier.price_adjustment,
        )

        return {
            "message": "order updated",
            "orderId": order_item.order.id,
            "orderItemId": order_item.id,
            "orderModifierId": order_modifier.id
        }


class UpdateDraftOrderItemModifierSerializer(serializers.Serializer):
    # Currently does not validate order ownership

    guestEmail = serializers.EmailField(required=False)
    quantity = serializers.IntegerField()

    def validate(self, data):
        request = self.context.get("request")
        order_modifier_id = self.context.get("orderModifierId")

        quantity = data.get("quantity")
        guest_email = data.get("guestEmail")

        user = request.user if request else None

        if not user or not user.is_authenticated:
            if not guest_email:
                raise serializers.ValidationError({
                    "error": "INVALID_INPUT",
                    "message": "guestEmail required if not authenticated"
                })
            
            if order.guest_email.lower() != guest_email.lower():
                raise serializers.ValidationError({
                    "error": "NOT_AUTHORIZED",
                    "message": "Guest email does not match order."
                })
        
            
        if quantity is None or quantity < 0:
            raise serializers.ValidationError({
                "error": "INVALID_INPUT",
                "message": "bad quantity"
            })

        try:
            order_modifier = OrderItemModifier.objects.select_related(
                "order_item__order",
                "modifier_option__modifier_group"
            ).get(id=order_modifier_id)
        except OrderItemModifier.DoesNotExist:
            raise serializers.ValidationError({
                "error": "BAD_MODIFIER",
                "message": "order modifier does not exist"
            })
        
        order = order_modifier.order_item.order

        if user.is_authenticated:
            if not order.customer or order.customer.user != user:
                raise serializers.ValidationError({
                    "error": "NOT_AUTHORIZED",
                    "message": "you do not have permission to modify this order"
                })

        if order.status != "DRAFT":
            raise serializers.ValidationError({
                "error": "INVALID_INPUT",
                "message": "no draft order"
            })
        
        data["order_modifier"] = order_modifier

        return data
    
    def update(self, instance, validated_data):
        quantity = validated_data["quantity"]
        order_item = instance.order_item
        
        group = instance.modifier_option.modifier_group
        max_selections = group.max_selections

        at_max = False

        if max_selections is not None:
            existing_total = OrderItemModifier.objects.filter(
                order_item=order_item,
                modifier_option__modifier_group=group
            ).exclude(id=instance.id).aggregate(
                total=Sum("quantity")
            )["total"] or 0

            if existing_total + quantity > max_selections:
                quantity = max_selections - existing_total
                at_max = True

        if quantity == 0:
            order_id = instance.order_item.order.id
            order_item_id = instance.order_item.id

            instance.delete()

            return {
                "message": "modifier removed",
                "orderId": order_id,
                "orderItemId": order_item_id
            }

        instance.quantity = quantity
        instance.save()

        response = {
            "message": "quantity updated",
            "orderId": instance.order_item.order.id,
            "orderItemId": instance.order_item.id,
            "orderModifierId": instance.id,
            "atMaxSelections": at_max
        }

        if at_max:
            response["modifierQuantity"] = quantity

        return response



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