import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import CustomerProfile, UserRole, UserRoleChoices
from catalog.models import Category, Product, ProductVariant
from orders.models import Order, OrderItem, OrderStatus

User = get_user_model()


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
def user_without_customer_profile(db):
    return User.objects.create_user(
        username="plainuser@test.com",
        email="plainuser@test.com",
        password="Password123!",
    )


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
        has_modifiers=False,
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


@pytest.mark.django_db
def test_post_items_creates_draft_and_adds_item(api_client, customer_user, variant):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        "/api/v1/orders/items",
        {"variantId": variant.id, "quantity": 2},
        format="json",
    )

    assert response.status_code == 201
    assert response.data["message"] == "order updated"
    assert set(response.data.keys()) == {"message", "orderId", "orderItemId"}

    order = Order.objects.get(id=response.data["orderId"])
    item = OrderItem.objects.get(id=response.data["orderItemId"])

    assert order.customer == customer_user.customer_profile
    assert order.status == OrderStatus.DRAFT

    assert item.order == order
    assert item.variant == variant
    assert item.quantity == 2
    assert item.unit_price_charged == Decimal("5.00")
    assert item.item_total == Decimal("10.00")

    order.refresh_from_db()
    assert order.subtotal == Decimal("10.00")
    assert order.tax_amount == Decimal("0.00")
    assert order.total_payment_due == Decimal("10.00")


@pytest.mark.django_db
def test_post_items_uses_existing_draft_order(api_client, customer_user, variant):
    draft_order = Order.objects.create(
        customer=customer_user.customer_profile,
        status=OrderStatus.DRAFT,
    )

    api_client.force_authenticate(user=customer_user)
    response = api_client.post(
        "/api/v1/orders/items",
        {"variantId": variant.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 201
    assert response.data["orderId"] == draft_order.id
    assert Order.objects.filter(
        customer=customer_user.customer_profile,
        status=OrderStatus.DRAFT,
    ).count() == 1


@pytest.mark.django_db
def test_post_items_same_variant_merges_quantity_not_duplicate_row(
    api_client,
    customer_user,
    variant,
):
    draft_order = Order.objects.create(
        customer=customer_user.customer_profile,
        status=OrderStatus.DRAFT,
    )
    existing_item = OrderItem.objects.create(
        order=draft_order,
        variant=variant,
        quantity=1,
        unit_price_charged=variant.unit_price,
    )

    api_client.force_authenticate(user=customer_user)
    response = api_client.post(
        "/api/v1/orders/items",
        {"variantId": variant.id, "quantity": 2},
        format="json",
    )

    assert response.status_code == 201

    existing_item.refresh_from_db()
    draft_order.refresh_from_db()

    assert existing_item.quantity == 3
    assert existing_item.item_total == Decimal("15.00")
    assert OrderItem.objects.filter(order=draft_order, variant=variant).count() == 1
    assert response.data["orderItemId"] == existing_item.id
    assert draft_order.subtotal == Decimal("15.00")
    assert draft_order.total_payment_due == Decimal("15.00")


@pytest.mark.django_db
def test_post_items_requires_authentication(api_client, variant):
    response = api_client.post(
        "/api/v1/orders/items",
        {"variantId": variant.id, "quantity": 2},
        format="json",
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_post_items_forbidden_without_customer_profile(
    api_client,
    user_without_customer_profile,
    variant,
):
    api_client.force_authenticate(user=user_without_customer_profile)

    response = api_client.post(
        "/api/v1/orders/items",
        {"variantId": variant.id, "quantity": 2},
        format="json",
    )

    assert response.status_code == 403
    assert response.data == {
        "error": "NOT_AUTHORIZED",
        "message": "Authenticated user does not have a customer profile.",
    }


@pytest.mark.django_db
def test_post_items_invalid_variant_returns_400(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        "/api/v1/orders/items",
        {"variantId": 999999, "quantity": 2},
        format="json",
    )

    assert response.status_code == 400
    assert "variantId" in response.data


@pytest.mark.django_db
def test_post_items_quantity_must_be_greater_than_zero(
    api_client,
    customer_user,
    variant,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        "/api/v1/orders/items",
        {"variantId": variant.id, "quantity": 0},
        format="json",
    )

    assert response.status_code == 400
    assert "quantity" in response.data


@pytest.mark.django_db
def test_post_items_does_not_change_variant_inventory(api_client, customer_user, variant):
    starting_stock = variant.stock_quantity

    api_client.force_authenticate(user=customer_user)
    response = api_client.post(
        "/api/v1/orders/items",
        {"variantId": variant.id, "quantity": 4},
        format="json",
    )

    assert response.status_code == 201

    variant.refresh_from_db()
    assert variant.stock_quantity == starting_stock