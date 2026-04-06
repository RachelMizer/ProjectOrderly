import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import CustomerProfile, UserRole, UserRoleChoices
from orders.models import Order, OrderStatus

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="customer1@test.com",
        email="customer1@test.com",
        password="Password123!",
        first_name="Test",
        last_name="Customer",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    CustomerProfile.objects.create(user=user)
    return user


@pytest.fixture
def second_customer_user(db):
    user = User.objects.create_user(
        username="customer2@test.com",
        email="customer2@test.com",
        password="Password123!",
        first_name="Other",
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
        first_name="Plain",
        last_name="User",
    )


@pytest.mark.django_db
def test_post_draft_creates_draft_order_for_customer(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post("/api/v1/orders/draft")

    assert response.status_code == 201
    assert set(response.data.keys()) == {"id", "created"}
    assert response.data["created"] is True

    order = Order.objects.get(id=response.data["id"])
    assert order.customer == customer_user.customer_profile
    assert order.status == OrderStatus.DRAFT
    assert order.subtotal == 0
    assert order.tax_amount == 0
    assert order.total_payment_due == 0


@pytest.mark.django_db
def test_post_draft_returns_existing_draft_order(api_client, customer_user):
    existing_order = Order.objects.create(
        customer=customer_user.customer_profile,
        status=OrderStatus.DRAFT,
    )

    api_client.force_authenticate(user=customer_user)
    response = api_client.post("/api/v1/orders/draft")

    assert response.status_code == 200
    assert response.data == {
        "id": existing_order.id,
        "created": False,
    }
    assert Order.objects.filter(
        customer=customer_user.customer_profile,
        status=OrderStatus.DRAFT,
    ).count() == 1


@pytest.mark.django_db
def test_post_draft_is_scoped_to_authenticated_customer(
    api_client,
    customer_user,
    second_customer_user,
):
    customer_order = Order.objects.create(
        customer=customer_user.customer_profile,
        status=OrderStatus.DRAFT,
    )
    Order.objects.create(
        customer=second_customer_user.customer_profile,
        status=OrderStatus.DRAFT,
    )

    api_client.force_authenticate(user=customer_user)
    response = api_client.post("/api/v1/orders/draft")

    assert response.status_code == 200
    assert response.data["id"] == customer_order.id


@pytest.mark.django_db
def test_post_draft_requires_guest_email_for_unauthenticated_user(api_client):
    response = api_client.post("/api/v1/orders/draft")

    assert response.status_code == 400
    assert response.data == {
        "error": "INVALID_INPUT",
        "message": "guestEmail is required for guest carts.",
    }


@pytest.mark.django_db
def test_post_draft_forbidden_without_customer_profile(
    api_client,
    user_without_customer_profile,
):
    api_client.force_authenticate(user=user_without_customer_profile)

    response = api_client.post("/api/v1/orders/draft")

    assert response.status_code == 403
    assert response.data == {
        "error": "NOT_AUTHORIZED",
        "message": "Authenticated user does not have a customer profile.",
    }