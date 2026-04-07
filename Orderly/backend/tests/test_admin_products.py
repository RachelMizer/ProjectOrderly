import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from catalog.models import Category, Product, ProductVariant
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
        username="admin@test.com",
        password="password123"
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.BUSINESS)
    return user


@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="customer@test.com",
        password="password123"
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
    return Category.objects.create(name="Test Category")


@pytest.fixture
def product(db, category):
    return Product.objects.create(
        name="Test Product",
        category=category
    )


@pytest.fixture
def variant(db, product):
    return ProductVariant.objects.create(
        product=product,
        name="Small",
        sku="SKU123",
        unit_price=5.00
    )


# =========================
# PRODUCT TESTS
# =========================

@pytest.mark.django_db
def test_admin_can_create_product(admin_client, category):
    response = admin_client.post("/api/v1/admin/products", {
        "name": "New Product",
        "category": category.id
    })

    assert response.status_code == 201
    assert Product.objects.filter(name="New Product").exists()


@pytest.mark.django_db
def test_admin_can_update_product(admin_client, product):
    response = admin_client.patch(
        f"/api/v1/admin/products/{product.id}",
        {"name": "Updated Product"},
        format="json"
    )

    product.refresh_from_db()
    assert response.status_code == 200
    assert product.name == "Updated Product"


@pytest.mark.django_db
def test_admin_can_delete_product(admin_client, product):
    response = admin_client.delete(f"/api/v1/admin/products/{product.id}")

    assert response.status_code == 204
    assert not Product.objects.filter(id=product.id).exists()


# =========================
# VARIANT TESTS
# =========================

@pytest.mark.django_db
def test_admin_can_create_variant(admin_client, product):
    response = admin_client.post(
        f"/api/v1/admin/products/{product.id}/variants",
        {
            "name": "Medium",
            "sku": "SKU456",
            "unit_price": 7.50
        }
    )

    assert response.status_code == 201
    assert ProductVariant.objects.filter(name="Medium").exists()


@pytest.mark.django_db
def test_variant_associated_with_product(admin_client, product):
    admin_client.post(
        f"/api/v1/admin/products/{product.id}/variants",
        {
            "name": "Large",
            "sku": "SKU789",
            "unit_price": 9.00
        }
    )

    variant = ProductVariant.objects.get(name="Large")
    assert variant.product.id == product.id


@pytest.mark.django_db
def test_admin_can_update_variant(admin_client, variant, product):
    response = admin_client.patch(
        f"/api/v1/admin/products/{product.id}/variants/{variant.id}",
        {"unit_price": 10.00},
        format="json"
    )

    variant.refresh_from_db()
    assert response.status_code == 200
    assert float(variant.unit_price) == 10.00


@pytest.mark.django_db
def test_admin_can_delete_variant(admin_client, variant, product):
    response = admin_client.delete(
        f"/api/v1/admin/products/{product.id}/variants/{variant.id}"
    )

    assert response.status_code == 204
    assert not ProductVariant.objects.filter(id=variant.id).exists()


# =========================
# VALIDATION TESTS
# =========================

@pytest.mark.django_db
def test_product_validation_fails(admin_client, category):
    response = admin_client.post("/api/v1/admin/products", {
        "name": "",
        "category": category.id
    })

    assert response.status_code == 400


@pytest.mark.django_db
def test_variant_validation_fails(admin_client, product):
    response = admin_client.post(
        f"/api/v1/admin/products/{product.id}/variants",
        {
            "name": "",
            "sku": "SKU000",
            "unit_price": -1
        }
    )

    assert response.status_code == 400


# =========================
# RBAC TESTS
# =========================

@pytest.mark.django_db
def test_customer_cannot_create_product(customer_client, category):
    response = customer_client.post("/api/v1/admin/products", {
        "name": "Unauthorized",
        "category": category.id
    })

    assert response.status_code == 403
    assert response.data["error"] == "INVALID_ROLE"


@pytest.mark.django_db
def test_unauthenticated_user_blocked(api_client, category):
    response = api_client.post("/api/v1/admin/products", {
        "name": "No Auth",
        "category": category.id
    })

    assert response.status_code in [401, 403]