
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import UserRole, UserRoleChoices
from catalog.models import Category, Product
from suppliers.models import Supplier
from inventory.models import InventoryItem

User = get_user_model()


# -------------------------
# Fixtures
# -------------------------

@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def business_user(db):
    user = User.objects.create_user(
        username="business@test.com",
        email="business@test.com",
        password="Password123!",
        first_name="STORE_MANAGER",
        last_name="User",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.STORE_MANAGER)
    return user


@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="customer@test.com",
        email="customer@test.com",
        password="Password123!",
        first_name="Customer",
        last_name="User",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    return user


@pytest.fixture
def no_role_user(db):
    return User.objects.create_user(
        username="norole@test.com",
        email="norole@test.com",
        password="Password123!",
        first_name="No",
        last_name="Role",
    )


@pytest.fixture
def supplier(db):
    return Supplier.objects.create(
        name="Test Supplier",
        email="supplier@test.com",
        phone="9195551234",
    )


@pytest.fixture
def category(db):
    return Category.objects.create(name="Coffee")


@pytest.fixture
def product(db, category, supplier):
    return Product.objects.create(
        category=category,
        supplier=supplier,
        name="Latte",
        description="Coffee drink",
        has_variants=True,
        has_modifiers=False,
    )


@pytest.fixture
def inventory_item(db):
    valid_unit = InventoryItem._meta.get_field("unit_of_measure").choices[0][0]

    return InventoryItem.objects.create(
        name="Coffee Beans",
        stock_quantity=10,
        unit_of_measure=valid_unit,
        reorder_level=2,
    )

# -------------------------
# Endpoint groups
# -------------------------

ADMIN_LIST_ENDPOINTS = [
    "/api/v1/admin/products",
    "/api/v1/admin/suppliers",
    "/api/v1/admin/inventory",
]

ADMIN_CREATE_ENDPOINTS = [
    ("POST", "/api/v1/admin/products"),
    ("POST", "/api/v1/admin/suppliers"),
    ("POST", "/api/v1/admin/inventory"),
]


# -------------------------
# Helpers
# -------------------------

def assert_invalid_role_response(response):
    assert response.status_code == 403
    assert response.data == {
        "error": "INVALID_ROLE",
        "message": "User does not have this permission.",
    }


# -------------------------
# Authentication tests
# -------------------------

@pytest.mark.django_db
@pytest.mark.parametrize("endpoint", ADMIN_LIST_ENDPOINTS)
def test_admin_list_endpoints_require_authentication(api_client, endpoint):
    response = api_client.get(endpoint)
    assert response.status_code == 401


@pytest.mark.django_db
@pytest.mark.parametrize("method, endpoint", ADMIN_CREATE_ENDPOINTS)
def test_admin_create_endpoints_require_authentication(api_client, method, endpoint):
    request_func = getattr(api_client, method.lower())
    response = request_func(endpoint, {}, format="json")
    assert response.status_code == 401


@pytest.mark.django_db
def test_admin_product_patch_requires_authentication(api_client, product):
    response = api_client.patch(
        f"/api/v1/admin/products/{product.id}",
        {"name": "Updated Name"},
        format="json",
    )
    assert response.status_code == 401


@pytest.mark.django_db
def test_admin_product_delete_requires_authentication(api_client, product):
    response = api_client.delete(f"/api/v1/admin/products/{product.id}")
    assert response.status_code == 401


@pytest.mark.django_db
def test_admin_supplier_patch_requires_authentication(api_client, supplier):
    response = api_client.patch(
        f"/api/v1/admin/suppliers/{supplier.id}",
        {"name": "Updated Supplier"},
        format="json",
    )
    assert response.status_code == 401


@pytest.mark.django_db
def test_admin_supplier_delete_requires_authentication(api_client, supplier):
    response = api_client.delete(f"/api/v1/admin/suppliers/{supplier.id}")
    assert response.status_code == 401


@pytest.mark.django_db
def test_admin_inventory_patch_requires_authentication(api_client, inventory_item):
    response = api_client.patch(
        f"/api/v1/admin/inventory/{inventory_item.id}",
        {"stock_quantity": 20},
        format="json",
    )
    assert response.status_code == 401


@pytest.mark.django_db
def test_admin_inventory_delete_requires_authentication(api_client, inventory_item):
    response = api_client.delete(f"/api/v1/admin/inventory/{inventory_item.id}")
    assert response.status_code == 401


# -------------------------
# Customer forbidden tests
# -------------------------

@pytest.mark.django_db
@pytest.mark.parametrize("endpoint", ADMIN_LIST_ENDPOINTS)
def test_customer_user_cannot_access_admin_list_endpoints(api_client, customer_user, endpoint):
    api_client.force_authenticate(user=customer_user)

    response = api_client.get(endpoint)

    assert_invalid_role_response(response)


@pytest.mark.django_db
@pytest.mark.parametrize("method, endpoint", ADMIN_CREATE_ENDPOINTS)
def test_customer_user_cannot_access_admin_create_endpoints(
    api_client,
    customer_user,
    method,
    endpoint,
):
    api_client.force_authenticate(user=customer_user)

    request_func = getattr(api_client, method.lower())
    response = request_func(endpoint, {}, format="json")

    assert_invalid_role_response(response)


@pytest.mark.django_db
def test_customer_user_cannot_patch_product(api_client, customer_user, product):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/admin/products/{product.id}",
        {"name": "Should Not Update"},
        format="json",
    )

    assert_invalid_role_response(response)


@pytest.mark.django_db
def test_customer_user_cannot_delete_product(api_client, customer_user, product):
    api_client.force_authenticate(user=customer_user)

    response = api_client.delete(f"/api/v1/admin/products/{product.id}")

    assert_invalid_role_response(response)


@pytest.mark.django_db
def test_customer_user_cannot_patch_supplier(api_client, customer_user, supplier):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/admin/suppliers/{supplier.id}",
        {"name": "Should Not Update"},
        format="json",
    )

    assert_invalid_role_response(response)


@pytest.mark.django_db
def test_customer_user_cannot_delete_supplier(api_client, customer_user, supplier):
    api_client.force_authenticate(user=customer_user)

    response = api_client.delete(f"/api/v1/admin/suppliers/{supplier.id}")

    assert_invalid_role_response(response)


@pytest.mark.django_db
def test_customer_user_cannot_patch_inventory(api_client, customer_user, inventory_item):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        f"/api/v1/admin/inventory/{inventory_item.id}",
        {"stock_quantity": 99},
        format="json",
    )

    assert_invalid_role_response(response)


@pytest.mark.django_db
def test_customer_user_cannot_delete_inventory(api_client, customer_user, inventory_item):
    api_client.force_authenticate(user=customer_user)

    response = api_client.delete(f"/api/v1/admin/inventory/{inventory_item.id}")

    assert_invalid_role_response(response)


# -------------------------
# No-role forbidden tests
# -------------------------

@pytest.mark.django_db
@pytest.mark.parametrize("endpoint", ADMIN_LIST_ENDPOINTS)
def test_user_without_role_cannot_access_admin_list_endpoints(api_client, no_role_user, endpoint):
    api_client.force_authenticate(user=no_role_user)

    response = api_client.get(endpoint)

    assert_invalid_role_response(response)


# -------------------------
# Business success tests
# -------------------------

@pytest.mark.django_db
def test_business_user_can_get_products(api_client, business_user, product):
    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/admin/products")

    assert response.status_code == 200
    assert "results" in response.data
    assert any(item["id"] == product.id for item in response.data["results"])


@pytest.mark.django_db
def test_business_user_can_get_suppliers(api_client, business_user, supplier):
    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/admin/suppliers")

    assert response.status_code == 200
    assert "results" in response.data
    assert any(item["id"] == supplier.id for item in response.data["results"])


@pytest.mark.django_db
def test_business_user_can_get_inventory(api_client, business_user, inventory_item):
    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/admin/inventory")

    assert response.status_code == 200
    assert "results" in response.data
    assert any(item["id"] == inventory_item.id for item in response.data["results"])


@pytest.mark.django_db
def test_business_user_can_patch_product(api_client, business_user, product):
    api_client.force_authenticate(user=business_user)

    response = api_client.patch(
        f"/api/v1/admin/products/{product.id}",
        {"name": "Updated RBAC Product"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["name"] == "Updated RBAC Product"

    product.refresh_from_db()
    assert product.name == "Updated RBAC Product"


@pytest.mark.django_db
def test_business_user_can_patch_supplier(api_client, business_user, supplier):
    api_client.force_authenticate(user=business_user)

    response = api_client.patch(
        f"/api/v1/admin/suppliers/{supplier.id}",
        {"name": "Updated RBAC Supplier"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["name"] == "Updated RBAC Supplier"

    supplier.refresh_from_db()
    assert supplier.name == "Updated RBAC Supplier"


@pytest.mark.django_db
def test_business_user_can_patch_inventory(api_client, business_user, inventory_item):
    api_client.force_authenticate(user=business_user)

    response = api_client.patch(
        f"/api/v1/admin/inventory/{inventory_item.id}",
        {"stock_quantity": 20},
        format="json",
    )

    assert response.status_code == 200
    assert float(response.data["stock_quantity"]) == 20.0

    inventory_item.refresh_from_db()
    assert inventory_item.stock_quantity == 20


@pytest.mark.django_db
def test_business_user_can_delete_product(api_client, business_user, product):
    api_client.force_authenticate(user=business_user)

    response = api_client.delete(f"/api/v1/admin/products/{product.id}")

    assert response.status_code == 204
    assert not Product.objects.filter(id=product.id).exists()


@pytest.mark.django_db
def test_business_user_can_delete_supplier(api_client, business_user, supplier):
    api_client.force_authenticate(user=business_user)

    response = api_client.delete(f"/api/v1/admin/suppliers/{supplier.id}")

    assert response.status_code == 204
    assert not Supplier.objects.filter(id=supplier.id).exists()


@pytest.mark.django_db
def test_business_user_can_delete_inventory(api_client, business_user, inventory_item):
    api_client.force_authenticate(user=business_user)

    response = api_client.delete(f"/api/v1/admin/inventory/{inventory_item.id}")

    assert response.status_code == 204
    assert not InventoryItem.objects.filter(id=inventory_item.id).exists()


# -------------------------
# Permission precedence tests
# -------------------------

@pytest.mark.django_db
def test_product_admin_permission_blocks_before_validation(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        "/api/v1/admin/products",
        {},
        format="json",
    )

    assert_invalid_role_response(response)


@pytest.mark.django_db
def test_supplier_admin_permission_blocks_before_validation(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        "/api/v1/admin/suppliers",
        {},
        format="json",
    )

    assert_invalid_role_response(response)


@pytest.mark.django_db
def test_inventory_admin_permission_blocks_before_validation(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.post(
        "/api/v1/admin/inventory",
        {},
        format="json",
    )

    assert_invalid_role_response(response)