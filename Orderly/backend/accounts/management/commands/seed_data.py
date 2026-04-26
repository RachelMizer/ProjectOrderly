from __future__ import annotations

from decimal import Decimal
import random
import shutil
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from accounts.models import UserRole, CustomerProfile, UserRoleChoices
from suppliers.models import Supplier
from inventory.models import InventoryItem, UnitOfMeasure, VariantInventoryUsage, ModifierInventoryUsage
from catalog.models import (
    Category,
    Product,
    ProductVariant,
    ModifierGroup,
    ModifierOption,
)
from settings.models import StoreSettings


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

        # Dev account (superuser + business role)
        dev_user, dev_created = User.objects.get_or_create(
            username="ramizer",
            defaults={"email": "ramizer@my.waketech.edu", "is_staff": True, "is_superuser": True},
        )
        if dev_created:
            dev_user.set_password("rmdevpass")
            dev_user.save(update_fields=["password"])
        if not dev_user.first_name:
            dev_user.first_name = "Rachel"
            dev_user.last_name = "Mizer"
            dev_user.save(update_fields=["first_name", "last_name"])
        UserRole.objects.get_or_create(
            user=dev_user,
            defaults={"role": UserRoleChoices.BUSINESS},
        )
        self.stdout.write(self.style.SUCCESS("Dev account seeded: ramizer"))

        # Business users
        for i in range(1, 4):
            u = make_user(f"business{i}", f"business{i}@example.com")
            UserRole.objects.get_or_create(
                user=u,
                defaults={"role": UserRoleChoices.BUSINESS},
            )

        # Customer users
        customers = [
            {
                "username": "jortega",
                "email": "jamie.ortega@gmail.com",
                "first_name": "Jamie",
                "last_name": "Ortega",
                "street_address": "312 Millbrook Rd",
                "city": "Raleigh",
                "zipcode": "27609",
                "phone": "9193847621",
                "email_verified": True,
            },
            {
                "username": "mpatel",
                "email": "morgan.patel@outlook.com",
                "first_name": "Morgan",
                "last_name": "Patel",
                "street_address": "47 Chatham St",
                "city": "Cary",
                "zipcode": "27511",
                "phone": "9197652340",
                "email_verified": False,
            },
            {
                "username": "anguyen",
                "email": "alex.nguyen@yahoo.com",
                "first_name": "Alex",
                "last_name": "Nguyen",
                "street_address": "890 Green Level Church Rd",
                "city": "Apex",
                "zipcode": "27502",
                "phone": "9843021876",
                "email_verified": True,
            },
            {
                "username": "tbrooks",
                "email": "taylor.brooks@gmail.com",
                "first_name": "Taylor",
                "last_name": "Brooks",
                "street_address": "156 W Main St",
                "city": "Durham",
                "zipcode": "27701",
                "phone": "9194483059",
                "email_verified": True,
            },
            {
                "username": "jkim",
                "email": "jordan.kim@icloud.com",
                "first_name": "Jordan",
                "last_name": "Kim",
                "street_address": "23 Town Center Blvd",
                "city": "Morrisville",
                "zipcode": "27560",
                "phone": "9842917403",
                "email_verified": False,
            },
            {
                "username": "crivera",
                "email": "casey.rivera@gmail.com",
                "first_name": "Casey",
                "last_name": "Rivera",
                "street_address": "601 Oberlin Rd",
                "city": "Raleigh",
                "zipcode": "27605",
                "phone": "9193650812",
                "email_verified": True,
            },
        ]

        for c in customers:
            u = make_user(c["username"], c["email"])
            if not u.first_name:
                u.first_name = c["first_name"]
                u.last_name = c["last_name"]
                u.save(update_fields=["first_name", "last_name"])
            UserRole.objects.get_or_create(
                user=u,
                defaults={"role": UserRoleChoices.CUSTOMER},
            )
            CustomerProfile.objects.update_or_create(
                user=u,
                defaults={
                    "email_verified": c["email_verified"],
                    "street_address": c["street_address"],
                    "city": c["city"],
                    "state": "NC",
                    "zipcode": c["zipcode"],
                    "phone": c["phone"],
                },
            )

        # Personal customer account
        rachel_user, rachel_created = User.objects.get_or_create(
            username="Rachel",
            defaults={"email": "rei.mizer@gmail.com"},
        )
        if rachel_created:
            rachel_user.set_password("rmuserpass")
            rachel_user.save(update_fields=["password"])
        if not rachel_user.first_name:
            rachel_user.first_name = "Rachel"
            rachel_user.last_name = "Mizer"
            rachel_user.save(update_fields=["first_name", "last_name"])
        UserRole.objects.get_or_create(
            user=rachel_user,
            defaults={"role": UserRoleChoices.CUSTOMER},
        )
        CustomerProfile.objects.get_or_create(
            user=rachel_user,
            defaults={
                "email_verified": True,
                "street_address": "123 Sesame St.",
                "city": "Raleigh",
                "state": "NC",
                "zipcode": "27601",
                "phone": "9195554783",
            },
        )
        self.stdout.write(self.style.SUCCESS("Personal customer account seeded: Rachel"))

        self.stdout.write(
            self.style.SUCCESS("Users seeded: 3 business, 6 customers + dev + personal")
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
            {
                "name": "Hearth & Heart Bakery",
                "email": "contact@heartNhearth.com",
                "phone": "18001234456",
            },
            {
                "name": "In-House",
                "email": "contact@quicksip.com",
                "phone": "9195558974",
            },
        ]

        suppliers = []
        for s in supplier_rows:
            obj, created = Supplier.objects.get_or_create(name=s["name"], defaults=s)
            if not created:
                changed = False
                for field in ("email", "phone"):
                    if getattr(obj, field) != s[field]:
                        setattr(obj, field, s[field])
                        changed = True
                if changed:
                    obj.save()
            suppliers.append(obj)

        self.stdout.write(self.style.SUCCESS(f"Suppliers seeded: {len(suppliers)}"))

        # ------------------------------------------------------------
        # 4) Inventory
        # ------------------------------------------------------------

        # Purge retired inventory items so stale DB records don't linger
        retired_inventory = [
            "Flour", "Blueberries", "Chocolate Chips", "Chocolate Croissant",
        ]
        retired_qs = InventoryItem.objects.filter(name__in=retired_inventory)
        VariantInventoryUsage.objects.filter(inventory_item__in=retired_qs).delete()
        ModifierInventoryUsage.objects.filter(inventory_item__in=retired_qs).delete()
        retired_qs.delete()

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
            {
                "name": "Cups (24oz)",
                "stock_quantity": Decimal("200.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("80.00"),
            },
            {
                "name": "Lids (24oz)",
                "stock_quantity": Decimal("200.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("80.00"),
            },
            {
                "name": "Straws (8in)",
                "stock_quantity": Decimal("500.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("150.00"),
            },
            {
                "name": "Straws (10in)",
                "stock_quantity": Decimal("500.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("150.00"),
            },
            {
                "name": "Napkins (6in)",
                "stock_quantity": Decimal("1000.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("300.00"),
            },
            {
                "name": "Stirs",
                "stock_quantity": Decimal("500.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("150.00"),
            },
            # Premade bakery items sourced from supplier
            {
                "name": "Croissant",
                "stock_quantity": Decimal("40.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("15.00"),
            },
            {
                "name": "Bagel",
                "stock_quantity": Decimal("40.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("15.00"),
            },
            {
                "name": "English Muffin",
                "stock_quantity": Decimal("40.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("15.00"),
            },
            {
                "name": "Cake Pop - Chocolate",
                "stock_quantity": Decimal("72.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("24.00"),
            },
            {
                "name": "Cake Pop - Birthday Cake",
                "stock_quantity": Decimal("72.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("24.00"),
            },
            {
                "name": "Cake Pop - Vanilla",
                "stock_quantity": Decimal("72.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("24.00"),
            },
            {
                "name": "Blueberry Muffins",
                "stock_quantity": Decimal("72.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("24.00"),
            },
            {
                "name": "Chocolate Croissants",
                "stock_quantity": Decimal("72.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("24.00"),
            },
            {
                "name": "Pumpkin Spice (8oz)",
                "stock_quantity": Decimal("0.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("4.00"),
            },
            {
                "name": "Chai Spice (8oz)",
                "stock_quantity": Decimal("10.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("4.00"),
            },
            # Breakfast sandwich proteins and egg
            {
                "name": "Eggs",
                "stock_quantity": Decimal("60.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("24.00"),
            },
            {
                "name": "Bacon",
                "stock_quantity": Decimal("10.00"),
                "unit_of_measure": UnitOfMeasure.LB,
                "reorder_level": Decimal("4.00"),
            },
            {
                "name": "Sausage",
                "stock_quantity": Decimal("30.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("12.00"),
            },
            {
                "name": "Avocado",
                "stock_quantity": Decimal("20.00"),
                "unit_of_measure": UnitOfMeasure.UNITS,
                "reorder_level": Decimal("8.00"),
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
        category_data = [
            ("Coffee",   "☕"),
            ("Tea",      "🍵"),
            ("Bakery",   "🥐"),
            ("Breakfast","🍳"),
            ("Seasonal", "✨"),
        ]

        categories = {}
        for name, icon in category_data:
            c, _ = Category.objects.get_or_create(name=name)
            if c.icon != icon:
                c.icon = icon
                c.save(update_fields=["icon"])
            categories[name] = c

        self.stdout.write(
            self.style.SUCCESS(f"Categories seeded: {len(category_data)}")
        )

        # ------------------------------------------------------------
        # 6) Products
        # ------------------------------------------------------------
        products_spec = [
            ("House Coffee",        "Coffee",    suppliers[6], True, False, "Our signature daily brew — smooth, comforting, and roasted to bring out a rich, balanced flavor in every cup."),
            ("Latte",               "Coffee",    suppliers[6], True, True,  "Our latte blends rich espresso with silky steamed milk for a creamy, balanced cup that's perfect for slow mornings or steady afternoons."),
            ("Cappuccino",          "Coffee",    suppliers[6], True, True,  "A cozy classic made with rich espresso and a cloud of silky steamed milk, finished with a light, velvety foam."),
            ("Mocha",               "Coffee",    suppliers[6], True, True,  "A cozy fusion of bold espresso and velvety chocolate, finished with steamed milk for a cup that's equal parts rich, warm, and indulgent. It's your coffee break with a little extra joy."),
            ("Cold Brew",           "Coffee",    suppliers[6], True, True,  "Slow-steeped to bring out deep, smooth coffee flavor with none of the bitterness."),
            ("Green Tea",           "Tea",       suppliers[6], True, False, "Light, calming, and naturally uplifting. Our green tea is smooth and gently grassy, brewed to bring out its delicate flavor and soothing warmth."),
            ("Chai Tea Latte",      "Tea",       suppliers[6], True, True,  "Our chai tea latte blends black tea with cinnamon, cardamom, and sweet spices, finished with steamed milk. Add extra chai or a splash of vanilla."),
            ("Blueberry Muffin",    "Bakery",    suppliers[3], True, False, "Warm, soft, and bursting with juicy blueberries, this muffin is everything you want from a morning treat."),
            ("Chocolate Croissant", "Bakery",    suppliers[3], True, False, "A flaky, buttery croissant wrapped around a ribbon of rich, melted chocolate. Lightly crisp on the outside, soft and indulgent within."),
            ("Breakfast Sandwich",  "Breakfast", suppliers[2], True, True,  "Choose from a toasted bagel, buttery croissant, or classic English muffin. Each sandwich comes with a freshly cooked egg, and you can make it yours with any two protein add-ons — creamy avocado, crispy bacon, or savory sausage."),
            ("Pumpkin Spice Latte", "Seasonal",  suppliers[6], True, True,  "Warm, spiced, and unmistakably seasonal. Espresso and steamed milk meet pumpkin, cinnamon, and cozy autumn spices for a cup that feels like a soft sweater and a crisp fall morning."),
            ("Cake Pop",           "Bakery",    suppliers[5], True, False, "A decadent 'pop' of confectionery goodness, our sweet cake pops will quickly brighten up your day!"),
        ]

        products = {}

        for pname, cname, supp, has_variants, has_modifiers, description in products_spec:
            defaults = {
                "category": categories[cname],
                "supplier": supp,
                "has_variants": has_variants,
                "has_modifiers": has_modifiers,
                "description": description,
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
            if product.description != description:
                product.description = description
                changed = True

            if changed:
                product.save()

            products[pname] = product

        self.stdout.write(
            self.style.SUCCESS(f"Products seeded: {len(products_spec)}")
        )

        # ------------------------------------------------------------
        # 6.5) Product images — copy from frontend/public/img into media
        # ------------------------------------------------------------
        product_images = {
            "House Coffee":        ("bev", "house-coffee.png"),
            "Latte":               ("bev", "latte.png"),
            "Cappuccino":          ("bev", "capp.png"),
            "Mocha":               ("bev", "mocha.png"),
            "Cold Brew":           ("bev", "cold-brew.png"),
            "Green Tea":           ("bev", "green-tea.png"),
            "Chai Tea Latte":      ("bev", "chai-latte.png"),
            "Blueberry Muffin":    ("food", "muffin.png"),
            "Chocolate Croissant": ("food", "croissant.png"),
            "Breakfast Sandwich":  ("food", "sandwich.png"),
            "Pumpkin Spice Latte": ("bev", "PSL.png"),
            "Cake Pop":            ("food", "choc_pop.png"),
        }

        frontend_img_root = Path("/app/frontend/public/img")
        media_products_dir = Path(settings.MEDIA_ROOT) / "products"
        media_products_dir.mkdir(parents=True, exist_ok=True)

        images_seeded = 0
        for product_name, (subfolder, filename) in product_images.items():
            product = products.get(product_name)
            if not product:
                continue

            src = frontend_img_root / subfolder / filename
            if not src.exists():
                self.stdout.write(
                    self.style.WARNING(f"  Image not found, skipping: {src}")
                )
                continue

            dest = media_products_dir / filename
            shutil.copy2(src, dest)

            relative_path = f"products/{filename}"
            if product.image.name != relative_path:
                product.image = relative_path
                product.save(update_fields=["image"])

            images_seeded += 1

        self.stdout.write(
            self.style.SUCCESS(f"Product images seeded: {images_seeded}")
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
            "Cake Pop": [
                ("Chocolate", Decimal("2.00")),
                ("Birthday Cake", Decimal("2.00")),
                ("Vanilla", Decimal("2.00")),
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
        # 9) Inventory usage — links ingredients to product variants
        # ------------------------------------------------------------
        def link(variant, item_name, qty):
            item = InventoryItem.objects.filter(name=item_name).first()
            if not item:
                return
            VariantInventoryUsage.objects.get_or_create(
                variant=variant,
                inventory_item=item,
                defaults={"quantity_used": Decimal(qty)},
            )

        def link_modifier(variant, group_name, option_name, item_name, qty):
            item = InventoryItem.objects.filter(name=item_name).first()
            option = ModifierOption.objects.filter(
                group__variant=variant,
                group__name=group_name,
                name=option_name,
            ).first()
            if not item or not option:
                return
            ModifierInventoryUsage.objects.get_or_create(
                modifier_option=option,
                inventory_item=item,
                defaults={"quantity_used": Decimal(qty)},
            )

        espresso = [
            ("Latte",               ["Small", "Medium", "Large"]),
            ("Cappuccino",          ["Small", "Medium", "Large"]),
            ("Mocha",               ["Small", "Medium", "Large"]),
            ("Pumpkin Spice Latte", ["Small", "Medium", "Large"]),
        ]
        milk_drinks = [
            ("Latte",               ["Small", "Medium", "Large"]),
            ("Cappuccino",          ["Small", "Medium", "Large"]),
            ("Mocha",               ["Small", "Medium", "Large"]),
            ("Chai Tea Latte",      ["Small", "Medium", "Large"]),
            ("Pumpkin Spice Latte", ["Small", "Medium", "Large"]),
        ]
        mocha_syrup_drinks = [
            ("Mocha", ["Small", "Medium", "Large"]),
        ]
        green_tea_drinks = [
            ("Green Tea", ["Small", "Medium", "Large"]),
        ]
        coffee_bean_drinks = [
            ("House Coffee", ["Small", "Medium", "Large"]),
            ("Cold Brew",    ["Small", "Large"]),
        ]

        for product_name, sizes in espresso:
            for size in sizes:
                link(variants_by_product[product_name][size], "Espresso Beans", "0.04")

        for product_name, sizes in milk_drinks:
            for size in sizes:
                link(variants_by_product[product_name][size], "Milk", "0.24")

        for product_name, sizes in mocha_syrup_drinks:
            for size in sizes:
                link(variants_by_product[product_name][size], "Mocha Syrup", "0.03")

        for product_name, sizes in green_tea_drinks:
            for size in sizes:
                link(variants_by_product[product_name][size], "Green Tea Leaves", "0.02")

        for product_name, sizes in coffee_bean_drinks:
            for size in sizes:
                link(variants_by_product[product_name][size], "Coffee Beans", "0.04")

        small_drinks = [
            ("House Coffee",        ["Small"]),
            ("Latte",               ["Small"]),
            ("Cappuccino",          ["Small"]),
            ("Mocha",               ["Small"]),
            ("Cold Brew",           ["Small"]),
            ("Green Tea",           ["Small"]),
            ("Chai Tea Latte",      ["Small"]),
            ("Pumpkin Spice Latte", ["Small"]),
        ]

        medium_drinks = [
            ("House Coffee",        ["Medium"]),
            ("Latte",               ["Medium"]),
            ("Cappuccino",          ["Medium"]),
            ("Mocha",               ["Medium"]),
            ("Green Tea",           ["Medium"]),
            ("Chai Tea Latte",      ["Medium"]),
            ("Pumpkin Spice Latte", ["Medium"]),
        ]

        large_drinks = [
            ("House Coffee",        ["Large"]),
            ("Latte",               ["Large"]),
            ("Cappuccino",          ["Large"]),
            ("Mocha",               ["Large"]),
            ("Cold Brew",           ["Large"]),
            ("Green Tea",           ["Large"]),
            ("Chai Tea Latte",      ["Large"]),
            ("Pumpkin Spice Latte", ["Large"]),
        ]

        hot_drinks = [
            ("House Coffee",        ["Small", "Medium", "Large"]),
            ("Latte",               ["Small", "Medium", "Large"]),
            ("Cappuccino",          ["Small", "Medium", "Large"]),
            ("Mocha",               ["Small", "Medium", "Large"]),
            ("Green Tea",           ["Small", "Medium", "Large"]),
            ("Chai Tea Latte",      ["Small", "Medium", "Large"]),
            ("Pumpkin Spice Latte", ["Small", "Medium", "Large"]),
        ]

        all_drinks_small = small_drinks
        all_drinks_medium_large = medium_drinks + large_drinks

        for product_name, sizes in hot_drinks:
            for size in sizes:
                link(variants_by_product[product_name][size], "Stirs", "1")

        for product_name, sizes in all_drinks_small:
            for size in sizes:
                link(variants_by_product[product_name][size], "Straws (8in)", "1")

        for product_name, sizes in all_drinks_medium_large:
            for size in sizes:
                link(variants_by_product[product_name][size], "Straws (10in)", "1")

        for product_name, sizes in small_drinks:
            for size in sizes:
                link(variants_by_product[product_name][size], "Cups (12oz)", "1")
                link(variants_by_product[product_name][size], "Lids (12oz)", "1")

        for product_name, sizes in medium_drinks:
            for size in sizes:
                link(variants_by_product[product_name][size], "Cups (16oz)", "1")
                link(variants_by_product[product_name][size], "Lids (16oz)", "1")

        for product_name, sizes in large_drinks:
            for size in sizes:
                link(variants_by_product[product_name][size], "Cups (24oz)", "1")
                link(variants_by_product[product_name][size], "Lids (24oz)", "1")

        # Blueberry Muffin — premade, sourced from supplier
        link(variants_by_product["Blueberry Muffin"]["Standard"], "Blueberry Muffins", "1")

        # Chocolate Croissant — premade, tracked as a stock unit
        link(variants_by_product["Chocolate Croissant"]["Standard"], "Chocolate Croissants", "1")

        # Pumpkin Spice Latte — requires pumpkin spice
        for size in ["Small", "Medium", "Large"]:
            link(variants_by_product["Pumpkin Spice Latte"][size], "Pumpkin Spice (8oz)", "0.5")

        # Chai Tea Latte — requires chai spice
        for size in ["Small", "Medium", "Large"]:
            link(variants_by_product["Chai Tea Latte"][size], "Chai Spice (8oz)", "0.5")

        # Breakfast Sandwich — egg is a base ingredient regardless of build
        link(variants_by_product["Breakfast Sandwich"]["Standard"], "Eggs", "1")

        # Breakfast Sandwich — bread choices (premade, sourced from supplier)
        breakfast_variant = variants_by_product["Breakfast Sandwich"]["Standard"]
        link_modifier(breakfast_variant, "Bread Choice", "Croissant",     "Croissant",      "1")
        link_modifier(breakfast_variant, "Bread Choice", "Bagel",         "Bagel",          "1")
        link_modifier(breakfast_variant, "Bread Choice", "English Muffin","English Muffin", "1")

        # Breakfast Sandwich — protein add-ons
        link_modifier(breakfast_variant, "Protein Add-On", "Bacon",   "Bacon",   "0.1")
        link_modifier(breakfast_variant, "Protein Add-On", "Sausage", "Sausage", "1")
        link_modifier(breakfast_variant, "Protein Add-On", "Avocado", "Avocado", "0.5")

        # Cake Pops — premade by supplier, each flavor tracked as its own stock unit
        link(variants_by_product["Cake Pop"]["Chocolate"],    "Cake Pop - Chocolate",     "1")
        link(variants_by_product["Cake Pop"]["Birthday Cake"],"Cake Pop - Birthday Cake", "1")
        link(variants_by_product["Cake Pop"]["Vanilla"],      "Cake Pop - Vanilla",       "1")

        self.stdout.write(
            self.style.SUCCESS("Inventory usage seeded: ingredients linked to variants")
        )

        # ------------------------------------------------------------
        # 10) Store settings
        # ------------------------------------------------------------
        store_settings, _ = StoreSettings.objects.update_or_create(
            pk=1,
            defaults=dict(
                store_name="Quick Sip Cafe",
                tax_rate=Decimal("8.00"),
                contact_phone="7045550192",
                contact_email="hello@quicksipcafe.com",
                hq_address="201 W Main St. Raleigh, NC 27601",
                store_address="201 W Main St. Raleigh, NC 27601",
                store_phone="7045550192",
                hours="Mon-Fri 6am-2pm\nSat-Sun 6am-3pm",
                store_tagline="Your pause, perfected.",
                show_tagline=False,
                header_special_text_color="#9a4422",
                header_text_color="#482e1d",
                nav_bg_color="#a3966a",
                nav_link_color="#f5f0e8",
                nav_text_color="#ffffff",
                main_link_color="#6e5b50",
                main_text_color="#3b2a20",
                footer_bg_color="#a3966a",
                footer_link_color="#f5f0e8",
                footer_text_color="#ffffff",
                btn_bg_color="#9a4422",
                btn_text_color="#ffffff",
                section_bg_1_color="#f5f0e8",
                section_bg_2_color="#e8dfd0",
                page_background_color="#faf7f2",
                font_choice="munson",
            ),
        )

        media_store_dir = Path(settings.MEDIA_ROOT) / "store"
        media_store_dir.mkdir(parents=True, exist_ok=True)
        store_img_src = Path("/app/frontend/public/img")

        for field_name, filename in [("store_image", "logo.png"), ("favicon", "favicon.ico")]:
            src = store_img_src / filename
            if not src.exists():
                self.stdout.write(self.style.WARNING(f"  Store image not found, skipping: {src}"))
                continue
            dst = media_store_dir / filename
            shutil.copy2(str(src), str(dst))
            relative_path = f"store/{filename}"
            current = getattr(store_settings, field_name)
            if not current or current.name != relative_path:
                setattr(store_settings, field_name, relative_path)
                store_settings.save(update_fields=[field_name])

        self.stdout.write(self.style.SUCCESS("Store settings seeded: Quick Sip Cafe branding"))

        # ------------------------------------------------------------
        # 11) Final summary
        # ------------------------------------------------------------
        self.stdout.write(self.style.SUCCESS("Seed data loaded successfully."))