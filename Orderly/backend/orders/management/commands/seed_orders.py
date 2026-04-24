"""
Management command to seed test order data.

Generates 500-700 orders per month from August 2025 through today.
Pumpkin Spice Latte is only included in August-November orders.
Totals are calculated by the service layer (7.25% Wake County tax).

Usage:
    python manage.py seed_orders
    python manage.py seed_orders --clear   # delete all seeded orders first
"""

import calendar
import random
from datetime import datetime
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from accounts.models import CustomerProfile
from catalog.models import ModifierOption, ProductVariant
from orders.models import Order, OrderItem, OrderItemModifier, OrderStatus
from orders.services import recalculate_order_totals

PSL_MONTHS = {8, 9, 10, 11}

# seasonal=True templates are excluded outside Aug-Nov
ORDER_TEMPLATES = [
    {
        "seasonal": False,
        "items": [
            {"product": "Latte", "variant": "Medium", "modifiers": [("Milk Type", "Oat Milk"), ("Flavor Syrup", "Vanilla")]},
            {"product": "Blueberry Muffin", "variant": "Standard"},
        ],
    },
    {
        "seasonal": False,
        "items": [
            {"product": "Latte", "variant": "Large", "modifiers": [("Milk Type", "Whole Milk")]},
            {"product": "Chocolate Croissant", "variant": "Standard"},
        ],
    },
    {
        "seasonal": False,
        "items": [
            {"product": "Latte", "variant": "Small", "modifiers": [("Flavor Syrup", "Caramel")]},
        ],
    },
    {
        "seasonal": False,
        "items": [
            {"product": "House Coffee", "variant": "Large"},
            {"product": "Chocolate Croissant", "variant": "Standard"},
        ],
    },
    {
        "seasonal": False,
        "items": [
            {"product": "House Coffee", "variant": "Medium"},
            {"product": "Blueberry Muffin", "variant": "Standard"},
        ],
    },
    {
        "seasonal": False,
        "items": [
            {"product": "House Coffee", "variant": "Small"},
            {"product": "Cake Pop", "variant": "Birthday Cake"},
        ],
    },
    {
        "seasonal": False,
        "items": [
            {
                "product": "Breakfast Sandwich",
                "variant": "Standard",
                "modifiers": [("Bread Choice", "Bagel"), ("Protein Add-On", "Bacon")],
            },
            {"product": "Cold Brew", "variant": "Large", "modifiers": [("Cold Brew Add-Ons", "Sweet Cream")]},
        ],
    },
    {
        "seasonal": False,
        "items": [
            {
                "product": "Breakfast Sandwich",
                "variant": "Standard",
                "modifiers": [("Bread Choice", "Croissant")],
            },
            {"product": "House Coffee", "variant": "Medium"},
        ],
    },
    {
        "seasonal": False,
        "items": [
            {"product": "Cold Brew", "variant": "Large", "modifiers": [("Cold Brew Add-Ons", "Sweet Cream")]},
        ],
    },
    {
        "seasonal": False,
        "items": [
            {"product": "Cold Brew", "variant": "Small"},
            {"product": "Blueberry Muffin", "variant": "Standard"},
        ],
    },
    {
        "seasonal": False,
        "items": [
            {"product": "Chai Tea Latte", "variant": "Medium", "modifiers": [("Milk Type", "Almond Milk")]},
            {"product": "Green Tea", "variant": "Small"},
        ],
    },
    {
        "seasonal": False,
        "items": [
            {"product": "Chai Tea Latte", "variant": "Large"},
            {"product": "Cake Pop", "variant": "Birthday Cake"},
        ],
    },
    {
        "seasonal": False,
        "items": [
            {"product": "Green Tea", "variant": "Medium"},
            {"product": "Blueberry Muffin", "variant": "Standard"},
        ],
    },
    {
        "seasonal": True,
        "items": [
            {
                "product": "Pumpkin Spice Latte",
                "variant": "Small",
                "modifiers": [("Seasonal Toppings", "Whipped Cream"), ("Seasonal Toppings", "Pumpkin Drizzle")],
            },
            {"product": "Cake Pop", "variant": "Birthday Cake"},
        ],
    },
    {
        "seasonal": True,
        "items": [
            {
                "product": "Pumpkin Spice Latte",
                "variant": "Medium",
                "modifiers": [("Seasonal Toppings", "Whipped Cream")],
            },
        ],
    },
    {
        "seasonal": True,
        "items": [
            {"product": "Pumpkin Spice Latte", "variant": "Large"},
            {"product": "Chocolate Croissant", "variant": "Standard"},
        ],
    },
]


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



def _add_item(order, product_name, variant_name, modifiers=None):
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


class Command(BaseCommand):
    help = "Seed 500-700 orders per month from August 2025 through today"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing orders before re-seeding",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted, _ = Order.objects.all().delete()
            self.stdout.write(f"Cleared {deleted} existing order(s).")

        profiles = list(CustomerProfile.objects.select_related("user").all())
        if not profiles:
            raise CommandError("No customer profiles found. Run seed_data and seed_customers first.")

        today = timezone.now().date()
        current = datetime(2025, 8, 1)
        total_created = 0

        while (current.year, current.month) <= (today.year, today.month):
            year, month = current.year, current.month
            is_current_month = (year == today.year and month == today.month)
            last_day = today.day if is_current_month else calendar.monthrange(year, month)[1]

            available_templates = [
                t for t in ORDER_TEMPLATES
                if not t["seasonal"] or month in PSL_MONTHS
            ]

            count = random.randint(500, 700)

            for _ in range(count):
                profile = random.choice(profiles)
                template = random.choice(available_templates)

                day = random.randint(1, last_day)
                hour = random.randint(7, 19)
                minute = random.randint(0, 59)
                ts = timezone.make_aware(datetime(year, month, day, hour, minute))

                if is_current_month:
                    status = OrderStatus.PENDING if random.random() < 0.2 else OrderStatus.COMPLETED
                else:
                    status = OrderStatus.COMPLETED

                order = Order.objects.create(
                    customer=profile,
                    status=status,
                    subtotal=Decimal("0.00"),
                    tax_amount=Decimal("0.00"),
                )

                for item_spec in template["items"]:
                    _add_item(
                        order,
                        item_spec["product"],
                        item_spec["variant"],
                        item_spec.get("modifiers", []),
                    )

                recalculate_order_totals(order)
                # Backdate — auto_now_add cannot be set on creation
                Order.objects.filter(id=order.id).update(created_at=ts, order_date=ts)

                total_created += 1

            self.stdout.write(f"  {year}-{month:02d}: {count} orders")

            if month == 12:
                current = datetime(year + 1, 1, 1)
            else:
                current = datetime(year, month + 1, 1)

        self.stdout.write(self.style.SUCCESS(f"\nDone. {total_created} order(s) seeded."))
