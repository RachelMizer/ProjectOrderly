from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command

from accounts.models import UserRole, CustomerProfile, UserRoleChoices
from suppliers.models import Supplier
from inventory.models import InventoryItem
from catalog.models import (
    Category,
    Product,
    ProductVariant,
    ModifierGroup,
    ModifierOption,
)

from accounts.management.commands.seed_data import make_unique_sku, ensure_variant


User = get_user_model()


@pytest.fixture
def supplier(db):
    return Supplier.objects.create(
        name="Test Supplier",
        email="supplier@example.com",
        phone="9195559999",
    )


@pytest.fixture
def category(db):
    return Category.objects.create(name="Coffee")


@pytest.fixture
def product(category, supplier):
    return Product.objects.create(
        category=category,
        supplier=supplier,
        name="Latte",
        has_variants=True,
        has_modifiers=True,
    )


@pytest.mark.django_db
def test_make_unique_sku_returns_non_empty_uppercase_value():
    sku = make_unique_sku("Latte Small")

    assert sku
    assert sku == sku.upper()
    assert "-" in sku or sku.isalnum()


@pytest.mark.django_db
def test_make_unique_sku_appends_suffix_when_duplicate_exists(product):
    ProductVariant.objects.create(
        product=product,
        name="Small",
        sku="LATTESMALL",
        unit_price=Decimal("4.50"),
    )

    sku = make_unique_sku("Latte Small")

    assert sku != "LATTESMALL"
    assert sku.startswith("LATTESMALL")


@pytest.mark.django_db
def test_ensure_variant_creates_new_variant(product):
    variant = ensure_variant(product, "Small", Decimal("4.50"))

    assert variant.product == product
    assert variant.name == "Small"
    assert variant.unit_price == Decimal("4.50")
    assert variant.sku


@pytest.mark.django_db
def test_ensure_variant_updates_existing_variant_price(product):
    existing = ProductVariant.objects.create(
        product=product,
        name="Small",
        sku="LATTE-SMALL-001",
        unit_price=Decimal("4.00"),
    )

    variant = ensure_variant(product, "Small", Decimal("4.50"))

    existing.refresh_from_db()
    assert variant.id == existing.id
    assert existing.unit_price == Decimal("4.50")


@pytest.mark.django_db
def test_ensure_variant_sets_missing_sku(product):
    existing = ProductVariant.objects.create(
        product=product,
        name="Large",
        sku="TEMP-SKU",
        unit_price=Decimal("5.25"),
    )
    existing.sku = ""
    existing.save(update_fields=["sku"])

    variant = ensure_variant(product, "Large", Decimal("5.25"))

    existing.refresh_from_db()
    assert variant.id == existing.id
    assert existing.sku


@pytest.mark.django_db
def test_seed_command_creates_expected_core_records():
    call_command("seed_data", seed=42)

    assert User.objects.filter(username="admin").exists()
    assert User.objects.filter(username="business1").exists()
    assert User.objects.filter(username="business2").exists()
    assert User.objects.filter(username="business3").exists()

    assert User.objects.filter(username="jortega").exists()
    assert User.objects.filter(username="mpatel").exists()
    assert User.objects.filter(username="anguyen").exists()
    assert User.objects.filter(username="tbrooks").exists()
    assert User.objects.filter(username="jkim").exists()
    assert User.objects.filter(username="crivera").exists()
    assert User.objects.filter(username="Rachel").exists()

    assert Supplier.objects.count() >= 4
    assert InventoryItem.objects.count() >= 6
    assert Category.objects.filter(name="Coffee").exists()
    assert Product.objects.filter(name="Latte").exists()
    assert ProductVariant.objects.filter(product__name="Latte", name="Small").exists()


@pytest.mark.django_db
def test_seed_command_creates_customer_roles_and_profiles():
    call_command("seed_data", seed=42)

    expected_customers = {
        "jortega": {"city": "Raleigh", "zipcode": "27609", "email_verified": True},
        "mpatel": {"city": "Cary", "zipcode": "27511", "email_verified": False},
        "anguyen": {"city": "Apex", "zipcode": "27502", "email_verified": True},
        "tbrooks": {"city": "Durham", "zipcode": "27701", "email_verified": True},
        "jkim": {"city": "Morrisville", "zipcode": "27560", "email_verified": False},
        "crivera": {"city": "Raleigh", "zipcode": "27605", "email_verified": True},
        "Rachel": {"city": "Raleigh", "zipcode": "27601", "email_verified": True},
    }

    for username, expected in expected_customers.items():
        user = User.objects.get(username=username)
        role = UserRole.objects.get(user=user)
        profile = CustomerProfile.objects.get(user=user)

        assert role.role == UserRoleChoices.CUSTOMER
        assert profile.state == "NC"
        assert profile.city == expected["city"]
        assert profile.zipcode == expected["zipcode"]
        assert profile.email_verified == expected["email_verified"]
        assert profile.phone


@pytest.mark.django_db
def test_seed_command_creates_latte_milk_type_modifier_group():
    call_command("seed_data", seed=42)

    group = ModifierGroup.objects.get(
        variant__product__name="Latte",
        variant__name="Small",
        name="Milk Type",
    )

    options = list(
        ModifierOption.objects.filter(group=group)
        .order_by("name")
        .values_list("name", flat=True)
    )

    assert group.required is False
    assert group.min_selections == 0
    assert group.max_selections == 1
    assert options == ["Almond Milk", "Oat Milk", "Whole Milk"]


@pytest.mark.django_db
def test_seed_command_is_idempotent_for_core_seed_data():
    call_command("seed_data", seed=42)
    first_counts = {
        "users": User.objects.count(),
        "suppliers": Supplier.objects.count(),
        "inventory": InventoryItem.objects.count(),
        "categories": Category.objects.count(),
        "products": Product.objects.count(),
    }

    call_command("seed_data", seed=42)
    second_counts = {
        "users": User.objects.count(),
        "suppliers": Supplier.objects.count(),
        "inventory": InventoryItem.objects.count(),
        "categories": Category.objects.count(),
        "products": Product.objects.count(),
    }

    assert first_counts == second_counts