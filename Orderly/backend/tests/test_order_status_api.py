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
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    CustomerProfile.objects.create(user=user)
    return user


@pytest.fixture
def other_customer_user(db):
    user = User.objects.create_user(
        username="other@test.com",
        email="other@test.com",
        password="Password123!",
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
        description="",
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


@pytest.fixture
def submitted_order(db, customer_user, variant):
    order = Order.objects.create(
        customer=customer_user.customer_profile,
        status=OrderStatus.PENDING,
        subtotal=Decimal("10.00"),
        tax_amount=Decimal("0.00"),
        total_payment_due=Decimal("10.00"),
    )

    OrderItem.objects.create(
        order=order,
        variant=variant,
        quantity=2,
        unit_price_charged=variant.unit_price,
    )

    return order


# -----------------------------
# STATUS ENDPOINT TESTS
# -----------------------------

@pytest.mark.django_db
def test_get_order_status_success(api_client, customer_user, submitted_order):
    api_client.force_authenticate(user=customer_user)

    response = api_client.get(
        f"/api/v1/orders/{submitted_order.id}/status"
    )

    assert response.status_code == 200
    assert response.data == {
        "status": OrderStatus.PENDING
    }


@pytest.mark.django_db
def test_get_order_status_requires_authentication(api_client, submitted_order):
    response = api_client.get(
        f"/api/v1/orders/{submitted_order.id}/status"
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_get_order_status_forbidden_for_non_owner(
    api_client,
    other_customer_user,
    submitted_order,
):
    api_client.force_authenticate(user=other_customer_user)

    response = api_client.get(
        f"/api/v1/orders/{submitted_order.id}/status"
    )

    assert response.status_code == 403
    assert response.data["error"] == "NOT_AUTHORIZED"


@pytest.mark.django_db
def test_get_order_status_returns_404_for_missing_order(
    api_client,
    customer_user,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.get(
        "/api/v1/orders/999999/status"
    )

    assert response.status_code == 404


# -----------------------------
# ORDER DETAIL (RECEIPT) TESTS
# -----------------------------

@pytest.mark.django_db
def test_get_order_detail_success(api_client, customer_user, submitted_order):
    api_client.force_authenticate(user=customer_user)

    response = api_client.get(
        f"/api/v1/orders/{submitted_order.id}"
    )

    assert response.status_code == 200

    # Validate key receipt fields
    assert response.data["id"] == submitted_order.id
    assert response.data["status"] == OrderStatus.PENDING
    assert "items" in response.data
    assert response.data["taxAmount"] == "0.00"
    assert response.data["totalDue"] == "10.00"
    assert "createdAt" in response.data
    assert "updatedAt" in response.data


@pytest.mark.django_db
def test_get_order_detail_requires_guest_email_for_unauthenticated_user(api_client, submitted_order):
    response = api_client.get(
        f"/api/v1/orders/{submitted_order.id}"
    )

    assert response.status_code == 400
    assert response.data == {
        "error": "INVALID_INPUT",
        "message": "guestEmail is required for guest cart access.",
    }


@pytest.mark.django_db
def test_get_order_detail_forbidden_for_non_owner(
    api_client,
    other_customer_user,
    submitted_order,
):
    api_client.force_authenticate(user=other_customer_user)

    response = api_client.get(
        f"/api/v1/orders/{submitted_order.id}"
    )

    assert response.status_code == 403
    assert response.data["error"] == "NOT_AUTHORIZED"


@pytest.mark.django_db
def test_get_order_detail_returns_404_for_missing_order(
    api_client,
    customer_user,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.get(
        "/api/v1/orders/999999"
    )

    assert response.status_code == 404


# -----------------------------
# CONTRACT VALIDATION TESTS
# -----------------------------

@pytest.mark.django_db
def test_status_endpoint_returns_only_status_field(
    api_client,
    customer_user,
    submitted_order,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.get(
        f"/api/v1/orders/{submitted_order.id}/status"
    )

    assert response.status_code == 200
    assert list(response.data.keys()) == ["status"]


@pytest.mark.django_db
def test_order_detail_contains_items_with_expected_structure(
    api_client,
    customer_user,
    submitted_order,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.get(
        f"/api/v1/orders/{submitted_order.id}"
    )

    assert response.status_code == 200
    assert len(response.data["items"]) > 0

    item = response.data["items"][0]

    assert "itemId" in item
    assert "variantId" in item
    assert "quantity" in item
    assert "unitPriceCharged" in item
    assert "itemTotal" in item