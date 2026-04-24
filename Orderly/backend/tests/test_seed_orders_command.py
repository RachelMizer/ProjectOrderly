# backend/tests/test_seed_orders_command.py

from datetime import datetime
from decimal import Decimal
from itertools import cycle

import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.utils import timezone

from accounts.models import CustomerProfile, UserRole, UserRoleChoices
from catalog.models import Category, ModifierGroup, ModifierOption, Product, ProductVariant
from orders.models import Order, OrderItem, OrderItemModifier, OrderStatus

pytestmark = pytest.mark.django_db

User = get_user_model()


def make_customer(username: str) -> CustomerProfile:
    user = User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="Password123!",
        first_name=username.capitalize(),
        last_name="Tester",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    return CustomerProfile.objects.create(
        user=user,
        email_verified=True,
        street_address="123 Main St",
        city="Raleigh",
        state="NC",
        zipcode="27601",
        phone="9195551234",
    )


def add_variant(product_name: str, variant_name: str, price: str) -> ProductVariant:
    category = Category.objects.get_or_create(name="Seed Test Category")[0]
    product, _ = Product.objects.get_or_create(
        category=category,
        name=product_name,
        defaults={
            "has_variants": True,
            "has_modifiers": True,
        },
    )
    return ProductVariant.objects.create(
        product=product,
        name=variant_name,
        sku=f"{product_name}-{variant_name}".replace(" ", "-").upper(),
        unit_price=Decimal(price),
    )


def add_modifier_options(
    variant: ProductVariant,
    group_name: str,
    options: list[tuple[str, str]],
) -> None:
    group = ModifierGroup.objects.create(
        variant=variant,
        name=group_name,
        required=False,
        min_selections=0,
        max_selections=max(1, len(options)),
    )
    for option_name, price in options:
        ModifierOption.objects.create(
            group=group,
            name=option_name,
            price_adjustment=Decimal(price),
        )


@pytest.fixture
def seeded_order_prereqs():
    make_customer("customer1")
    make_customer("customer2")

    # Latte
    latte_small = add_variant("Latte", "Small", "4.50")
    latte_medium = add_variant("Latte", "Medium", "5.00")
    latte_large = add_variant("Latte", "Large", "5.50")
    for variant in (latte_small, latte_medium, latte_large):
        add_modifier_options(
            variant,
            "Milk Type",
            [("Whole Milk", "0.00"), ("Oat Milk", "0.75"), ("Almond Milk", "0.75")],
        )
    add_modifier_options(latte_small, "Flavor Syrup", [("Caramel", "0.50")])
    add_modifier_options(latte_medium, "Flavor Syrup", [("Vanilla", "0.50")])

    # Bakery / coffee / other simple products
    add_variant("Blueberry Muffin", "Standard", "2.95")
    add_variant("Chocolate Croissant", "Standard", "3.45")
    add_variant("House Coffee", "Small", "2.50")
    add_variant("House Coffee", "Medium", "2.95")
    add_variant("House Coffee", "Large", "3.25")

    cake_pop = add_variant("Cake Pop", "Birthday Cake", "2.00")

    cold_brew_small = add_variant("Cold Brew", "Small", "3.75")
    cold_brew_large = add_variant("Cold Brew", "Large", "4.50")
    add_modifier_options(cold_brew_large, "Cold Brew Add-Ons", [("Sweet Cream", "0.75")])

    green_tea_small = add_variant("Green Tea", "Small", "2.75")
    green_tea_medium = add_variant("Green Tea", "Medium", "3.10")

    chai_medium = add_variant("Chai Tea Latte", "Medium", "4.75")
    chai_large = add_variant("Chai Tea Latte", "Large", "5.25")
    add_modifier_options(chai_medium, "Milk Type", [("Almond Milk", "0.75")])

    breakfast = add_variant("Breakfast Sandwich", "Standard", "5.95")
    add_modifier_options(
        breakfast,
        "Bread Choice",
        [("Bagel", "0.50"), ("Croissant", "0.00")],
    )
    add_modifier_options(
        breakfast,
        "Protein Add-On",
        [("Bacon", "1.00")],
    )

    # Pumpkin Spice Latte
    psl_small = add_variant("Pumpkin Spice Latte", "Small", "5.00")
    psl_medium = add_variant("Pumpkin Spice Latte", "Medium", "5.50")
    psl_large = add_variant("Pumpkin Spice Latte", "Large", "6.00")
    for variant in (psl_small, psl_medium, psl_large):
        add_modifier_options(
            variant,
            "Seasonal Toppings",
            [("Whipped Cream", "0.50"), ("Pumpkin Drizzle", "0.50")],
        )

    return True


def _fake_randint(a: int, b: int) -> int:
    if (a, b) == (500, 700):
        return 2
    return a


def _fake_choice(seq):
    first = seq[0]
    if isinstance(first, CustomerProfile):
        return seq[0]
    if isinstance(first, dict) and "items" in first:
        seasonal = [template for template in seq if template.get("seasonal")]
        return seasonal[0] if seasonal else seq[0]
    return seq[0]


def test_seed_orders_creates_backdated_orders_with_expected_statuses_and_totals(
    monkeypatch,
    seeded_order_prereqs,
):
    from orders.management.commands import seed_orders as seed_orders_module

    fake_now = timezone.make_aware(datetime(2025, 12, 15, 12, 0, 0))
    random_values = cycle([0.1, 0.9])  # one pending and one completed in current month

    monkeypatch.setattr(seed_orders_module.timezone, "now", lambda: fake_now)
    monkeypatch.setattr(seed_orders_module.random, "randint", _fake_randint)
    monkeypatch.setattr(seed_orders_module.random, "choice", _fake_choice)
    monkeypatch.setattr(seed_orders_module.random, "random", lambda: next(random_values))

    call_command("seed_orders")

    orders = Order.objects.order_by("order_date")
    assert orders.count() == 10  # Aug-Dec 2025 inclusive, 2 per month

    assert orders.first().order_date.year == 2025
    assert orders.first().order_date.month == 8
    assert orders.last().order_date.year == 2025
    assert orders.last().order_date.month == 12
    assert orders.last().order_date.day <= 15

    past_orders = Order.objects.exclude(order_date__year=2025, order_date__month=12)
    assert past_orders.exists()
    assert set(past_orders.values_list("status", flat=True)) == {OrderStatus.COMPLETED}

    current_month_orders = Order.objects.filter(order_date__year=2025, order_date__month=12)
    assert current_month_orders.count() == 2
    assert set(current_month_orders.values_list("status", flat=True)) == {
        OrderStatus.PENDING,
        OrderStatus.COMPLETED,
    }

    assert OrderItem.objects.count() > 0
    assert all(order.items.exists() for order in orders)

    for order in orders:
        assert order.customer is not None
        assert order.guest_email in (None, "")
        assert order.subtotal >= Decimal("0.00")
        assert order.tax_amount >= Decimal("0.00")
        assert order.total_payment_due == order.subtotal + order.tax_amount


def test_seed_orders_only_places_pumpkin_spice_latte_in_august_through_november(
    monkeypatch,
    seeded_order_prereqs,
):
    from orders.management.commands import seed_orders as seed_orders_module

    fake_now = timezone.make_aware(datetime(2025, 12, 15, 12, 0, 0))
    random_values = cycle([0.1, 0.9])

    monkeypatch.setattr(seed_orders_module.timezone, "now", lambda: fake_now)
    monkeypatch.setattr(seed_orders_module.random, "randint", _fake_randint)
    monkeypatch.setattr(seed_orders_module.random, "choice", _fake_choice)
    monkeypatch.setattr(seed_orders_module.random, "random", lambda: next(random_values))

    call_command("seed_orders")

    psl_items = OrderItem.objects.filter(variant__product__name="Pumpkin Spice Latte").select_related("order")
    assert psl_items.exists()
    assert set(psl_items.values_list("order__order_date__month", flat=True)) <= {8, 9, 10, 11}

    non_fall_psl = OrderItem.objects.filter(
        variant__product__name="Pumpkin Spice Latte",
        order__order_date__month__in=[1, 2, 3, 4, 5, 6, 7, 12],
    )
    assert non_fall_psl.count() == 0


def test_seed_orders_clear_reseeds_instead_of_accumulating(
    monkeypatch,
    seeded_order_prereqs,
):
    from orders.management.commands import seed_orders as seed_orders_module

    fake_now = timezone.make_aware(datetime(2025, 12, 15, 12, 0, 0))
    random_values = cycle([0.1, 0.9])

    monkeypatch.setattr(seed_orders_module.timezone, "now", lambda: fake_now)
    monkeypatch.setattr(seed_orders_module.random, "randint", _fake_randint)
    monkeypatch.setattr(seed_orders_module.random, "choice", _fake_choice)
    monkeypatch.setattr(seed_orders_module.random, "random", lambda: next(random_values))

    call_command("seed_orders")
    first_count = Order.objects.count()
    assert first_count == 10

    call_command("seed_orders")
    assert Order.objects.count() == 20

    call_command("seed_orders", "--clear")
    assert Order.objects.count() == 10


def test_seed_orders_raises_error_when_no_customer_profiles_exist(seeded_order_prereqs):
    Order.objects.all().delete()
    CustomerProfile.objects.all().delete()

    with pytest.raises(CommandError, match="No customer profiles found"):
        call_command("seed_orders")