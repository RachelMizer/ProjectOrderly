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
def business_user(db):
    user = User.objects.create_user(
        username="business@test.com",
        email="business@test.com",
        password="Password123!",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.STORE_MANAGER)
    return user


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
def pending_order(db, customer_user, variant):
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
        unit_price_charged=Decimal("5.00"),
    )
    return order


@pytest.fixture
def completed_order(db, customer_user, variant):
    order = Order.objects.create(
        customer=customer_user.customer_profile,
        status=OrderStatus.COMPLETED,
        subtotal=Decimal("5.00"),
        tax_amount=Decimal("0.00"),
        total_payment_due=Decimal("5.00"),
    )
    OrderItem.objects.create(
        order=order,
        variant=variant,
        quantity=1,
        unit_price_charged=Decimal("5.00"),
    )
    return order


@pytest.fixture
def draft_order(db, customer_user):
    return Order.objects.create(
        customer=customer_user.customer_profile,
        status=OrderStatus.DRAFT,
    )


# -----------------------------
# BUSINESS ORDER LIST TESTS
# -----------------------------

@pytest.mark.django_db
def test_get_orders_returns_non_draft_orders_only(
    api_client,
    business_user,
    pending_order,
    completed_order,
    draft_order,
):
    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/orders/")

    assert response.status_code == 200
    assert response.data["count"] == 2

    statuses = [order["status"] for order in response.data["results"]]
    assert OrderStatus.DRAFT not in statuses
    assert OrderStatus.PENDING in statuses
    assert OrderStatus.COMPLETED in statuses


@pytest.mark.django_db
def test_get_orders_sorted_newest_first(
    api_client,
    business_user,
    pending_order,
    completed_order,
):
    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/orders/")

    assert response.status_code == 200

    results = response.data["results"]
    assert len(results) == 2
    assert results[0]["createdAt"] >= results[1]["createdAt"]


@pytest.mark.django_db
def test_get_orders_filter_by_status(
    api_client,
    business_user,
    pending_order,
    completed_order,
):
    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/orders/?status=PENDING")

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["status"] == OrderStatus.PENDING


@pytest.mark.django_db
def test_get_orders_invalid_status_returns_400(api_client, business_user):
    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/orders/?status=INVALID")

    assert response.status_code == 400
    assert response.data["error"] == "INVALID_STATUS"


@pytest.mark.django_db
def test_get_orders_requires_business_role(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.get("/api/v1/orders/")

    assert response.status_code == 403


# -----------------------------
# ORDER DETAIL (BUSINESS VIEW)
# -----------------------------

@pytest.mark.django_db
def test_business_can_view_order_detail(api_client, business_user, pending_order):
    api_client.force_authenticate(user=business_user)

    response = api_client.get(f"/api/v1/orders/{pending_order.id}")

    assert response.status_code == 200
    assert response.data["id"] == pending_order.id
    assert response.data["status"] == OrderStatus.PENDING


@pytest.mark.django_db
def test_business_get_order_detail_returns_404_for_draft(
    api_client,
    business_user,
    draft_order,
):
    api_client.force_authenticate(user=business_user)

    response = api_client.get(f"/api/v1/orders/{draft_order.id}")

    assert response.status_code == 404
    assert response.data["error"] == "NOT_FOUND"


# -----------------------------
# ORDER COMPLETION TESTS
# -----------------------------

@pytest.mark.django_db
def test_complete_order_success(api_client, business_user, pending_order):
    api_client.force_authenticate(user=business_user)

    response = api_client.patch(
        f"/api/v1/orders/{pending_order.id}/complete"
    )

    assert response.status_code == 200
    assert response.data == {
        "id": pending_order.id,
        "status": OrderStatus.COMPLETED,
    }

    pending_order.refresh_from_db()
    assert pending_order.status == OrderStatus.COMPLETED


@pytest.mark.django_db
def test_complete_order_returns_404_for_draft(
    api_client,
    business_user,
    draft_order,
):
    api_client.force_authenticate(user=business_user)

    response = api_client.patch(
        f"/api/v1/orders/{draft_order.id}/complete"
    )

    assert response.status_code == 404
    assert response.data["error"] == "NOT_FOUND"


@pytest.mark.django_db
def test_complete_order_invalid_transition_returns_400(
    api_client,
    business_user,
    completed_order,
):
    api_client.force_authenticate(user=business_user)

    response = api_client.patch(
        f"/api/v1/orders/{completed_order.id}/complete"
    )

    assert response.status_code == 400
    assert response.data["error"] == "INVALID_STATUS_TRANSITION"


@pytest.mark.django_db
def test_complete_order_requires_business_role(
    api_client,
    customer_user,
    pending_order,
):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/orders/{pending_order.id}/complete"
    )

    assert response.status_code == 403


# -----------------------------
# AUTH VALIDATION
# -----------------------------

@pytest.mark.django_db
def test_all_endpoints_require_authentication(api_client, pending_order):
    response = api_client.get("/api/v1/orders/")
    assert response.status_code == 401

    response = api_client.patch(
        f"/api/v1/orders/{pending_order.id}/complete"
    )
    assert response.status_code == 401