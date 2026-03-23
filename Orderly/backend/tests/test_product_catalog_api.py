import pytest
from decimal import Decimal
from rest_framework.test import APIClient

from catalog.models import Category, Product, ProductVariant


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def category(db):
    return Category.objects.create(name="Drinks")


@pytest.fixture
def products(category):
    coffee = Product.objects.create(
        category=category,
        name="Coffee",
        has_variants=True,
        has_modifiers=False,
    )
    tea = Product.objects.create(
        category=category,
        name="Tea",
        has_variants=True,
        has_modifiers=True,
    )
    water = Product.objects.create(
        category=category,
        name="Water",
        has_variants=False,
        has_modifiers=False,
    )

    ProductVariant.objects.create(
        product=coffee,
        name="Large",
        sku="COF-L",
        unit_price=Decimal("3.99"),
        stock_quantity=10,
    )
    ProductVariant.objects.create(
        product=coffee,
        name="Medium",
        sku="COF-M",
        unit_price=Decimal("2.99"),
        stock_quantity=5,
    )
    ProductVariant.objects.create(
        product=tea,
        name="Green",
        sku="TEA-G",
        unit_price=Decimal("1.99"),
        stock_quantity=8,
    )
    ProductVariant.objects.create(
        product=water,
        name="Bottle",
        sku="WAT-B",
        unit_price=Decimal("0.99"),
        stock_quantity=20,
    )

    return {
        "coffee": coffee,
        "tea": tea,
        "water": water,
    }


@pytest.mark.django_db
def test_get_products_returns_200(api_client, products):
    response = api_client.get("/api/v1/products")

    assert response.status_code == 200


@pytest.mark.django_db
def test_get_products_returns_paginated_contract_shape(api_client, products):
    response = api_client.get("/api/v1/products")

    assert "count" in response.data
    assert "pageSize" in response.data
    assert "next" in response.data
    assert "previous" in response.data
    assert "results" in response.data

    assert isinstance(response.data["results"], list)


@pytest.mark.django_db
def test_get_products_returns_required_product_fields(api_client, products):
    response = api_client.get("/api/v1/products")

    product = response.data["results"][0]

    assert "id" in product
    assert "name" in product
    assert "description" in product
    assert "hasVariants" in product
    assert "hasModifiers" in product
    assert "minPrice" in product
    assert "imageUrl" in product


@pytest.mark.django_db
def test_get_products_returns_default_page_size_50(api_client, products):
    response = api_client.get("/api/v1/products")

    assert response.status_code == 200
    assert response.data["pageSize"] == 50


@pytest.mark.django_db
def test_get_products_filters_by_category(api_client, db):
    drinks = Category.objects.create(name="Drinks")
    food = Category.objects.create(name="Food")

    drink_product = Product.objects.create(
        category=drinks,
        name="Coffee",
        has_variants=True,
        has_modifiers=False,
    )
    food_product = Product.objects.create(
        category=food,
        name="Bagel",
        has_variants=True,
        has_modifiers=False,
    )

    ProductVariant.objects.create(
        product=drink_product,
        name="Large",
        sku="COF-L2",
        unit_price=Decimal("3.99"),
        stock_quantity=5,
    )
    ProductVariant.objects.create(
        product=food_product,
        name="Plain",
        sku="BAG-P1",
        unit_price=Decimal("2.49"),
        stock_quantity=10,
    )

    response = api_client.get(f"/api/v1/products?categoryId={drinks.id}")

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["name"] == "Coffee"


@pytest.mark.django_db
def test_get_products_orders_products_alphabetically(api_client, category):
    zebra = Product.objects.create(
        category=category,
        name="Zebra Drink",
        has_variants=True,
        has_modifiers=False,
    )
    apple = Product.objects.create(
        category=category,
        name="Apple Drink",
        has_variants=True,
        has_modifiers=False,
    )

    ProductVariant.objects.create(
        product=zebra,
        name="Default",
        sku="ZEB-1",
        unit_price=Decimal("5.00"),
        stock_quantity=3,
    )
    ProductVariant.objects.create(
        product=apple,
        name="Default",
        sku="APP-1",
        unit_price=Decimal("4.00"),
        stock_quantity=3,
    )

    response = api_client.get("/api/v1/products")

    names = [product["name"] for product in response.data["results"]]

    assert names == sorted(names)


@pytest.mark.django_db
def test_get_products_returns_min_price_from_variants(api_client, products):
    response = api_client.get("/api/v1/products")

    coffee = next(
        product for product in response.data["results"] if product["name"] == "Coffee"
    )

    assert str(coffee["minPrice"]) == "2.99"


@pytest.mark.django_db
def test_get_products_returns_has_variants_and_has_modifiers(api_client, products):
    response = api_client.get("/api/v1/products")

    tea = next(product for product in response.data["results"] if product["name"] == "Tea")
    water = next(product for product in response.data["results"] if product["name"] == "Water")

    assert tea["hasVariants"] is True
    assert tea["hasModifiers"] is True
    assert water["hasVariants"] is False
    assert water["hasModifiers"] is False


@pytest.mark.django_db
def test_get_products_returns_image_url_field_as_none(api_client, products):
    response = api_client.get("/api/v1/products")

    for product in response.data["results"]:
        assert "imageUrl" in product
        assert product["imageUrl"] is None


@pytest.mark.django_db
def test_get_products_second_page_returns_previous_and_next_links(api_client, category):
    for i in range(60):
        product = Product.objects.create(
            category=category,
            name=f"Product {i:02d}",
            has_variants=True,
            has_modifiers=False,
        )
        ProductVariant.objects.create(
            product=product,
            name="Default",
            sku=f"SKU-{i:02d}",
            unit_price=Decimal("1.00"),
            stock_quantity=1,
        )

    response = api_client.get("/api/v1/products?page=2&pageSize=10")

    assert response.status_code == 200
    assert response.data["pageSize"] == 10
    assert response.data["count"] == 60
    assert response.data["next"] == "/api/v1/products?page=3&pageSize=10"
    assert response.data["previous"] == "/api/v1/products?page=1&pageSize=10"
    assert len(response.data["results"]) == 10


@pytest.mark.django_db
def test_get_products_pagination_links_include_category_id(api_client, db):
    drinks = Category.objects.create(name="Drinks")
    other = Category.objects.create(name="Other")

    for i in range(15):
        product = Product.objects.create(
            category=drinks,
            name=f"Drink {i:02d}",
            has_variants=True,
            has_modifiers=False,
        )
        ProductVariant.objects.create(
            product=product,
            name="Default",
            sku=f"DRINK-{i:02d}",
            unit_price=Decimal("2.00"),
            stock_quantity=2,
        )

    other_product = Product.objects.create(
        category=other,
        name="Other Product",
        has_variants=True,
        has_modifiers=False,
    )
    ProductVariant.objects.create(
        product=other_product,
        name="Default",
        sku="OTHER-01",
        unit_price=Decimal("9.99"),
        stock_quantity=2,
    )

    response = api_client.get(f"/api/v1/products?categoryId={drinks.id}&page=2&pageSize=5")

    assert response.status_code == 200
    assert response.data["count"] == 15
    assert response.data["next"] == f"/api/v1/products?page=3&pageSize=5&categoryId={drinks.id}"
    assert response.data["previous"] == f"/api/v1/products?page=1&pageSize=5&categoryId={drinks.id}"


@pytest.mark.django_db
def test_get_products_empty_result(api_client):
    response = api_client.get("/api/v1/products")

    assert response.status_code == 200
    assert response.data["count"] == 0
    assert response.data["pageSize"] == 50
    assert response.data["next"] is None
    assert response.data["previous"] is None
    assert response.data["results"] == []