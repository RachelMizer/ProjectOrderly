import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import UserRole, UserRoleChoices
from catalog.models import Category, Product, ProductVariant
from inventory.models import InventoryItem

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
    UserRole.objects.create(user=user, role=UserRoleChoices.BUSINESS)
    return user


@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="customer@test.com",
        email="customer@test.com",
        password="Password123!",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
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


@pytest.mark.django_db
def test_low_stock_returns_variants_and_inventory_items(
    api_client, business_user, product
):
    variant = ProductVariant.objects.create(
        product=product,
        name="Large",
        sku="LATTE-LG",
        unit_price=Decimal("5.00"),
        stock_quantity=5,
        reorder_level=10,
    )

    item = InventoryItem.objects.create(
        name="Milk",
        stock_quantity=Decimal("2.00"),
        reorder_level=Decimal("2.00"),
    )

    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/admin/inventory/low-stock")

    assert response.status_code == 200
    assert len(response.data["productVariants"]) == 1
    assert len(response.data["inventoryItems"]) == 1
    assert response.data["productVariants"][0]["id"] == variant.id
    assert response.data["inventoryItems"][0]["id"] == item.id


@pytest.mark.django_db
def test_low_stock_filters_only_items_below_or_equal_threshold(
    api_client, business_user, product
):
    low_variant = ProductVariant.objects.create(
        product=product,
        name="Low",
        sku="LOW",
        unit_price=Decimal("5.00"),
        stock_quantity=5,
        reorder_level=5,
    )

    ProductVariant.objects.create(
        product=product,
        name="High",
        sku="HIGH",
        unit_price=Decimal("5.00"),
        stock_quantity=10,
        reorder_level=5,
    )

    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/admin/inventory/low-stock")

    assert response.status_code == 200
    assert len(response.data["productVariants"]) == 1
    assert response.data["productVariants"][0]["id"] == low_variant.id


@pytest.mark.django_db
def test_low_stock_excludes_null_values(api_client, business_user, product):
    ProductVariant.objects.create(
        product=product,
        name="NullStock",
        sku="NULL1",
        unit_price=Decimal("5.00"),
        stock_quantity=None,
        reorder_level=5,
    )

    ProductVariant.objects.create(
        product=product,
        name="NullReorder",
        sku="NULL2",
        unit_price=Decimal("5.00"),
        stock_quantity=5,
        reorder_level=None,
    )

    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/admin/inventory/low-stock")

    assert response.status_code == 200
    assert response.data["productVariants"] == []


@pytest.mark.django_db
def test_low_stock_returns_empty_lists_when_no_results(api_client, business_user):
    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/admin/inventory/low-stock")

    assert response.status_code == 200
    assert response.data == {
        "productVariants": [],
        "inventoryItems": [],
    }


@pytest.mark.django_db
def test_low_stock_requires_authentication(api_client):
    response = api_client.get("/api/v1/admin/inventory/low-stock")
    assert response.status_code == 401


@pytest.mark.django_db
def test_low_stock_requires_business_role(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.get("/api/v1/admin/inventory/low-stock")

    assert response.status_code == 403
    assert response.data["error"] == "INVALID_ROLE"
    assert response.data["message"] == "User does not have this permission."


@pytest.mark.django_db
def test_low_stock_response_structure(api_client, business_user, product):
    ProductVariant.objects.create(
        product=product,
        name="Test",
        sku="TEST",
        unit_price=Decimal("5.00"),
        stock_quantity=2,
        reorder_level=5,
    )

    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/admin/inventory/low-stock")

    assert response.status_code == 200

    variant_data = response.data["productVariants"][0]

    assert "id" in variant_data
    assert "stockQuantity" in variant_data
    assert "reorderLevel" in variant_data


@pytest.mark.django_db
def test_low_stock_should_include_variant_name_per_acceptance_criteria(
    api_client, business_user, product
):
    ProductVariant.objects.create(
        product=product,
        name="Large Latte",
        sku="LATTE",
        unit_price=Decimal("5.00"),
        stock_quantity=1,
        reorder_level=5,
    )

    api_client.force_authenticate(user=business_user)

    response = api_client.get("/api/v1/admin/inventory/low-stock")

    assert response.status_code == 200
    variant_data = response.data["productVariants"][0]
    assert "name" in variant_data

@pytest.mark.django_db
def test_low_stock_inventory_item_can_be_created_and_flagged_when_reorder_exceeds_stock(
    api_client, business_user
):
    api_client.force_authenticate(user=business_user)

    create_response = api_client.post(
        "/api/v1/admin/inventory",
        {
            "name": "Test Milk",
            "stock_quantity": "5.00",
            "unit_of_measure": "l",
            "reorder_level": "12.00",
        },
        format="json",
    )

    assert create_response.status_code == 201
    assert create_response.data["name"] == "Test Milk"
    assert create_response.data["stock_quantity"] == "5.00"
    assert create_response.data["reorder_level"] == "12.00"

    low_stock_response = api_client.get("/api/v1/admin/inventory/low-stock")

    assert low_stock_response.status_code == 200
    assert len(low_stock_response.data["inventoryItems"]) == 1

    item = low_stock_response.data["inventoryItems"][0]
    assert item["name"] == "Test Milk"
    assert item["stockQuantity"] == "5.00"
    assert item["reorderLevel"] == "12.00"