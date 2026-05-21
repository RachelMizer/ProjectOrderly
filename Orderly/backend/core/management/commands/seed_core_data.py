import random
from decimal import Decimal

from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Populate the database with realistic, reproducible seed data for Orderly."

    def add_arguments(self, parser):
        parser.add_argument(
            "--seed",
            type=int,
            default=42,
            help="Random seed for reproducible data (default: 42).",
        )
        parser.add_argument(
            "--customers",
            type=int,
            default=5,
            help="Number of customer users to create (default: 5).",
        )
        parser.add_argument(
            "--business",
            type=int,
            default=2,
            help="Number of business users to create (default: 2).",
        )

    def handle(self, *args, **options):
        seed = options["seed"]
        num_customers = options["customers"]
        num_business = options["business"]

        random.seed(seed)

        self.stdout.write(self.style.NOTICE(f"Seeding database (seed={seed})..."))

        # --- helpers ---
        def safe_model(app_label: str, model_name: str):
            try:
                return apps.get_model(app_label, model_name)
            except LookupError:
                return None

        def money(x) -> Decimal:
            return Decimal(str(x)).quantize(Decimal("0.01"))

        # --- core models (always present) ---
        User = get_user_model()
        UserRole = safe_model("accounts", "UserRole")
        CustomerProfile = safe_model("accounts", "CustomerProfile")

        # Optional models (may exist depending on team progress)
        Supplier = safe_model("suppliers", "Supplier")
        InventoryItem = safe_model("inventory", "InventoryItem")
        Order = safe_model("orders", "Order")
        OrderItem = safe_model("orders", "OrderItem")
        Payment = safe_model("orders", "Payment")

        # Catalog models are optional (your teammate may be building them)
        Category = safe_model("catalog", "Category")
        Product = safe_model("catalog", "Product")
        ProductVariant = safe_model("catalog", "ProductVariant")
        ModifierGroup = safe_model("catalog", "ModifierGroup")
        ModifierOption = safe_model("catalog", "ModifierOption")

        # --- 1) Create a superuser (optional but useful) ---
        admin_username = "admin"
        admin_email = "admin@example.com"
        admin_pw = "AdminPass123!"

        admin_user, created = User.objects.get_or_create(
            username=admin_username,
            defaults={"email": admin_email, "is_staff": True, "is_superuser": True},
        )
        if created:
            admin_user.set_password(admin_pw)
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created superuser: admin / AdminPass123!"))
        else:
            self.stdout.write(self.style.NOTICE("Superuser 'admin' already exists (skipping)."))

        # --- 2) Create business + customer users and profiles ---
        def ensure_profile(user, role_value: str):
            if not UserRole:
                return
            UserRole.objects.get_or_create(user=user, defaults={"role": role_value})

        def ensure_customer_profile(user):
            if not CustomerProfile:
                return
            CustomerProfile.objects.get_or_create(
                user=user,
                defaults={
                    "street_address": "123 Main St",
                    "city": "Raleigh",
                    "state": "NC",
                    "zipcode": "27601",
                    "phone": "9195550101",
                },
            )

        business_users = []
        for i in range(1, num_business + 1):
            username = f"business{i}"
            email = f"business{i}@example.com"
            user, created = User.objects.get_or_create(username=username, defaults={"email": email})
            if created:
                user.set_password("Password123!")
                user.save()
            ensure_profile(user, "STORE_MANAGER")
            business_users.append(user)

        customer_users = []
        for i in range(1, num_customers + 1):
            username = f"customer{i}"
            email = f"customer{i}@example.com"
            user, created = User.objects.get_or_create(username=username, defaults={"email": email})
            if created:
                user.set_password("Password123!")
                user.save()
            ensure_profile(user, "CUSTOMER")
            ensure_customer_profile(user)
            customer_users.append(user)

        self.stdout.write(self.style.SUCCESS(f"Users seeded: {len(business_users)} business, {len(customer_users)} customers"))

        # --- 3) Suppliers ---
        suppliers = []
        sup_map = {}
        if Supplier:
            supplier_data = [
                ("Brew Source NC",       "support@brewsource.example",         "9195551600"),
                ("Carolina Wholesale",   "orders@carolinawholesale.example",   "9195551400"),
                ("EcoPlastics",          "contact@ecoplastics.com",            "1-800-eco-4you"),
                ("Fresh Farms Co",       "contact@freshfarms.example",         "9195551200"),
                ("Good Grain Supply",    "hello@goodgrain.example",            "9195551500"),
                ("Hearth & Heart Bakery","contact@heartNhearth.com",           "18001234456"),
                ("In-House",             "contact@quicksip.com",               "9195558974"),
                ("NUTrition Inc.",       "contact@NUTrition.com",              "1-800-wer-nuts"),
                ("SupaGreen Produce",    "purchasing@supagreen.com",           "1-800-yas-green"),
                ("Triangle Produce",     "sales@triangleproduce.example",      "9195551300"),
            ]
            for name, email, phone in supplier_data:
                s, _ = Supplier.objects.get_or_create(
                    name=name,
                    defaults={"email": email, "phone": phone},
                )
                suppliers.append(s)
                sup_map[name] = s
            self.stdout.write(self.style.SUCCESS(f"Suppliers seeded: {len(suppliers)}"))
        else:
            self.stdout.write(self.style.WARNING("Supplier model not found (skipping suppliers)."))

        # --- 4) Inventory Items ---
        # Columns: (name, unit_of_measure, stock_quantity, reorder_level, supplier_name)
        inventory_items = []
        if InventoryItem:
            items = [
                ("Almond Milk",              "l",      16,    6,   "NUTrition Inc."),
                ("Avocado",                  "units",  20,    8,   "SupaGreen Produce"),
                ("Bacon",                    "lb",     10,    4,   "Fresh Farms Co"),
                ("Bagel",                    "units",  40,   15,   "Carolina Wholesale"),
                ("Black Tea Leaves",         "lb",     12,    4,   "Brew Source NC"),
                ("Blueberry Muffins",        "units",  72,   24,   "Hearth & Heart Bakery"),
                ("Cake Pop - Birthday Cake", "units",  72,   24,   "Hearth & Heart Bakery"),
                ("Cake Pop - Chocolate",     "units",  72,   24,   "Hearth & Heart Bakery"),
                ("Cake Pop - Vanilla",       "units",  25,    4,   "Hearth & Heart Bakery"),
                ("Caramel Syrup",            "l",      10,    4,   "Carolina Wholesale"),
                ("Chai Spice (8oz)",         "units",  10,    4,   "Carolina Wholesale"),
                ("Chocolate Croissants",     "units",  72,   24,   "Hearth & Heart Bakery"),
                ("Coffee Beans",             "lb",      6,    2,   "Brew Source NC"),
                ("Croissant",                "units",  40,   15,   "Carolina Wholesale"),
                ("Cups (12oz)",              "units", 300,  120,   "EcoPlastics"),
                ("Cups (16oz)",              "units", 260,  100,   None),
                ("Cups (24oz)",              "units", 200,   80,   "EcoPlastics"),
                ("Eggs",                     "units",  60,   24,   "Triangle Produce"),
                ("English Muffin",           "units",  40,   15,   "Carolina Wholesale"),
                ("Espresso Beans",           "lb",     20,    8,   "Brew Source NC"),
                ("Green Tea Leaves",         "lb",     12,    5,   "Brew Source NC"),
                ("Lids (12oz)",              "units", 280,  120,   "EcoPlastics"),
                ("Lids (16oz)",              "units", 240,  100,   "EcoPlastics"),
                ("Lids (24oz)",              "units", 200,   80,   "EcoPlastics"),
                ("Milk",                     "l",      30,   12,   "Fresh Farms Co"),
                ("Mocha Syrup",              "l",      10,    4,   "Carolina Wholesale"),
                ("Napkins (6in)",            "units", 1000, 300,   "Carolina Wholesale"),
                ("Oat Milk",                 "l",      16,    6,   "NUTrition Inc."),
                ("Pumpkin Spice (8oz)",      "units",   0,    4,   "Carolina Wholesale"),
                ("Sausage",                  "units",  30,   12,   "Carolina Wholesale"),
                ("Stirs",                    "units", 500,  150,   "EcoPlastics"),
                ("Straws (10in)",            "units", 500,  150,   "EcoPlastics"),
                ("Straws (8in)",             "units", 500,  150,   "EcoPlastics"),
                ("Sugar",                    "lb",     18,    8,   "Carolina Wholesale"),
                ("Vanilla Syrup",            "l",      10,    4,   "Carolina Wholesale"),
                ("Whipped Cream",            "units",  20,    8,   "Fresh Farms Co"),
            ]
            for name, uom, stock_qty, reorder, sup_name in items:
                supplier_obj = sup_map.get(sup_name) if sup_name else None
                obj, created = InventoryItem.objects.get_or_create(
                    name=name,
                    defaults={
                        "unit_of_measure": uom,
                        "stock_quantity": money(stock_qty),
                        "reorder_level": money(reorder),
                        "supplier": supplier_obj,
                    },
                )
                if not created and obj.supplier != supplier_obj:
                    obj.supplier = supplier_obj
                    obj.save(update_fields=["supplier"])
                inventory_items.append(obj)
            self.stdout.write(self.style.SUCCESS(f"Inventory seeded: {len(inventory_items)}"))
        else:
            self.stdout.write(self.style.WARNING("InventoryItem model not found (skipping inventory)."))

        # --- 5) Catalog (only if those models exist) ---
        variants = []
        if Category and Product and ProductVariant:
            cat_food, _ = Category.objects.get_or_create(name="Food")
            cat_drinks, _ = Category.objects.get_or_create(name="Drinks")

            burger, _ = Product.objects.get_or_create(name="Classic Burger", defaults={"category": cat_food})
            fries, _ = Product.objects.get_or_create(name="Fries", defaults={"category": cat_food})
            cola, _ = Product.objects.get_or_create(name="Cola", defaults={"category": cat_drinks})

            # These field names might vary by your team's catalog models.
            # We try common patterns and skip gracefully if mismatched.
            def make_variant(product, name, price):
                field_names = [f.name for f in ProductVariant._meta.fields]

                kwargs = {}
                defaults = {}

                # variant display/name field
                variant_name_field = None
                for field in ["name", "variant_name", "label", "title"]:
                    if field in field_names:
                        variant_name_field = field
                        kwargs[field] = name
                        break

                # price field
                for field in ["price", "base_price", "unit_price"]:
                    if field in field_names:
                        defaults[field] = money(price)
                        break

                # required FK to product
                fk_name = None
                for f in ProductVariant._meta.fields:
                    if getattr(f, "related_model", None) == Product:
                        fk_name = f.name
                        break

                if not fk_name or not variant_name_field:
                    return None

                kwargs[fk_name] = product

                # unique SKU if model has sku field
                if "sku" in field_names:
                    sku = f"{product.name}-{name}".upper().replace(" ", "-")
                    defaults["sku"] = sku

                # optional stock quantity if your model uses it
                if "stock_quantity" in field_names:
                    defaults.setdefault("stock_quantity", 10)

                obj, _ = ProductVariant.objects.get_or_create(
                    **kwargs,
                    defaults=defaults,
                )
                return obj

            for (prod, vname, price) in [
                (burger, "Single Patty", 9.99),
                (burger, "Double Patty", 12.99),
                (fries, "Regular", 3.49),
                (fries, "Large", 4.49),
                (cola, "16oz", 2.49),
                (cola, "24oz", 3.49),
            ]:
                v = make_variant(prod, vname, price)
                if v:
                    variants.append(v)

            self.stdout.write(self.style.SUCCESS(f"Catalog seeded: {len(variants)} variants"))
        else:
            self.stdout.write(self.style.WARNING("Catalog models incomplete (skipping catalog seed)."))

        # --- 6) Orders (only if orders + order items exist) ---
        if Order and OrderItem and customer_users:
            # Map customers to CustomerProfile rows
            customer_profiles = []
            if CustomerProfile:
                for u in customer_users:
                    try:
                        customer_profiles.append(u.customer_profile)
                    except Exception:
                        pass

            # Create a couple orders
            for idx in range(min(3, len(customer_profiles))):
                cp = customer_profiles[idx] if customer_profiles else None
                guest_email = None if cp else f"guest{idx+1}@example.com"

                order, created = Order.objects.get_or_create(
                    customer=cp,
                    guest_email=guest_email,
                    defaults={
                        "subtotal": money(0),
                        "tax_amount": money(0),
                        "total_payment_due": money(0),
                        "status": "PENDING",
                    },
                )

                if created:
                    # Create 1-3 items if variants exist, otherwise skip items
                    picked_variants = random.sample(variants, k=min(len(variants), random.randint(1, 3))) if variants else []
                    subtotal = Decimal("0.00")

                    for v in picked_variants:
                        qty = random.randint(1, 3)

                        # Try to read a price from the variant (guess common fields)
                        variant_price = None
                        for pf in ["price", "base_price", "unit_price"]:
                            if hasattr(v, pf):
                                variant_price = getattr(v, pf)
                                break
                        if variant_price is None:
                            variant_price = money(5.00)

                        item_total = money(Decimal(qty) * Decimal(variant_price))
                        OrderItem.objects.create(
                            order=order,
                            variant=v,
                            quantity=qty,
                            unit_price_charged=money(variant_price),
                            item_total=item_total,
                        )
                        subtotal += item_total

                    tax = money(subtotal * Decimal("0.0825"))
                    total = money(subtotal + tax)

                    order.subtotal = money(subtotal)
                    order.tax_amount = tax
                    order.total_payment_due = total
                    order.save()

            self.stdout.write(self.style.SUCCESS("Orders seeded (basic)."))
        else:
            self.stdout.write(self.style.WARNING("Orders models incomplete or no customers (skipping orders seed)."))

        self.stdout.write(self.style.SUCCESS("✅ Seed complete. Everyone can reproduce this with the same --seed value."))