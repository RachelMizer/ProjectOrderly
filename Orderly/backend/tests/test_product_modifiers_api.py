import pytest
from decimal import Decimal
from rest_framework.test import APIClient

from catalog.models import (
    Category,
    Product,
    ProductVariant,
    ModifierGroup,
    ModifierOption,
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def product_with_modifiers(db):
    category = Category.objects.create(name="Drinks")

    product = Product.objects.create(
        category=category,
        name="Latte",
        has_variants=True,
        has_modifiers=True,
    )

    variant = ProductVariant.objects.create(
        product=product,
        name="Medium",
        sku="LAT-M",
        unit_price=Decimal("4.50"),
        stock_quantity=10,
    )

    group = ModifierGroup.objects.create(
        variant=variant,
        name="Milk Type",
        required=True,
        min_selections=1,
        max_selections=1,
    )

    ModifierOption.objects.create(
        group=group,
        name="Whole Milk",
        price_adjustment=Decimal("0.00"),
    )

    ModifierOption.objects.create(
        group=group,
        name="Almond Milk",
        price_adjustment=Decimal("0.50"),
    )

    return {
        "product": product,
        "variant": variant,
        "group": group,
    }


@pytest.fixture
def product_without_modifiers(db):
    category = Category.objects.create(name="Simple")

    product = Product.objects.create(
        category=category,
        name="Water",
        has_variants=True,
        has_modifiers=False,
    )

    variant = ProductVariant.objects.create(
        product=product,
        name="Bottle",
        sku="WAT-1",
        unit_price=Decimal("1.00"),
        stock_quantity=10,
    )

    return {
        "product": product,
        "variant": variant,
    }


# ----------------------------------------
# SUCCESS CASES
# ----------------------------------------

@pytest.mark.django_db
def test_returns_contract_shape(api_client, product_with_modifiers):
    product = product_with_modifiers["product"]
    variant = product_with_modifiers["variant"]

    response = api_client.get(
        f"/api/v1/products/{product.id}/variants/{variant.id}/modifiers"
    )

    data = response.data

    assert "count" in data
    assert "groups" in data
    assert isinstance(data["groups"], list)


@pytest.mark.django_db
def test_returns_modifier_groups(api_client, product_with_modifiers):
    product = product_with_modifiers["product"]
    variant = product_with_modifiers["variant"]

    response = api_client.get(
        f"/api/v1/products/{product.id}/variants/{variant.id}/modifiers"
    )

    groups = response.data["groups"]

    assert len(groups) == 1
    assert response.data["count"] == 1


@pytest.mark.django_db
def test_returns_group_fields(api_client, product_with_modifiers):
    product = product_with_modifiers["product"]
    variant = product_with_modifiers["variant"]

    response = api_client.get(
        f"/api/v1/products/{product.id}/variants/{variant.id}/modifiers"
    )

    group = response.data["groups"][0]

    assert "id" in group
    assert "name" in group
    assert "required" in group
    assert "minSelections" in group
    assert "maxSelections" in group
    assert "count" in group
    assert "options" in group


@pytest.mark.django_db
def test_returns_modifier_options(api_client, product_with_modifiers):
    product = product_with_modifiers["product"]
    variant = product_with_modifiers["variant"]

    response = api_client.get(
        f"/api/v1/products/{product.id}/variants/{variant.id}/modifiers"
    )

    options = response.data["groups"][0]["options"]

    assert len(options) == 2


@pytest.mark.django_db
def test_returns_option_fields(api_client, product_with_modifiers):
    product = product_with_modifiers["product"]
    variant = product_with_modifiers["variant"]

    response = api_client.get(
        f"/api/v1/products/{product.id}/variants/{variant.id}/modifiers"
    )

    option = response.data["groups"][0]["options"][0]

    assert "id" in option
    assert "name" in option
    assert "priceAdjustment" in option
    assert "imageUrl" in option


@pytest.mark.django_db
def test_returns_required_flag_and_min_max(api_client, product_with_modifiers):
    product = product_with_modifiers["product"]
    variant = product_with_modifiers["variant"]

    response = api_client.get(
        f"/api/v1/products/{product.id}/variants/{variant.id}/modifiers"
    )

    group = response.data["groups"][0]

    assert group["required"] is True
    assert group["minSelections"] == 1
    assert group["maxSelections"] == 1
    assert group["count"] == 2


@pytest.mark.django_db
def test_returns_empty_list_when_no_modifiers(api_client, product_without_modifiers):
    product = product_without_modifiers["product"]
    variant = product_without_modifiers["variant"]

    response = api_client.get(
        f"/api/v1/products/{product.id}/variants/{variant.id}/modifiers"
    )

    assert response.status_code == 200
    assert response.data["count"] == 0
    assert response.data["groups"] == []

# ----------------------------------------
# NEGATIVE CASES
# ----------------------------------------

@pytest.mark.django_db
def test_invalid_variant_returns_404(api_client, product_with_modifiers):
    product = product_with_modifiers["product"]

    response = api_client.get(
        f"/api/v1/products/{product.id}/variants/999999/modifiers"
    )

    assert response.status_code == 404


@pytest.mark.django_db
def test_variant_not_belonging_to_product_returns_404(api_client, db):
    category = Category.objects.create(name="Test")

    product1 = Product.objects.create(
        category=category,
        name="Product1",
        has_variants=True,
    )
    product2 = Product.objects.create(
        category=category,
        name="Product2",
        has_variants=True,
    )

    variant = ProductVariant.objects.create(
        product=product2,
        name="Variant",
        sku="VAR-1",
        unit_price=Decimal("2.00"),
    )

    response = api_client.get(
        f"/api/v1/products/{product1.id}/variants/{variant.id}/modifiers"
    )

    assert response.status_code == 404