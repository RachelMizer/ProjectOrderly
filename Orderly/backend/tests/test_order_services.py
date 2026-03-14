import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model

from accounts.models import CustomerProfile, UserRole, UserRoleChoices
from catalog.models import Category, Product, ProductVariant
from orders.models import Order, OrderItem, OrderStatus
from orders.services import (
    add_item_to_order,
    get_or_create_draft_order,
    order_item_belongs_to_customer,
    recalculate_order_totals,
    update_order_item_quantity,
)

User = get_user_model()


@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="servicecustomer@test.com",
        email="servicecustomer@test.com",
        password="Password123!",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    CustomerProfile.objects.create(user=user)
    return user


@pytest.fixture
def other_customer_user(db):
    user = User.objects.create_user(
        username="othercustomer@test.com",
        email="othercustomer@test.com",
        password="Password123!",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    CustomerProfile.objects.create(user=user)
    return user


@pytest.fixture
def variant(db):
    category = Category.objects.create(name="Bakery")
    product = Product.objects.create(
        category=category,
        name="Muffin",
        description="Fresh muffin",
        has_variants=True,
        has_modifiers=False,
    )
    return ProductVariant.objects.create(
        product=product,
        name="Blueberry Muffin",
        sku="MUFFIN-BB-001",
        unit_price=Decimal("3.25"),
        stock_quantity=30,
        reorder_level=6,
    )


@pytest.mark.django_db
def test_get_or_create_draft_order_creates_once(customer_user):
    order, created = get_or_create_draft_order(customer_user.customer_profile)

    assert created is True
    assert order.status == OrderStatus.DRAFT

    same_order, created_again = get_or_create_draft_order(customer_user.customer_profile)

    assert created_again is False
    assert same_order.id == order.id


@pytest.mark.django_db
def test_add_item_to_order_merges_duplicate_variant(customer_user, variant):
    order, _ = get_or_create_draft_order(customer_user.customer_profile)

    item1 = add_item_to_order(order, variant, 1)
    item2 = add_item_to_order(order, variant, 2)

    item1.refresh_from_db()
    assert item1.id == item2.id
    assert item1.quantity == 3
    assert OrderItem.objects.filter(order=order, variant=variant).count() == 1


@pytest.mark.django_db
def test_recalculate_order_totals_uses_sum_of_item_totals(customer_user, variant):
    order, _ = get_or_create_draft_order(customer_user.customer_profile)
    add_item_to_order(order, variant, 2)

    recalculate_order_totals(order)
    order.refresh_from_db()

    assert order.subtotal == Decimal("6.50")
    assert order.tax_amount == Decimal("0.00")
    assert order.total_payment_due == Decimal("6.50")


@pytest.mark.django_db
def test_update_order_item_quantity_zero_deletes_item(customer_user, variant):
    order, _ = get_or_create_draft_order(customer_user.customer_profile)
    item = add_item_to_order(order, variant, 2)

    result = update_order_item_quantity(item, 0)

    assert result is None
    assert not OrderItem.objects.filter(id=item.id).exists()


@pytest.mark.django_db
def test_order_item_belongs_to_customer_checks_owner_and_draft_status(
    customer_user,
    other_customer_user,
    variant,
):
    order, _ = get_or_create_draft_order(customer_user.customer_profile)
    item = add_item_to_order(order, variant, 1)

    assert order_item_belongs_to_customer(item, customer_user.customer_profile) is True
    assert order_item_belongs_to_customer(item, other_customer_user.customer_profile) is False

    order.status = OrderStatus.PENDING
    order.save()

    assert order_item_belongs_to_customer(item, customer_user.customer_profile) is False