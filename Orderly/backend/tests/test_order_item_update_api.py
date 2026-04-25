import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import CustomerProfile, UserRole, UserRoleChoices
from catalog.models import Category, Product, ProductVariant
from orders.models import Order, OrderItem, OrderStatus

User = get_user_model()


WAKE_COUNTY_TAX_RATE = Decimal("0.0725")


def calc_tax(amount: Decimal) -> Decimal:
    return (amount * WAKE_COUNTY_TAX_RATE).quantize(Decimal("0.01"))


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="customer1@test.com",
        email="customer1@test.com",
        password="Password123!",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    CustomerProfile.objects.create(user=user)
    return user


@pytest.fixture
def other_customer_user(db):
    user = User.objects.create_user(
        username="customer2@test.com",
        email="customer2@test.com",
        password="Password123!",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    CustomerProfile.objects.create(user=user)
    return user


@pytest.fixture
def category(db):
    return Category.objects.create(name="Tea")


@pytest.fixture
def product(db, category):
    return Product.objects.create(
        category=category,
        name="Chai",
        description="Spiced tea",
        has_variants=True,
        has_modifiers=False,
    )


@pytest.fixture
def variant(db, product):
    return ProductVariant.objects.create(
        product=product,
        name="Medium Chai",
        sku="CHAI-MD-001",
        unit_price=Decimal("4.50"),
        stock_quantity=25,
        reorder_level=5,
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


@pytest.mark.django_db
def test_patch_items_updates_quantity_and_recalculates_totals(
    api_client,
    customer_user,
    order_item,
    store_settings,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/orders/items/{order_item.id}",
        {"quantity": 4},
        format="json",
    )

    assert response.status_code == 200
    assert response.data == {
        "message": "quantity updated",
        "orderId": order_item.order.id,
        "orderItemId": order_item.id,
    }

    order_item.refresh_from_db()
    order_item.order.refresh_from_db()

    expected_subtotal = Decimal("18.00")
    expected_tax = calc_tax(expected_subtotal)

    assert order_item.quantity == 4
    assert order_item.item_total == Decimal("18.00")
    assert order_item.order.subtotal == expected_subtotal
    assert order_item.order.tax_amount == expected_tax
    assert order_item.order.total_payment_due == expected_subtotal + expected_tax


@pytest.mark.django_db
def test_patch_items_quantity_zero_removes_item_and_recalculates_totals(
    api_client,
    customer_user,
    draft_order,
    order_item,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/orders/items/{order_item.id}",
        {"quantity": 0},
        format="json",
    )

    assert response.status_code == 200
    assert response.data == {
        "message": "item removed",
        "orderId": draft_order.id,
    }

    draft_order.refresh_from_db()
    assert not OrderItem.objects.filter(id=order_item.id).exists()
    assert draft_order.subtotal == Decimal("0.00")
    assert draft_order.tax_amount == Decimal("0.00")
    assert draft_order.total_payment_due == Decimal("0.00")


@pytest.mark.django_db
def test_patch_items_requires_guest_email_for_unauthenticated_user(api_client, order_item):
    response = api_client.patch(
        f"/api/v1/orders/items/{order_item.id}",
        {"quantity": 3},
        format="json",
    )

    assert response.status_code == 400
    assert response.data == {
        "error": "INVALID_INPUT",
        "message": "guestEmail is required for guest carts.",
    }


@pytest.mark.django_db
def test_patch_items_forbidden_for_non_owner(
    api_client,
    customer_user,
    other_order_item,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/orders/items/{other_order_item.id}",
        {"quantity": 3},
        format="json",
    )

    assert response.status_code == 403
    assert response.data == {
        "error": "NOT_AUTHORIZED",
        "message": "You do not have permission to modify this order.",
    }


@pytest.mark.django_db
def test_patch_items_returns_404_for_missing_order_item(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/orders/items/999999",
        {"quantity": 3},
        format="json",
    )

    assert response.status_code == 404


@pytest.mark.django_db
def test_patch_items_rejects_negative_quantity(api_client, customer_user, order_item):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/orders/items/{order_item.id}",
        {"quantity": -1},
        format="json",
    )

    assert response.status_code == 400
    assert "quantity" in response.data


@pytest.mark.django_db
def test_patch_items_does_not_change_variant_inventory(
    api_client,
    customer_user,
    order_item,
    variant,
):
    starting_stock = variant.stock_quantity

    api_client.force_authenticate(user=customer_user)
    response = api_client.patch(
        f"/api/v1/orders/items/{order_item.id}",
        {"quantity": 5},
        format="json",
    )

    assert response.status_code == 200

    variant.refresh_from_db()
    assert variant.stock_quantity == starting_stock