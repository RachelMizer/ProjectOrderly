"""
Management command to seed test order data.

Creates 5 orders mapped from mock_orders.csv, using real CustomerProfile records,
ProductVariant lookups, and OrderItemModifier records. Totals are calculated by
the service layer so tax always reflects the correct 7.25% Wake County rate.

Usage:
    python manage.py seed_orders
    python manage.py seed_orders --clear   # delete existing seeded orders first
"""

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from accounts.models import CustomerProfile
from catalog.models import ModifierOption, ProductVariant
from orders.models import Order, OrderItem, OrderItemModifier, OrderStatus
from orders.services import recalculate_order_totals

User = get_user_model()


def _variant(product_name, variant_name):
    try:
        return ProductVariant.objects.get(product__name=product_name, name=variant_name)
    except ProductVariant.DoesNotExist:
        raise CommandError(f"Variant not found: {product_name} — {variant_name}")


def _modifier(product_name, variant_name, group_name, option_name):
    try:
        return ModifierOption.objects.get(
            group__variant__product__name=product_name,
            group__variant__name=variant_name,
            group__name=group_name,
            name=option_name,
        )
    except ModifierOption.DoesNotExist:
        raise CommandError(
            f"ModifierOption not found: {product_name} {variant_name} / "
            f"{group_name} / {option_name}"
        )


def _profile(username):
    try:
        user = User.objects.get(username=username)
        return CustomerProfile.objects.get(user=user)
    except (User.DoesNotExist, CustomerProfile.DoesNotExist):
        raise CommandError(f"CustomerProfile not found for username: {username}")


def _add_item(order, product_name, variant_name, modifiers=None):
    """
    Create an OrderItem and attach any modifiers.
    modifiers: list of (group_name, option_name) tuples
    """
    variant = _variant(product_name, variant_name)
    item = OrderItem.objects.create(
        order=order,
        variant=variant,
        quantity=1,
        unit_price_charged=variant.unit_price,
    )
    for group_name, option_name in (modifiers or []):
        option = _modifier(product_name, variant_name, group_name, option_name)
        OrderItemModifier.objects.create(
            order_item=item,
            modifier_option=option,
            quantity=1,
            price_adjustment_charged=option.price_adjustment,
        )
    return item


# Seed data: mirrors mock_orders.csv with corrected tax (7.25%) and proper structure
ORDERS = [
    {
        "customer": "customer1",
        "status": OrderStatus.COMPLETED,
        "items": [
            {
                "product": "Latte",
                "variant": "Medium",
                "modifiers": [
                    ("Milk Type", "Oat Milk"),
                    ("Flavor Syrup", "Vanilla"),
                ],
            },
            {"product": "Blueberry Muffin", "variant": "Standard"},
        ],
    },
    {
        "customer": "customer2",
        "status": OrderStatus.COMPLETED,
        "items": [
            {"product": "House Coffee", "variant": "Large"},
            {"product": "Chocolate Croissant", "variant": "Standard"},
        ],
    },
    {
        "customer": "customer3",
        "status": OrderStatus.PAID,
        "items": [
            {
                "product": "Breakfast Sandwich",
                "variant": "Standard",
                "modifiers": [
                    ("Bread Choice", "Bagel"),
                    ("Protein Add-On", "Bacon"),
                ],
            },
            {
                "product": "Cold Brew",
                "variant": "Large",
                "modifiers": [("Cold Brew Add-Ons", "Sweet Cream")],
            },
        ],
    },
    {
        "customer": "customer4",
        "status": OrderStatus.PENDING,
        "items": [
            {
                "product": "Pumpkin Spice Latte",
                "variant": "Small",
                "modifiers": [
                    ("Seasonal Toppings", "Whipped Cream"),
                    ("Seasonal Toppings", "Pumpkin Drizzle"),
                ],
            },
            {"product": "Cake Pop", "variant": "Birthday Cake"},
        ],
    },
    {
        "customer": "customer5",
        "status": OrderStatus.DRAFT,
        "items": [
            {
                "product": "Chai Tea Latte",
                "variant": "Medium",
                "modifiers": [("Milk Type", "Almond Milk")],
            },
            {"product": "Green Tea", "variant": "Small"},
        ],
    },
]


class Command(BaseCommand):
    help = "Seed test order data from mock_orders.csv spec"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing non-draft orders for seeded customers before re-seeding",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            usernames = [o["customer"] for o in ORDERS]
            deleted, _ = Order.objects.filter(
                customer__user__username__in=usernames
            ).delete()
            self.stdout.write(f"Cleared {deleted} existing order(s).")

        created_count = 0

        for spec in ORDERS:
            profile = _profile(spec["customer"])

            # DRAFT orders: reuse existing draft if present (one per customer constraint)
            if spec["status"] == OrderStatus.DRAFT:
                order, _ = Order.objects.get_or_create(
                    customer=profile,
                    status=OrderStatus.DRAFT,
                    defaults={"subtotal": Decimal("0.00"), "tax_amount": Decimal("0.00")},
                )
                # Clear existing items so re-seeding is idempotent
                order.items.all().delete()
            else:
                order = Order.objects.create(
                    customer=profile,
                    status=spec["status"],
                    subtotal=Decimal("0.00"),
                    tax_amount=Decimal("0.00"),
                )

            for item_spec in spec["items"]:
                _add_item(
                    order,
                    item_spec["product"],
                    item_spec["variant"],
                    item_spec.get("modifiers", []),
                )

            recalculate_order_totals(order)
            order.refresh_from_db()

            self.stdout.write(
                f"  Order {order.id} [{spec['status']}] — {spec['customer']} — "
                f"subtotal ${order.subtotal} / tax ${order.tax_amount} / "
                f"total ${order.total_payment_due}"
            )
            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"\nDone. {created_count} order(s) seeded.")
        )
