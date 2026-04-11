import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from catalog.models import Product, ProductVariant, Category
from accounts.models import UserRole, UserRoleChoices

User = get_user_model()


# =========================
# FIXTURES
# =========================

@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def business_user(db):
    user = User.objects.create_user(
        username="business@test.com",
        password="Password123!"
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.BUSINESS)
    return user


@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="customer@test.com",
        password="Password123!"
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    return user


@pytest.fixture
def admin_client(api_client, business_user):
    api_client.force_authenticate(user=business_user)
    return api_client


@pytest.fixture
def customer_client(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)
    return api_client


@pytest.fixture
def category(db):
    return Category.objects.create(name="Coffee")


@pytest.fixture
def product(db, category):
    return Product.objects.create(name="Latte", category=category)


@pytest.fixture
def variant(db, product):
    return ProductVariant.objects.create(
        product=product,
        name="Small",
        sku="SKU123",
        unit_price=5.00,
        stock_quantity=10
    )


# =========================
# TESTS — VIEW INVENTORY
# =========================

@pytest.mark.django_db
def test_admin_can_view_variant_inventory(admin_client, product, variant):
    response = admin_client.get(f"/api/v1/admin/products/{product.id}/variants")

    assert response.status_code == 200
    assert "results" in response.data

    item = response.data["results"][0]

    assert item["id"] == variant.id
    assert item["name"] == variant.name
    assert "stock_quantity" in item
    assert "reorder_level" in item


# =========================
# TESTS — UPDATE INVENTORY
# =========================

@pytest.mark.django_db
def test_admin_can_update_variant_stock(admin_client, product, variant):
    response = admin_client.patch(
        f"/api/v1/admin/products/{product.id}/variants/{variant.id}",
        {"stock_quantity": 25},
        format="json"
    )

    assert response.status_code == 200
    assert float(response.data["stock_quantity"]) == 25.0

    variant.refresh_from_db()
    assert variant.stock_quantity == 25


# =========================
# VALIDATION TESTS
# =========================

@pytest.mark.django_db
def test_stock_cannot_be_set_below_zero(admin_client, product, variant):
    response = admin_client.patch(
        f"/api/v1/admin/products/{product.id}/variants/{variant.id}",
        {"stock_quantity": -1},
        format="json"
    )

    assert response.status_code == 400
    assert "stock_quantity" in response.data


# =========================
# AVAILABILITY TEST
# =========================

@pytest.mark.django_db
def test_stock_change_reflects_in_availability(admin_client, product, variant):
    # Set stock to 0
    admin_client.patch(
        f"/api/v1/admin/products/{product.id}/variants/{variant.id}",
        {"stock_quantity": 0},
        format="json"
    )

    # Check public endpoint
    response = admin_client.get(f"/api/v1/products/{product.id}/variants")

    assert response.status_code == 200

    variant_data = response.data["results"][0]

    assert variant_data["stockQuantity"] == 0
    assert variant_data["isAvailable"] is False


# =========================
# RBAC TESTS
# =========================

@pytest.mark.django_db
def test_customer_cannot_view_inventory(customer_client, product, variant):
    response = customer_client.get(f"/api/v1/admin/products/{product.id}/variants")

    assert response.status_code == 403
    assert response.data["error"] == "INVALID_ROLE"


@pytest.mark.django_db
def test_customer_cannot_update_inventory(customer_client, product, variant):
    response = customer_client.patch(
        f"/api/v1/admin/products/{product.id}/variants/{variant.id}",
        {"stock_quantity": 50},
        format="json"
    )

    assert response.status_code == 403
    assert response.data["error"] == "INVALID_ROLE"


# =========================
# AUTH TESTS
# =========================

@pytest.mark.django_db
def test_unauthenticated_user_blocked(api_client, product, variant):
    response = api_client.get(f"/api/v1/admin/products/{product.id}/variants")

    assert response.status_code == 401