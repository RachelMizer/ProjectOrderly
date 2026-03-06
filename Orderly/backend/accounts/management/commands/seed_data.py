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
from catalog.models import Category, Product, ProductVariant, ModifierGroup, ModifierOption


def make_unique_sku(base: str) -> str:
    """
    Create a non-empty unique SKU for ProductVariant.sku.
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
    Create/update a ProductVariant for (product, name).
    Ensures SKU + price exist.
    """
    sku_base = f"{product.name}-{name}"
    sku = make_unique_sku(sku_base)

    obj = ProductVariant.objects.filter(product=product, name=name).first()

    if obj is None:
        obj = ProductVariant.objects.create(
            product=product,
            name=name,
            sku=sku,
            unit_price=unit_price,
        )
        return obj

    dirty = False

    if not obj.sku:
        obj.sku = sku
        dirty = True

    if obj.unit_price is None:
        obj.unit_price = unit_price
        dirty = True

    if obj.unit_price != unit_price:
        obj.unit_price = unit_price
        dirty = True

    if dirty:
        obj.save()

    return obj


class Command(BaseCommand):
    help = "Seeds local dev database with deterministic sample data."

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

        # --- Business Users ---

        for i in range(1, 3):

            u = make_user(
                f"business{i}",
                f"business{i}@example.com",
            )

            UserRole.objects.update_or_create(
                user=u,
                defaults={"role": UserRoleChoices.BUSINESS},
            )

        # --- Customer Users ---

        for i in range(1, 6):

            u = make_user(
                f"customer{i}",
                f"customer{i}@example.com",
            )

            UserRole.objects.update_or_create(
                user=u,
                defaults={"role": UserRoleChoices.CUSTOMER},
            )

            CustomerProfile.objects.update_or_create(
                user=u,
                defaults={
                    "street_address": f"{100+i} Main St",
                    "city": "Apex",
                    "state": "NC",
                    "zipcode": f"2750{i}",
                    "phone": f"91955501{str(i).zfill(2)}",
                },
            )

        self.stdout.write(self.style.SUCCESS("Users seeded: 2 business, 5 customers"))

        # ------------------------------------------------------------
        # 3) Suppliers
        # ------------------------------------------------------------

        supplier_rows = [
            {"name": "Fresh Farms Co", "email": "contact@freshfarms.example", "phone": "9195551200"},
            {"name": "Triangle Produce", "email": "sales@triangleproduce.example", "phone": "9195551300"},
            {"name": "Carolina Wholesale", "email": "orders@carolinawholesale.example", "phone": "9195551400"},
            {"name": "Good Grain Supply", "email": "hello@goodgrain.example", "phone": "9195551500"},
        ]

        suppliers = []

        for s in supplier_rows:
            obj, _ = Supplier.objects.get_or_create(
                name=s["name"],
                defaults=s,
            )

            suppliers.append(obj)

        self.stdout.write(self.style.SUCCESS("Suppliers seeded: 4"))

        # ------------------------------------------------------------
        # 4) Inventory
        # ------------------------------------------------------------

        inventory_rows = [
            {"name": "Coffee Beans", "stock_quantity": Decimal("25.00"), "unit_of_measure": UnitOfMeasure.LB, "reorder_level": Decimal("10.00")},
            {"name": "Milk", "stock_quantity": Decimal("30.00"), "unit_of_measure": UnitOfMeasure.L, "reorder_level": Decimal("12.00")},
            {"name": "Sugar", "stock_quantity": Decimal("18.00"), "unit_of_measure": UnitOfMeasure.LB, "reorder_level": Decimal("8.00")},
            {"name": "Flour", "stock_quantity": Decimal("40.00"), "unit_of_measure": UnitOfMeasure.LB, "reorder_level": Decimal("15.00")},
            {"name": "Cups (12oz)", "stock_quantity": Decimal("300.00"), "unit_of_measure": UnitOfMeasure.UNITS, "reorder_level": Decimal("120.00")},
            {"name": "Lids (12oz)", "stock_quantity": Decimal("280.00"), "unit_of_measure": UnitOfMeasure.UNITS, "reorder_level": Decimal("120.00")},
        ]

        for it in inventory_rows:

            obj, _ = InventoryItem.objects.get_or_create(
                name=it["name"],
                defaults=it,
            )

            changed = False

            for k, v in it.items():
                if getattr(obj, k) != v:
                    setattr(obj, k, v)
                    changed = True

            if changed:
                obj.save()

        self.stdout.write(self.style.SUCCESS("Inventory seeded: 6"))

        # ------------------------------------------------------------
        # 5) Catalog
        # ------------------------------------------------------------

        cat_names = ["Coffee", "Tea", "Bakery"]

        categories = {}

        for name in cat_names:

            c, _ = Category.objects.get_or_create(name=name)

            categories[name] = c

        products_spec = [
            ("House Coffee", "Coffee", suppliers[0]),
            ("Latte", "Coffee", suppliers[0]),
            ("Green Tea", "Tea", suppliers[1]),
            ("Blueberry Muffin", "Bakery", suppliers[3]),
        ]

        products = {}

        for pname, cname, supp in products_spec:

            defaults = {
                "category": categories[cname],
                "supplier": supp,
                "has_variants": True,
                "has_modifiers": (pname == "Latte"),
            }

            p, created = Product.objects.get_or_create(
                category=categories[cname],
                name=pname,
                defaults=defaults,
            )

            changed = False

            if p.supplier != supp:
                p.supplier = supp
                changed = True

            if p.has_modifiers != (pname == "Latte"):
                p.has_modifiers = (pname == "Latte")
                changed = True

            if changed:
                p.save()

            products[pname] = p

        variants_spec = [
            ("House Coffee", [("Small", Decimal("2.50")), ("Large", Decimal("3.25"))]),
            ("Latte", [("Small", Decimal("4.50")), ("Large", Decimal("5.25"))]),
            ("Green Tea", [("Small", Decimal("2.75")), ("Large", Decimal("3.50"))]),
            ("Blueberry Muffin", [("Standard", Decimal("2.95"))]),
        ]

        latte_small = None

        for prod_name, vlist in variants_spec:

            prod = products[prod_name]

            for vname, price in vlist:

                v = ensure_variant(prod, vname, price)

                if prod_name == "Latte" and vname == "Small":
                    latte_small = v

        if latte_small is not None:

            mg, _ = ModifierGroup.objects.get_or_create(
                variant=latte_small,
                name="Milk Type",
                defaults={
                    "required": False,
                    "min_selections": 0,
                    "max_selections": 1,
                },
            )

            opt_rows = [
                ("Whole Milk", Decimal("0.00")),
                ("Oat Milk", Decimal("0.75")),
                ("Almond Milk", Decimal("0.75")),
            ]

            for oname, adj in opt_rows:

                o, created = ModifierOption.objects.get_or_create(
                    group=mg,
                    name=oname,
                    defaults={"price_adjustment": adj},
                )

                if not created and o.price_adjustment != adj:
                    o.price_adjustment = adj
                    o.save(update_fields=["price_adjustment"])

        self.stdout.write(self.style.SUCCESS("Catalog seeded (categories, products, variants, modifiers)."))
        self.stdout.write(self.style.SUCCESS("✅ Seed complete."))