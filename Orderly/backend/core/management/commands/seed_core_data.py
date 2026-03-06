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
        UserProfile = safe_model("accounts", "UserProfile")
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
            if not UserProfile:
                return
            UserProfile.objects.get_or_create(user=user, defaults={"role": role_value})

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
                    "phone": "919-555-0101",
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
            ensure_profile(user, "BUSINESS")
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
        if Supplier:
            supplier_names = [
                "Triangle Produce Co.",
                "Carolina Meat Supply",
                "Coastal Dairy Distributors",
                "Piedmont Bakery Wholesale",
            ]
            for name in supplier_names:
                s, _ = Supplier.objects.get_or_create(
                    name=name,
                    defaults={"email": f"contact@{name.lower().replace(' ', '').replace('.', '')}.com", "phone": "919-555-0000"},
                )
                suppliers.append(s)
            self.stdout.write(self.style.SUCCESS(f"Suppliers seeded: {len(suppliers)}"))
        else:
            self.stdout.write(self.style.WARNING("Supplier model not found (skipping suppliers)."))

        # --- 4) Inventory Items ---
        inventory_items = []
        if InventoryItem:
            # Try to match your UnitOfMeasure choices (units, oz, lb, g, ml, l)
            items = [
                ("Burger Buns", "units", 200, 50),
                ("Ground Beef", "lb", 80, 20),
                ("Lettuce", "units", 40, 10),
                ("Cheddar Cheese", "lb", 25, 5),
                ("Fries (Frozen)", "lb", 120, 30),
                ("Soda Syrup", "l", 20, 5),
            ]
            for name, uom, stock_qty, reorder in items:
                obj, _ = InventoryItem.objects.get_or_create(
                    name=name,
                    defaults={
                        "unit_of_measure": uom,
                        "stock_quantity": money(stock_qty),
                        "reorder_level": money(reorder),
                    },
                )
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
                kwargs = {}
                for field in ["name", "variant_name", "label", "title"]:
                    if field in [f.name for f in ProductVariant._meta.fields]:
                        kwargs[field] = name
                        break
                # price field guess
                for field in ["price", "base_price", "unit_price"]:
                    if field in [f.name for f in ProductVariant._meta.fields]:
                        kwargs[field] = money(price)
                        break

                # required FK to product guess
                fk_name = None
                for f in ProductVariant._meta.fields:
                    if getattr(f, "related_model", None) == Product:
                        fk_name = f.name
                        break
                if not fk_name:
                    return None

                kwargs[fk_name] = product
                obj, _ = ProductVariant.objects.get_or_create(**kwargs)
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