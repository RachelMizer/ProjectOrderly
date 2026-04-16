from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from accounts.models import CustomerProfile, UserRole, UserRoleChoices
from catalog.models import Category, Product, ProductVariant, ModifierGroup, ModifierOption
from inventory.models import InventoryItem, UnitOfMeasure, VariantInventoryUsage
from orders.models import Order, OrderItem, OrderItemModifier, Payment, OrderStatus, PaymentType
from suppliers.models import Supplier


User = get_user_model()


# -------------------------
# Helper fixtures / builders
# -------------------------

@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="cust1",
        email="cust1@example.com",
        password="password123",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    return user


@pytest.fixture
def business_user(db):
    user = User.objects.create_user(
        username="biz1",
        email="biz1@example.com",
        password="password123",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.BUSINESS)
    return user


@pytest.fixture
def customer_profile(customer_user):
    return CustomerProfile.objects.create(
        user=customer_user,
        state="NC",
        zipcode="27606",
        phone="9195551234",
    )


@pytest.fixture
def supplier(db):
    return Supplier.objects.create(
        name="Coffee Vendor",
        email="vendor@example.com",
        phone="9195551111",
    )


@pytest.fixture
def category(db):
    return Category.objects.create(name="Beverages")


@pytest.fixture
def product(category, supplier):
    return Product.objects.create(
        category=category,
        supplier=supplier,
        name="Latte",
        has_variants=True,
        has_modifiers=True,
    )


@pytest.fixture
def variant(product):
    return ProductVariant.objects.create(
        product=product,
        name="Medium",
        sku="LATTE-MED-001",
        unit_price=Decimal("4.50"),
        stock_quantity=10,
        reorder_level=2,
    )


@pytest.fixture
def modifier_group(variant):
    return ModifierGroup.objects.create(
        variant=variant,
        name="Milk Type",
        required=False,
        min_selections=0,
        max_selections=1,
    )


@pytest.fixture
def modifier_option(modifier_group):
    return ModifierOption.objects.create(
        group=modifier_group,
        name="Almond Milk",
        price_adjustment=Decimal("0.75"),
    )


# -------------------------
# Accounts model tests
# -------------------------

@pytest.mark.django_db
def test_customer_profile_requires_customer_role(business_user):
    with pytest.raises(ValidationError) as exc:
        CustomerProfile.objects.create(user=business_user)

    assert "Selected user must have role CUSTOMER." in str(exc.value)


@pytest.mark.django_db
def test_customer_profile_rejects_invalid_state_and_phone(customer_user):
    with pytest.raises(ValidationError) as exc:
        CustomerProfile.objects.create(
            user=customer_user,
            state=" nc ",
            zipcode="27606",
            phone="(919) 555-1234",
        )

    assert "State must be a 2-letter uppercase code" in str(exc.value)
    assert "Enter a valid phone number" in str(exc.value)


# -------------------------
# Supplier model tests
# -------------------------

@pytest.mark.django_db
def test_supplier_strips_whitespace_on_save():
    supplier = Supplier.objects.create(
        name="  Bean Source  ",
        phone="  9195552222  ",
    )

    assert supplier.name == "Bean Source"
    assert supplier.phone == "9195552222"


@pytest.mark.django_db
def test_supplier_rejects_too_short_name():
    supplier = Supplier(name="A")

    with pytest.raises(ValidationError) as exc:
        supplier.save()

    assert "Supplier name is too short." in str(exc.value)


# -------------------------
# Catalog model tests
# -------------------------

@pytest.mark.django_db
def test_category_and_product_variant_str():
    category = Category.objects.create(name="Food")
    product = Product.objects.create(category=category, name="Bagel")
    variant = ProductVariant.objects.create(
        product=product,
        name="Regular",
        sku="BAGEL-REG-001",
        unit_price=Decimal("2.50"),
    )

    assert str(category) == "Food"
    assert str(product) == "Bagel"
    assert str(variant) == "Bagel — Regular"


@pytest.mark.django_db
def test_modifier_option_str(variant):
    group = ModifierGroup.objects.create(
        variant=variant,
        name="Extras",
        required=False,
        min_selections=0,
        max_selections=2,
    )
    option = ModifierOption.objects.create(
        group=group,
        name="Extra Shot",
        price_adjustment=Decimal("1.00"),
    )

    assert str(group) == f"{variant} — Extras"
    assert str(option) == "Extras: Extra Shot"


# -------------------------
# Inventory model tests
# -------------------------


@pytest.mark.django_db
def test_inventory_item_blocks_unit_change_when_used_in_recipe(variant):
    item = InventoryItem.objects.create(
        name="Whole Milk",
        stock_quantity=Decimal("20.00"),
        unit_of_measure=UnitOfMeasure.OZ,
        reorder_level=Decimal("5.00"),
    )

    VariantInventoryUsage.objects.create(
        variant=variant,
        inventory_item=item,
        quantity_used=Decimal("8.00"),
    )

    item.unit_of_measure = UnitOfMeasure.ML

    with pytest.raises(ValidationError) as exc:
        item.save()

    assert "Cannot change unit_of_measure while this item is used in recipes." in str(exc.value)


# -------------------------
# Order model tests
# -------------------------

@pytest.mark.django_db
def test_order_guest_checkout_saves_and_auto_calculates_total():
    order = Order.objects.create(
        guest_email="guest@example.com",
        subtotal=Decimal("10.00"),
        tax_amount=Decimal("0.80"),
    )

    assert order.total_payment_due == Decimal("10.80")
    assert order.status == OrderStatus.DRAFT
    assert str(order) == f"Order #{order.id} (guest@example.com)"


@pytest.mark.django_db
def test_order_rejects_both_customer_and_guest(customer_profile):
    order = Order(
        customer=customer_profile,
        guest_email="guest@example.com",
        subtotal=Decimal("5.00"),
        tax_amount=Decimal("0.40"),
        total_payment_due=Decimal("5.40"),
    )

    with pytest.raises(ValidationError) as exc:
        order.save()

    assert "Provide either a customer OR a guest email" in str(exc.value)


@pytest.mark.django_db
def test_order_rejects_neither_customer_nor_guest():
    order = Order(
        subtotal=Decimal("5.00"),
        tax_amount=Decimal("0.40"),
        total_payment_due=Decimal("5.40"),
    )

    with pytest.raises(ValidationError) as exc:
        order.save()

    assert "Provide either a customer OR a guest email" in str(exc.value)


@pytest.mark.django_db
def test_order_non_draft_requires_at_least_one_item(customer_profile):
    order = Order.objects.create(
        customer=customer_profile,
        subtotal=Decimal("0.00"),
        tax_amount=Decimal("0.00"),
    )

    order.status = OrderStatus.PENDING

    with pytest.raises(ValidationError) as exc:
        order.save()

    assert "Non-draft orders must have at least one item." in str(exc.value)


# -------------------------
# OrderItem model tests
# -------------------------

@pytest.mark.django_db
def test_order_item_auto_calculates_item_total(customer_profile, variant):
    order = Order.objects.create(
        customer=customer_profile,
        subtotal=Decimal("9.00"),
        tax_amount=Decimal("0.72"),
    )

    item = OrderItem.objects.create(
        order=order,
        variant=variant,
        quantity=2,
        unit_price_charged=Decimal("4.50"),
    )

    assert item.item_total == Decimal("9.00")
    assert str(item) == f"{order} — {variant} x2"


@pytest.mark.django_db
def test_order_item_rejects_quantity_less_than_one(customer_profile, variant):
    order = Order.objects.create(
        customer=customer_profile,
        subtotal=Decimal("0.00"),
        tax_amount=Decimal("0.00"),
    )

    item = OrderItem(
        order=order,
        variant=variant,
        quantity=0,
        unit_price_charged=Decimal("4.50"),
        item_total=Decimal("0.00"),
    )

    with pytest.raises(ValidationError) as exc:
        item.save()

    assert "Quantity must be at least 1." in str(exc.value)


# -------------------------
# OrderItemModifier model tests
# -------------------------

@pytest.mark.django_db
def test_order_item_modifier_saves_valid_record(customer_profile, variant, modifier_option):
    order = Order.objects.create(
        customer=customer_profile,
        subtotal=Decimal("4.50"),
        tax_amount=Decimal("0.36"),
    )
    item = OrderItem.objects.create(
        order=order,
        variant=variant,
        quantity=1,
        unit_price_charged=Decimal("4.50"),
    )

    modifier = OrderItemModifier.objects.create(
        order_item=item,
        modifier_option=modifier_option,
        price_adjustment_charged=Decimal("0.75"),
    )

    assert modifier.price_adjustment_charged == Decimal("0.75")


@pytest.mark.django_db
def test_order_item_modifier_rejects_negative_price(customer_profile, variant, modifier_option):
    order = Order.objects.create(
        customer=customer_profile,
        subtotal=Decimal("4.50"),
        tax_amount=Decimal("0.36"),
    )
    item = OrderItem.objects.create(
        order=order,
        variant=variant,
        quantity=1,
        unit_price_charged=Decimal("4.50"),
    )

    modifier = OrderItemModifier(
        order_item=item,
        modifier_option=modifier_option,
        price_adjustment_charged=Decimal("-0.50"),
    )

    with pytest.raises(ValidationError) as exc:
        modifier.save()

    assert "Price adjustment cannot be negative." in str(exc.value)


# -------------------------
# Payment model tests
# -------------------------

@pytest.mark.django_db
def test_payment_saves_for_non_cancelled_order(customer_profile):
    order = Order.objects.create(
        customer=customer_profile,
        subtotal=Decimal("12.00"),
        tax_amount=Decimal("0.96"),
    )

    payment = Payment.objects.create(
        order=order,
        payment_type=PaymentType.CREDIT_CARD,
        total=Decimal("12.96"),
    )

    assert payment.total == Decimal("12.96")
    assert "Payment #" in str(payment)


@pytest.mark.django_db
def test_payment_rejects_cancelled_order(customer_profile, variant):
    order = Order.objects.create(
        customer=customer_profile,
        subtotal=Decimal("12.00"),
        tax_amount=Decimal("0.96"),
    )

    OrderItem.objects.create(
        order=order,
        variant=variant,
        quantity=1,
        unit_price_charged=Decimal("12.00"),
    )

    order.status = OrderStatus.CANCELLED
    order.save()

    with pytest.raises(ValidationError) as exc:
        Payment.objects.create(
            order=order,
            payment_type=PaymentType.CREDIT_CARD,
            total=Decimal("12.96"),
        )

    assert "Cannot create payments for cancelled orders." in str(exc.value)