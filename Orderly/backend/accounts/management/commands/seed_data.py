from __future__ import annotations

from decimal import Decimal
import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from accounts.models import UserRole, CustomerProfile, UserRoleChoices
from suppliers.models import Supplier
from inventory.models import InventoryItem, UnitOfMeasure
from catalog.models import (
    Category,
    Product,
    ProductVariant,
    ModifierGroup,
    ModifierOption,
)


def make_unique_sku(base: str) -> str:
    """
    Create a unique SKU for ProductVariant.sku.
    """
    base = (base or "sku").strip()
    base = slugify(base).replace("-", "").upper()[:40] or "SKU"

    candidate = base
    i = 2
    while ProductVariant.objects.filter(sku=candidate).exists():
        suffix = f"{i}"
        candidate = f"{base[: (64 - (len(suffix) + 1))]}-{suffix}"
        i += 1
    return candidate


def ensure_variant(product: Product, name: str, unit_price: Decimal) -> ProductVariant:
    """
    Create or update a ProductVariant deterministically.
    Repairs bad existing rows if needed.
    """
    sku_base = f"{product.name}-{name}"
    sku = make_unique_sku(sku_base)

    obj = ProductVariant.objects.filter(product=product, name=name).first()

    if obj is None:
        return ProductVariant.objects.create(
            product=product,
            name=name,
            sku=sku,
            unit_price=unit_price,
        )

    dirty = False

    if not obj.sku:
        obj.sku = sku
        dirty = True

    if obj.unit_price is None or obj.unit_price != unit_price:
        obj.unit_price = unit_price
        dirty = True

    if dirty:
        obj.save()

    return obj


def ensure_modifier_group(
    variant: ProductVariant,
    name: str,
    required: bool = False,
    min_selections: int = 0,
    max_selections: int = 1,
) -> ModifierGroup:
    """
    Create or update a modifier group deterministically.
    """
    group, _ = ModifierGroup.objects.get_or_create(
        variant=variant,
        name=name,
        defaults={
            "required": required,
            "min_selections": min_selections,
            "max_selections": max_selections,
        },
    )

    dirty = False
    if group.required != required:
        group.required = required
        dirty = True
    if group.min_selections != min_selections:
        group.min_selections = min_selections
        dirty = True
    if group.max_selections != max_selections:
        group.max_selections = max_selections
        dirty = True

    if dirty:
        group.save()

    return group


def ensure_modifier_option(
    group: ModifierGroup,
    name: str,
    price_adjustment: Decimal,
) -> ModifierOption:
    """
    Create or update a modifier option deterministically.
    """
    option, created = ModifierOption.objects.get_or_create(
        group=group,
        name=name,
        defaults={"price_adjustment": price_adjustment},
    )

    if not created and option.price_adjustment != price_adjustment:
        option.price_adjustment = price_adjustment
        option.save(update_fields=["price_adjustment"])

    return option


class Command(BaseCommand):
    help = "Seeds local dev database with deterministic sample data for Orderly."

    def add_arguments(self, parser):
        parser.add_argument("--seed", type=int, default=42)

    @transaction.atomic
    def handle(self, *args, **options):
        seed = int(options["seed"])
        rng = random.Random(seed)

        self.stdout.write(self.style.SUCCESS(f"Seeding database (seed={seed})..."))

        User = get_user_model()

        # ------------------------------------------------------------
        # 1) Superuser
        # ------------------------------------------------------------
        admin_username = "admin"
        admin_email = "admin@example.com"
        admin_password = "AdminPass123!"

        if not User.objects.filter(username=admin_username).exists():
            User.objects.create_superuser(
                username=admin_username,
                email=admin_email,
                password=admin_password,
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created superuser: {admin_username} / {admin_password}"
                )
            )
        else:
            self.stdout.write("Superuser already exists: admin")

        # ------------------------------------------------------------
        # 2) Users + roles + customer profiles
        # ------------------------------------------------------------
        def make_user(username: str, email: str, password: str = "Password123!"):
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email},
            )
            if created:
                user.set_password(password)
                user.save(update_fields=["password"])
            return user

        # Business users
        for i in range(1, 4):
            u = make_user(f"business{i}", f"business{i}@example.com")
            UserRole.objects.get_or_create(
                user=u,
                defaults={"role": UserRoleChoices.BUSINESS},
            )

        # Customer users
        customer_cities = ["Apex", "Raleigh", "Cary", "Durham", "Morrisville"]
        for i in range(1, 7):
            u = make_user(f"customer{i}", f"customer{i}@example.com")
            UserRole.objects.get_or_create(
                user=u,
                defaults={"role": UserRoleChoices.CUSTOMER},
            )
            CustomerProfile.objects.update_or_create(
                user=u,
                defaults={
                    "email_verified": bool(i % 2),
                    "street_address": f"{100 + i} Main St",
                    "city": customer_cities[(i - 1) % len(customer_cities)],
                    "state": "NC",
                    "zipcode": f"2750{i}",
                    "phone": f"91955501{str(i).zfill(2)}",
                },
            )

        self.stdout.write(
            self.style.SUCCESS("Users seeded: 3 business, 6 customers")
        )

        # ------------------------------------------------------------
        # 3) Suppliers
        # ------------------------------------------------------------
        supplier_rows = [
            {
                "name": "Fresh Farms Co",
                "email": "contact@freshfarms.example",
                "phone": "9195551200",
            },
            {
                "name": "Triangle Produce",
                "email": "sales@triangleproduce.example",
                "phone": "9195551300",
            },
            {
                "name": "Carolina Wholesale",
                "email": "orders@carolinawholesale.example",
                "phone": "9195551400",
            },
            {
                "name": "Good Grain Supply",
                "email": "hello@goodgrain.example",
                "phone": "9195551500",
            },
            {
                "name": "Brew Source NC",
                "email": "support@brewsource.example",
                "phone": "9195551600",
            },
        ]

        suppliers = []
        for s in supplier_rows:
            obj, _ = Supplier.objects.get_or_create(name=s["name"], defaults=s)
            suppliers.append(obj)

        self.stdout.write(self.style.SUCCESS(f"Suppliers seeded: {len(suppliers)}"))

        # ------------------------------------------------------------
        # 4) Inventory
        # ------------------------------------------------------------
        inventory_rows = [
            {
                "name": "Coffee Beans",
                "stock_quantity": Decimal("25.00"),
                "unit_of_measure": UnitOfMeasure.LB,
                "reorder_level": Decimal("10.00"),
            },
            {
                "name": "Espresso Beans",
                "stock_quantity": Decimal("20.00"),
                "unit_of_measure": UnitOfMeasure.LB,
                "reorder_level": Decimal("8.00"),
            },
            {
                "name": "Green Tea Leaves",
                "stock_quantity": Decimal("12.00"),
                "unit_of_measure": UnitOfMeasure.LB,
                "reorder_level": Decimal("5.00"),
            },
            {
                "name": "Black Tea Leaves",
                "stock_quantity": Decimal("12.00"),
                "unit_of_measure": UnitOfMeasure.LB,
                "reorder_level": Decimal("5.00"),
            },
            {
                "name": "Milk",
                "stock_quantity": Decimal("30.00"),
                "unit_of_measure": UnitOfMeasure.L,
                "reorder_level": Decimal("12.00"),
            },
            {
                "name": "Oat Milk",
                "stock_quantity": Decimal("16.00"),
                "unit_of_measure": UnitOfMeasure.L,
                "reorder_level": Decimal("6.00"),
            },
            {
                "name": "Almond Milk",
                "stock_quantity": Decimal("16.00"),
                "unit_of_measure": UnitOfMeasure.L,
                "reorder_level": Decimal("6.00"),
            },
            {
                "name": "Sugar",
                "stock_quantity": Decimal("18.00"),
                "unit_of_measure": UnitOfMeasure.LB,
                "reorder_level": Decimal("8.00"),
            },
            {
                "name": "Vanilla Syrup",
                "stock_quantity": Decimal("10.00"),
                "unit_of_measure": UnitOfMeasure.L,
                "reorder_level": Decimal("4.00"),
            },
            {
                "name": "Caramel Syrup",
                "stock_quantity": Decimal("10.00"),
                "unit_of_measure": UnitOfMeasure.L,
                "reorder_level": Decimal("4.00"),
            },
            {
                "name": "Mocha Syrup",
                "stock_quantity": Decimal("10.00"),
                "unit_of_measure": UnitOfMeasure.L,
                "reorder_level": Decimal("4.00"),
            },
            {
                "name": "Flour",
                "stock_quantity": Decimal("40.00"),
                "unit_of_measure": UnitOfMeasure.LB,
                "reorder_level": Decimal("15.00"),
            },
            {
                "name": "Blueberries",
                "stock_quantity": Decimal("14.00"),
                "unit_of_measure": UnitOfMeasure.LB,
                "reorder_level": Decimal("5.00"),
            },
            {
                "name": "Chocolate Chips",
                "stock_quantity": Decimal("10.00"),
                "unit_of_measure": UnitOfMeasure.LB,
                "reorder_level": Decimal("4.00"),
            },
            {
                "name": "Whipped Cream",
                "stock_quantity": Decimal("20.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("8.00"),
            },
            {
                "name": "Cups (12oz)",
                "stock_quantity": Decimal("300.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("120.00"),
            },
            {
                "name": "Cups (16oz)",
                "stock_quantity": Decimal("260.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("100.00"),
            },
            {
                "name": "Lids (12oz)",
                "stock_quantity": Decimal("280.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("120.00"),
            },
            {
                "name": "Lids (16oz)",
                "stock_quantity": Decimal("240.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("100.00"),
            },
        ]

        for item in inventory_rows:
            obj, _ = InventoryItem.objects.get_or_create(
                name=item["name"],
                defaults=item,
            )

            changed = False
            for k, v in item.items():
                if getattr(obj, k) != v:
                    setattr(obj, k, v)
                    changed = True

            if changed:
                obj.save()

        self.stdout.write(
            self.style.SUCCESS(f"Inventory seeded: {len(inventory_rows)}")
        )

        # ------------------------------------------------------------
        # 5) Catalog categories
        # ------------------------------------------------------------
        category_names = ["Coffee", "Tea", "Bakery", "Breakfast", "Seasonal"]

        categories = {}
        for name in category_names:
            c, _ = Category.objects.get_or_create(name=name)
            categories[name] = c

        self.stdout.write(
            self.style.SUCCESS(f"Categories seeded: {len(category_names)}")
        )

        # ------------------------------------------------------------
        # 6) Products
        # ------------------------------------------------------------
        products_spec = [
            ("House Coffee", "Coffee", suppliers[0], True, False),
            ("Latte", "Coffee", suppliers[4], True, True),
            ("Cappuccino", "Coffee", suppliers[4], True, True),
            ("Mocha", "Coffee", suppliers[4], True, True),
            ("Cold Brew", "Coffee", suppliers[0], True, True),
            ("Green Tea", "Tea", suppliers[1], True, False),
            ("Chai Tea Latte", "Tea", suppliers[1], True, True),
            ("Blueberry Muffin", "Bakery", suppliers[3], True, False),
            ("Chocolate Croissant", "Bakery", suppliers[3], True, False),
            ("Breakfast Sandwich", "Breakfast", suppliers[2], True, True),
            ("Pumpkin Spice Latte", "Seasonal", suppliers[4], True, True),
        ]

        products = {}

        for pname, cname, supp, has_variants, has_modifiers in products_spec:
            defaults = {
                "category": categories[cname],
                "supplier": supp,
                "has_variants": has_variants,
                "has_modifiers": has_modifiers,
            }

            product, _ = Product.objects.get_or_create(
                category=categories[cname],
                name=pname,
                defaults=defaults,
            )

            changed = False
            if product.supplier != supp:
                product.supplier = supp
                changed = True
            if product.has_variants != has_variants:
                product.has_variants = has_variants
                changed = True
            if product.has_modifiers != has_modifiers:
                product.has_modifiers = has_modifiers
                changed = True

            if changed:
                product.save()

            products[pname] = product

        self.stdout.write(
            self.style.SUCCESS(f"Products seeded: {len(products_spec)}")
        )

        # ------------------------------------------------------------
        # 7) Variants
        # ------------------------------------------------------------
        variants_spec = {
            "House Coffee": [
                ("Small", Decimal("2.50")),
                ("Medium", Decimal("2.95")),
                ("Large", Decimal("3.25")),
            ],
            "Latte": [
                ("Small", Decimal("4.50")),
                ("Medium", Decimal("5.00")),
                ("Large", Decimal("5.50")),
            ],
            "Cappuccino": [
                ("Small", Decimal("4.25")),
                ("Medium", Decimal("4.75")),
                ("Large", Decimal("5.25")),
            ],
            "Mocha": [
                ("Small", Decimal("4.75")),
                ("Medium", Decimal("5.25")),
                ("Large", Decimal("5.75")),
            ],
            "Cold Brew": [
                ("Small", Decimal("3.75")),
                ("Large", Decimal("4.50")),
            ],
            "Green Tea": [
                ("Small", Decimal("2.75")),
                ("Medium", Decimal("3.10")),
                ("Large", Decimal("3.50")),
            ],
            "Chai Tea Latte": [
                ("Small", Decimal("4.25")),
                ("Medium", Decimal("4.75")),
                ("Large", Decimal("5.25")),
            ],
            "Blueberry Muffin": [
                ("Standard", Decimal("2.95")),
            ],
            "Chocolate Croissant": [
                ("Standard", Decimal("3.45")),
            ],
            "Breakfast Sandwich": [
                ("Standard", Decimal("5.95")),
            ],
            "Pumpkin Spice Latte": [
                ("Small", Decimal("5.00")),
                ("Medium", Decimal("5.50")),
                ("Large", Decimal("6.00")),
            ],
        }

        variants_by_product = {}

        for product_name, variant_rows in variants_spec.items():
            product = products[product_name]
            variants_by_product[product_name] = {}

            for variant_name, price in variant_rows:
                variant = ensure_variant(product, variant_name, price)
                variants_by_product[product_name][variant_name] = variant

        total_variants = sum(len(v) for v in variants_spec.values())
        self.stdout.write(
            self.style.SUCCESS(f"Variants seeded: {total_variants}")
        )

        # ------------------------------------------------------------
        # 8) Modifiers
        # ------------------------------------------------------------

        # Latte modifiers
        for size_name in ["Small", "Medium", "Large"]:
            latte_variant = variants_by_product["Latte"][size_name]

            milk_group = ensure_modifier_group(
                variant=latte_variant,
                name="Milk Type",
                required=False,
                min_selections=0,
                max_selections=1,
            )
            ensure_modifier_option(milk_group, "Whole Milk", Decimal("0.00"))
            ensure_modifier_option(milk_group, "Oat Milk", Decimal("0.75"))
            ensure_modifier_option(milk_group, "Almond Milk", Decimal("0.75"))

            syrup_group = ensure_modifier_group(
                variant=latte_variant,
                name="Flavor Syrup",
                required=False,
                min_selections=0,
                max_selections=2,
            )
            ensure_modifier_option(syrup_group, "Vanilla", Decimal("0.50"))
            ensure_modifier_option(syrup_group, "Caramel", Decimal("0.50"))
            ensure_modifier_option(syrup_group, "Mocha", Decimal("0.50"))

            extras_group = ensure_modifier_group(
                variant=latte_variant,
                name="Extras",
                required=False,
                min_selections=0,
                max_selections=3,
            )
            ensure_modifier_option(extras_group, "Extra Shot", Decimal("1.00"))
            ensure_modifier_option(extras_group, "Whipped Cream", Decimal("0.50"))
            ensure_modifier_option(extras_group, "Extra Foam", Decimal("0.25"))

        # Cappuccino modifiers
        for size_name in ["Small", "Medium", "Large"]:
            capp_variant = variants_by_product["Cappuccino"][size_name]

            milk_group = ensure_modifier_group(
                variant=capp_variant,
                name="Milk Type",
                required=False,
                min_selections=0,
                max_selections=1,
            )
            ensure_modifier_option(milk_group, "Whole Milk", Decimal("0.00"))
            ensure_modifier_option(milk_group, "Oat Milk", Decimal("0.75"))
            ensure_modifier_option(milk_group, "Almond Milk", Decimal("0.75"))

            extras_group = ensure_modifier_group(
                variant=capp_variant,
                name="Extras",
                required=False,
                min_selections=0,
                max_selections=2,
            )
            ensure_modifier_option(extras_group, "Extra Shot", Decimal("1.00"))
            ensure_modifier_option(extras_group, "Cinnamon", Decimal("0.25"))

        # Mocha modifiers
        for size_name in ["Small", "Medium", "Large"]:
            mocha_variant = variants_by_product["Mocha"][size_name]

            milk_group = ensure_modifier_group(
                variant=mocha_variant,
                name="Milk Type",
                required=False,
                min_selections=0,
                max_selections=1,
            )
            ensure_modifier_option(milk_group, "Whole Milk", Decimal("0.00"))
            ensure_modifier_option(milk_group, "Oat Milk", Decimal("0.75"))
            ensure_modifier_option(milk_group, "Almond Milk", Decimal("0.75"))

            toppings_group = ensure_modifier_group(
                variant=mocha_variant,
                name="Toppings",
                required=False,
                min_selections=0,
                max_selections=2,
            )
            ensure_modifier_option(toppings_group, "Whipped Cream", Decimal("0.50"))
            ensure_modifier_option(toppings_group, "Chocolate Drizzle", Decimal("0.50"))

        # Cold Brew modifiers
        for size_name in ["Small", "Large"]:
            cold_brew_variant = variants_by_product["Cold Brew"][size_name]

            brew_group = ensure_modifier_group(
                variant=cold_brew_variant,
                name="Cold Brew Add-Ons",
                required=False,
                min_selections=0,
                max_selections=2,
            )
            ensure_modifier_option(brew_group, "Vanilla Syrup", Decimal("0.50"))
            ensure_modifier_option(brew_group, "Caramel Syrup", Decimal("0.50"))
            ensure_modifier_option(brew_group, "Sweet Cream", Decimal("0.75"))

        # Chai Tea Latte modifiers
        for size_name in ["Small", "Medium", "Large"]:
            chai_variant = variants_by_product["Chai Tea Latte"][size_name]

            milk_group = ensure_modifier_group(
                variant=chai_variant,
                name="Milk Type",
                required=False,
                min_selections=0,
                max_selections=1,
            )
            ensure_modifier_option(milk_group, "Whole Milk", Decimal("0.00"))
            ensure_modifier_option(milk_group, "Oat Milk", Decimal("0.75"))
            ensure_modifier_option(milk_group, "Almond Milk", Decimal("0.75"))

            extras_group = ensure_modifier_group(
                variant=chai_variant,
                name="Extras",
                required=False,
                min_selections=0,
                max_selections=2,
            )
            ensure_modifier_option(extras_group, "Vanilla", Decimal("0.50"))
            ensure_modifier_option(extras_group, "Extra Chai", Decimal("0.75"))

        # Breakfast Sandwich modifiers
        breakfast_variant = variants_by_product["Breakfast Sandwich"]["Standard"]

        bread_group = ensure_modifier_group(
            variant=breakfast_variant,
            name="Bread Choice",
            required=True,
            min_selections=1,
            max_selections=1,
        )
        ensure_modifier_option(bread_group, "Croissant", Decimal("0.00"))
        ensure_modifier_option(bread_group, "Bagel", Decimal("0.50"))
        ensure_modifier_option(bread_group, "English Muffin", Decimal("0.00"))

        protein_group = ensure_modifier_group(
            variant=breakfast_variant,
            name="Protein Add-On",
            required=False,
            min_selections=0,
            max_selections=2,
        )
        ensure_modifier_option(protein_group, "Bacon", Decimal("1.00"))
        ensure_modifier_option(protein_group, "Sausage", Decimal("1.00"))
        ensure_modifier_option(protein_group, "Avocado", Decimal("1.25"))

        # Pumpkin Spice Latte modifiers
        for size_name in ["Small", "Medium", "Large"]:
            psl_variant = variants_by_product["Pumpkin Spice Latte"][size_name]

            milk_group = ensure_modifier_group(
                variant=psl_variant,
                name="Milk Type",
                required=False,
                min_selections=0,
                max_selections=1,
            )
            ensure_modifier_option(milk_group, "Whole Milk", Decimal("0.00"))
            ensure_modifier_option(milk_group, "Oat Milk", Decimal("0.75"))
            ensure_modifier_option(milk_group, "Almond Milk", Decimal("0.75"))

            toppings_group = ensure_modifier_group(
                variant=psl_variant,
                name="Seasonal Toppings",
                required=False,
                min_selections=0,
                max_selections=2,
            )
            ensure_modifier_option(toppings_group, "Whipped Cream", Decimal("0.50"))
            ensure_modifier_option(toppings_group, "Pumpkin Drizzle", Decimal("0.50"))
            ensure_modifier_option(toppings_group, "Cinnamon Dusting", Decimal("0.25"))

        total_groups = ModifierGroup.objects.count()
        total_options = ModifierOption.objects.count()

        self.stdout.write(
            self.style.SUCCESS(
                f"Modifiers seeded: {total_groups} groups, {total_options} options"
            )
        )

        # ------------------------------------------------------------
        # 9) Final summary
        # ------------------------------------------------------------
        self.stdout.write(self.style.SUCCESS("Seed data loaded successfully."))
        self.stdout.write(self.style.SUCCESS("✅ Seed complete for Sprint 3 testing."))