import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import CustomerProfile, UserRole, UserRoleChoices
from catalog.models import Category, Product, ProductVariant, ModifierGroup, ModifierOption
from orders.models import Order, OrderItem, OrderItemModifier, OrderStatus

User = get_user_model()


def get_first_error(response, key):
    value = response.data[key]
    if isinstance(value, list):
        return str(value[0])
    return str(value)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="customer@test.com",
        email="customer@test.com",
        password="Password123!",
        first_name="Test",
        last_name="Customer",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    CustomerProfile.objects.create(user=user)
    return user


@pytest.fixture
def other_customer_user(db):
    user = User.objects.create_user(
        username="othercustomer@test.com",
        email="othercustomer@test.com",
        password="Password123!",
        first_name="Other",
        last_name="Customer",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    CustomerProfile.objects.create(user=user)
    return user


@pytest.fixture
def category(db):
    return Category.objects.create(name="Coffee")


@pytest.fixture
def product(db, category):
    return Product.objects.create(
        category=category,
        name="Latte",
        description="Espresso drink",
        has_variants=True,
        has_modifiers=True,
    )


@pytest.fixture
def variant(db, product):
    return ProductVariant.objects.create(
        product=product,
        name="Large Latte",
        sku="LATTE-LG-001",
        unit_price=Decimal("5.00"),
        stock_quantity=10,
        reorder_level=2,
    )


@pytest.fixture
def other_product(db, category):
    return Product.objects.create(
        category=category,
        name="Tea",
        description="Tea drink",
        has_variants=True,
        has_modifiers=True,
    )


@pytest.fixture
def other_variant(db, other_product):
    return ProductVariant.objects.create(
        product=other_product,
        name="Large Tea",
        sku="TEA-LG-001",
        unit_price=Decimal("4.00"),
        stock_quantity=10,
        reorder_level=2,
    )


@pytest.fixture
def required_group(db, variant):
    return ModifierGroup.objects.create(
        variant=variant,
        name="Milk Type",
        required=True,
        min_selections=1,
        max_selections=1,
    )


@pytest.fixture
def optional_group(db, variant):
    return ModifierGroup.objects.create(
        variant=variant,
        name="Extras",
        required=False,
        min_selections=0,
        max_selections=2,
    )


@pytest.fixture
def other_variant_group(db, other_variant):
    return ModifierGroup.objects.create(
        variant=other_variant,
        name="Tea Add-Ons",
        required=False,
        min_selections=0,
        max_selections=2,
    )


@pytest.fixture
def required_option(db, required_group):
    return ModifierOption.objects.create(
        group=required_group,
        name="Whole Milk",
        price_adjustment=Decimal("0.00"),
    )


@pytest.fixture
def extra_option_1(db, optional_group):
    return ModifierOption.objects.create(
        group=optional_group,
        name="Vanilla",
        price_adjustment=Decimal("0.50"),
    )


@pytest.fixture
def extra_option_2(db, optional_group):
    return ModifierOption.objects.create(
        group=optional_group,
        name="Caramel",
        price_adjustment=Decimal("0.75"),
    )


@pytest.fixture
def other_variant_option(db, other_variant_group):
    return ModifierOption.objects.create(
        group=other_variant_group,
        name="Lemon",
        price_adjustment=Decimal("0.25"),
    )


@pytest.fixture
def draft_order(db, customer_user):
    return Order.objects.create(
        customer=customer_user.customer_profile,
        status=OrderStatus.DRAFT,
    )


@pytest.fixture
def other_draft_order(db, other_customer_user):
    return Order.objects.create(
        customer=other_customer_user.customer_profile,
        status=OrderStatus.DRAFT,
    )


@pytest.fixture
def submitted_order(db, customer_user):
    return Order.objects.create(
        customer=customer_user.customer_profile,
        status=OrderStatus.PENDING,
        subtotal=Decimal("0.00"),
        tax_amount=Decimal("0.00"),
        total_payment_due=Decimal("0.00"),
    )


@pytest.fixture
def order_item(db, draft_order, variant):
    return OrderItem.objects.create(
        order=draft_order,
        variant=variant,
        quantity=2,
        unit_price_charged=variant.unit_price,
    )


@pytest.fixture
def other_order_item(db, other_draft_order, variant):
    return OrderItem.objects.create(
        order=other_draft_order,
        variant=variant,
        quantity=2,
        unit_price_charged=variant.unit_price,
    )


@pytest.fixture
def submitted_order_item(db, submitted_order, variant):
    return OrderItem.objects.create(
        order=submitted_order,
        variant=variant,
        quantity=1,
        unit_price_charged=variant.unit_price,
    )


@pytest.fixture
def order_modifier(db, order_item, extra_option_1):
    return OrderItemModifier.objects.create(
        order_item=order_item,
        modifier_option=extra_option_1,
        quantity=1,
        price_adjustment_charged=extra_option_1.price_adjustment,
    )


@pytest.fixture
def other_order_modifier(db, other_order_item, extra_option_1):
    return OrderItemModifier.objects.create(
        order_item=other_order_item,
        modifier_option=extra_option_1,
        quantity=1,
        price_adjustment_charged=extra_option_1.price_adjustment,
    )


# ----------------------------------------
# POST /api/v1/orders/items/{orderItemId}/modifiers
# ----------------------------------------

@pytest.mark.django_db
def test_post_order_item_modifiers_creates_modifier_record(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 201
    assert response.data["message"] == "order updated"
    assert response.data["orderId"] == order_item.order.id
    assert response.data["orderItemId"] == order_item.id
    assert "orderModifierId" in response.data

    created_modifier = OrderItemModifier.objects.get(id=response.data["orderModifierId"])
    assert created_modifier.order_item == order_item
    assert created_modifier.modifier_option == extra_option_1
    assert created_modifier.quantity == 1
    assert created_modifier.price_adjustment_charged == Decimal("0.50")


@pytest.mark.django_db
def test_post_order_item_modifiers_stores_price_adjustment_charged(
    api_client,
    customer_user,
    order_item,
    extra_option_2,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_2.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 201

    created_modifier = OrderItemModifier.objects.get(id=response.data["orderModifierId"])
    assert created_modifier.price_adjustment_charged == Decimal("0.75")


@pytest.mark.django_db
def test_post_order_item_modifiers_requires_authentication(
    api_client,
    order_item,
    extra_option_1,
):
    response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 400
    assert get_first_error(response, "error") == "INVALID_INPUT"
    assert get_first_error(response, "message") == "guestEmail required if not authenticated"


@pytest.mark.django_db
def test_post_order_item_modifiers_forbidden_for_non_owner(
    api_client,
    customer_user,
    other_order_item,
    extra_option_1,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        f"/api/v1/orders/items/{other_order_item.id}/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 400
    assert get_first_error(response, "error") == "NOT_AUTHORIZED"
    assert get_first_error(response, "message") == "you do not have permission to modify this order"


@pytest.mark.django_db
def test_post_order_item_modifiers_returns_400_for_missing_order_item(
    api_client,
    customer_user,
    extra_option_1,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        "/api/v1/orders/items/999999/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 400
    assert get_first_error(response, "error") == "NO_ORDER"
    assert get_first_error(response, "message") == "customer does not have a draft order or no matching order item"


@pytest.mark.django_db
def test_post_order_item_modifiers_invalid_modifier_returns_400(
    api_client,
    customer_user,
    order_item,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": 999999, "quantity": 1},
        format="json",
    )

    assert response.status_code == 400
    assert get_first_error(response, "error") == "INVALID_INPUT"
    assert get_first_error(response, "message") == "bad modifierId"


@pytest.mark.django_db
def test_post_order_item_modifiers_rejects_modifier_from_different_variant(
    api_client,
    customer_user,
    order_item,
    other_variant_option,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": other_variant_option.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 400
    assert get_first_error(response, "error") == "INVALID_INPUT"
    assert get_first_error(response, "message") == "modifier does not belong to this product"


@pytest.mark.django_db
def test_post_order_item_modifiers_rejects_non_draft_order(
    api_client,
    customer_user,
    submitted_order_item,
    extra_option_1,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        f"/api/v1/orders/items/{submitted_order_item.id}/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 400
    assert get_first_error(response, "error") == "NO_ORDER"
    assert get_first_error(response, "message") == "customer does not have a draft order or no matching order item"


@pytest.mark.django_db
def test_post_order_item_modifiers_enforces_max_selections(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
    extra_option_2,
    optional_group,
):
    extra_option_3 = ModifierOption.objects.create(
        group=optional_group,
        name="Hazelnut",
        price_adjustment=Decimal("0.60"),
    )

    api_client.force_authenticate(user=customer_user)

    response_1 = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )
    assert response_1.status_code == 201

    response_2 = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_2.id, "quantity": 1},
        format="json",
    )
    assert response_2.status_code == 201

    response_3 = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_3.id, "quantity": 1},
        format="json",
    )

    assert response_3.status_code == 400
    assert get_first_error(response_3, "error") == "INVALID_INPUT"
    assert get_first_error(response_3, "message") == "max selections exceeded"


@pytest.mark.django_db
def test_post_order_item_modifiers_updates_order_totals(
    api_client,
    customer_user,
    draft_order,
    order_item,
    extra_option_1,
):
    api_client.force_authenticate(user=customer_user)
    draft_order.refresh_from_db()
    starting_subtotal = draft_order.subtotal

    response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 201

    draft_order.refresh_from_db()
    assert draft_order.subtotal > starting_subtotal


# ----------------------------------------
# PATCH /api/v1/orders/items/modifiers/{orderModifierId}
# ----------------------------------------

@pytest.mark.django_db
def test_patch_order_item_modifier_updates_quantity(
    api_client,
    customer_user,
    order_modifier,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{order_modifier.id}",
        {"quantity": 2},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["message"] == "quantity updated"
    assert response.data["orderId"] == order_modifier.order_item.order.id
    assert response.data["orderItemId"] == order_modifier.order_item.id
    assert response.data["orderModifierId"] == order_modifier.id
    assert response.data["atMaxSelections"] is False

    order_modifier.refresh_from_db()
    assert order_modifier.quantity == 2


@pytest.mark.django_db
def test_patch_order_item_modifier_quantity_zero_removes_modifier(
    api_client,
    customer_user,
    order_modifier,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{order_modifier.id}",
        {"quantity": 0},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["message"] == "modifier removed"
    assert response.data["orderId"] == order_modifier.order_item.order.id
    assert response.data["orderItemId"] == order_modifier.order_item.id
    assert not OrderItemModifier.objects.filter(id=order_modifier.id).exists()


@pytest.mark.django_db
def test_patch_order_item_modifier_requires_authentication(
    api_client,
    order_modifier,
):
    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{order_modifier.id}",
        {"quantity": 2},
        format="json",
    )

    assert response.status_code == 400
    assert get_first_error(response, "error") == "INVALID_INPUT"
    assert get_first_error(response, "message") == "guestEmail required if not authenticated"


@pytest.mark.django_db
def test_patch_order_item_modifier_forbidden_for_non_owner(
    api_client,
    customer_user,
    other_order_modifier,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{other_order_modifier.id}",
        {"quantity": 2},
        format="json",
    )

    assert response.status_code == 400
    assert get_first_error(response, "error") == "NOT_AUTHORIZED"
    assert get_first_error(response, "message") == "you do not have permission to modify this order"


@pytest.mark.django_db
def test_patch_order_item_modifier_returns_400_for_missing_modifier(
    api_client,
    customer_user,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/orders/items/modifiers/999999",
        {"quantity": 2},
        format="json",
    )

    assert response.status_code == 400
    assert get_first_error(response, "error") == "BAD_MODIFIER"
    assert get_first_error(response, "message") == "order modifier does not exist"


@pytest.mark.django_db
def test_patch_order_item_modifier_rejects_negative_quantity(
    api_client,
    customer_user,
    order_modifier,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{order_modifier.id}",
        {"quantity": -1},
        format="json",
    )

    assert response.status_code == 400
    assert get_first_error(response, "error") == "INVALID_INPUT"
    assert get_first_error(response, "message") == "bad quantity"


@pytest.mark.django_db
def test_patch_order_item_modifier_rejects_non_draft_order(
    api_client,
    customer_user,
    submitted_order_item,
    extra_option_1,
):
    modifier = OrderItemModifier.objects.create(
        order_item=submitted_order_item,
        modifier_option=extra_option_1,
        quantity=1,
        price_adjustment_charged=extra_option_1.price_adjustment,
    )

    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{modifier.id}",
        {"quantity": 2},
        format="json",
    )

    assert response.status_code == 400
    assert get_first_error(response, "error") == "INVALID_INPUT"
    assert get_first_error(response, "message") == "no draft order"


@pytest.mark.django_db
def test_patch_order_item_modifier_caps_quantity_at_max_selections(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
    extra_option_2,
):
    modifier_1 = OrderItemModifier.objects.create(
        order_item=order_item,
        modifier_option=extra_option_1,
        quantity=1,
        price_adjustment_charged=extra_option_1.price_adjustment,
    )
    OrderItemModifier.objects.create(
        order_item=order_item,
        modifier_option=extra_option_2,
        quantity=1,
        price_adjustment_charged=extra_option_2.price_adjustment,
    )

    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{modifier_1.id}",
        {"quantity": 5},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["message"] == "quantity updated"
    assert response.data["orderId"] == order_item.order.id
    assert response.data["orderItemId"] == order_item.id
    assert response.data["orderModifierId"] == modifier_1.id
    assert response.data["modifierQuantity"] == 1
    assert response.data["atMaxSelections"] is True

    modifier_1.refresh_from_db()
    assert modifier_1.quantity == 1


@pytest.mark.django_db
def test_patch_order_item_modifier_updates_order_totals(
    api_client,
    customer_user,
    draft_order,
    order_modifier,
):
    api_client.force_authenticate(user=customer_user)
    draft_order.refresh_from_db()
    starting_subtotal = draft_order.subtotal

    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{order_modifier.id}",
        {"quantity": 2},
        format="json",
    )

    assert response.status_code == 200

    draft_order.refresh_from_db()
    assert draft_order.subtotal > starting_subtotal


# ----------------------------------------
# Acceptance criterion not currently implemented
# ----------------------------------------

@pytest.mark.django_db
def test_required_groups_enforced_for_customized_item(
    api_client,
    customer_user,
    order_item,
):
    api_client.force_authenticate(user=customer_user)

    # Story expects required groups to be enforced.
    # Current endpoints appear to allow an order item to exist without
    # forcing a required modifier group selection first.
    response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {},
        format="json",
    )

    assert response.status_code == 400

@pytest.mark.django_db
def test_patch_order_item_modifier_only_updates_quantity_not_option(
    api_client,
    customer_user,
    order_modifier,
):
    api_client.force_authenticate(user=customer_user)
    original_option_id = order_modifier.modifier_option.id

    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{order_modifier.id}",
        {"quantity": 2},
        format="json",
    )

    assert response.status_code == 200

    order_modifier.refresh_from_db()
    assert order_modifier.quantity == 2
    assert order_modifier.modifier_option.id == original_option_id

@pytest.mark.django_db
def test_patch_order_item_modifier_only_updates_quantity_not_option(
    api_client,
    customer_user,
    order_modifier,
):
    api_client.force_authenticate(user=customer_user)
    original_option_id = order_modifier.modifier_option.id

    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{order_modifier.id}",
        {"quantity": 2},
        format="json",
    )

    assert response.status_code == 200

    order_modifier.refresh_from_db()
    assert order_modifier.quantity == 2
    assert order_modifier.modifier_option.id == original_option_id

@pytest.mark.django_db
def test_order_item_modifier_preserves_price_adjustment_charged_after_catalog_change(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 201

    created_modifier = OrderItemModifier.objects.get(id=response.data["orderModifierId"])
    assert created_modifier.price_adjustment_charged == Decimal("0.50")

    extra_option_1.price_adjustment = Decimal("9.99")
    extra_option_1.save()

    created_modifier.refresh_from_db()
    assert created_modifier.price_adjustment_charged == Decimal("0.50")

@pytest.mark.django_db
def test_patch_order_item_modifier_remove_only_removes_target_modifier(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
    extra_option_2,
):
    api_client.force_authenticate(user=customer_user)

    modifier_1 = OrderItemModifier.objects.create(
        order_item=order_item,
        modifier_option=extra_option_1,
        quantity=1,
        price_adjustment_charged=extra_option_1.price_adjustment,
    )
    modifier_2 = OrderItemModifier.objects.create(
        order_item=order_item,
        modifier_option=extra_option_2,
        quantity=1,
        price_adjustment_charged=extra_option_2.price_adjustment,
    )

    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{modifier_1.id}",
        {"quantity": 0},
        format="json",
    )

    assert response.status_code == 200
    assert not OrderItemModifier.objects.filter(id=modifier_1.id).exists()
    assert OrderItemModifier.objects.filter(id=modifier_2.id).exists()

@pytest.mark.django_db
def test_patch_order_item_modifier_respects_group_max_across_all_modifiers(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
    extra_option_2,
):
    api_client.force_authenticate(user=customer_user)

    modifier_1 = OrderItemModifier.objects.create(
        order_item=order_item,
        modifier_option=extra_option_1,
        quantity=1,
        price_adjustment_charged=extra_option_1.price_adjustment,
    )
    OrderItemModifier.objects.create(
        order_item=order_item,
        modifier_option=extra_option_2,
        quantity=1,
        price_adjustment_charged=extra_option_2.price_adjustment,
    )

    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{modifier_1.id}",
        {"quantity": 99},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["atMaxSelections"] is True

    modifier_1.refresh_from_db()
    assert modifier_1.quantity == 1

@pytest.mark.django_db
def test_order_detail_reflects_added_modifier(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
):
    api_client.force_authenticate(user=customer_user)

    create_response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )
    assert create_response.status_code == 201

    detail_response = api_client.get(
        f"/api/v1/orders/{order_item.order.id}"
    )

    assert detail_response.status_code == 200
    assert str(detail_response.data).lower().find("vanilla") != -1

@pytest.mark.django_db
def test_order_detail_reflects_added_modifier(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
):
    api_client.force_authenticate(user=customer_user)

    create_response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )
    assert create_response.status_code == 201

    detail_response = api_client.get(
        f"/api/v1/orders/{order_item.order.id}",
        format="json",
        headers={}
    )

    assert detail_response.status_code == 200
    assert "vanilla" in str(detail_response.data).lower()


@pytest.mark.django_db
def test_order_detail_reflects_updated_modifier_quantity(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
):
    api_client.force_authenticate(user=customer_user)

    create_response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )
    assert create_response.status_code == 201

    order_modifier_id = create_response.data["orderModifierId"]

    update_response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{order_modifier_id}",
        {"quantity": 2},
        format="json",
    )
    assert update_response.status_code == 200

    detail_response = api_client.get(
        f"/api/v1/orders/{order_item.order.id}",
        format="json",
    )
    assert detail_response.status_code == 200
    assert "vanilla" in str(detail_response.data).lower()
    assert "2" in str(detail_response.data)


@pytest.mark.django_db
def test_order_detail_reflects_removed_modifier(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
):
    api_client.force_authenticate(user=customer_user)

    create_response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )
    assert create_response.status_code == 201

    order_modifier_id = create_response.data["orderModifierId"]

    remove_response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{order_modifier_id}",
        {"quantity": 0},
        format="json",
    )
    assert remove_response.status_code == 200

    detail_response = api_client.get(
        f"/api/v1/orders/{order_item.order.id}",
        format="json",
    )
    assert detail_response.status_code == 200
    assert "vanilla" not in str(detail_response.data).lower()


@pytest.mark.django_db
def test_post_order_item_modifiers_does_not_create_duplicate_modifier_record(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
):
    api_client.force_authenticate(user=customer_user)

    body = {
        "modifierId": extra_option_1.id,
        "quantity": 1,
    }

    first_response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        body,
        format="json",
    )
    assert first_response.status_code == 201

    second_response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        body,
        format="json",
    )

    assert second_response.status_code == 400
    assert OrderItemModifier.objects.filter(
        order_item=order_item,
        modifier_option=extra_option_1,
    ).count() == 1


@pytest.mark.django_db
def test_patch_order_item_modifier_remove_only_removes_target_modifier(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
    extra_option_2,
):
    api_client.force_authenticate(user=customer_user)

    modifier_1 = OrderItemModifier.objects.create(
        order_item=order_item,
        modifier_option=extra_option_1,
        quantity=1,
        price_adjustment_charged=extra_option_1.price_adjustment,
    )
    modifier_2 = OrderItemModifier.objects.create(
        order_item=order_item,
        modifier_option=extra_option_2,
        quantity=1,
        price_adjustment_charged=extra_option_2.price_adjustment,
    )

    response = api_client.patch(
        f"/api/v1/orders/items/modifiers/{modifier_1.id}",
        {"quantity": 0},
        format="json",
    )

    assert response.status_code == 200
    assert not OrderItemModifier.objects.filter(id=modifier_1.id).exists()
    assert OrderItemModifier.objects.filter(id=modifier_2.id).exists()


@pytest.mark.django_db
def test_order_item_modifier_preserves_price_adjustment_charged_after_catalog_change(
    api_client,
    customer_user,
    order_item,
    extra_option_1,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        f"/api/v1/orders/items/{order_item.id}/modifiers",
        {"modifierId": extra_option_1.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 201

    created_modifier = OrderItemModifier.objects.get(id=response.data["orderModifierId"])
    assert created_modifier.price_adjustment_charged == Decimal("0.50")

    extra_option_1.price_adjustment = Decimal("9.99")
    extra_option_1.save()

    created_modifier.refresh_from_db()
    assert created_modifier.price_adjustment_charged == Decimal("0.50")