"""
Management command to seed 100 bulk customer accounts with full profiles.

Generates deterministic Triangle-area NC customers using a fixed random seed.
Run after seed_data.py (which seeds the core 6 test customers).

Usage:
    python manage.py seed_customers
    python manage.py seed_customers --clear   # delete seeded customers first
"""

import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from accounts.models import CustomerProfile, UserRole, UserRoleChoices

User = get_user_model()

DEFAULT_SEED = 2025

FIRST_NAMES = [
    "Amara", "Brianna", "Carlos", "Diana", "Ethan",
    "Fatima", "Gabriel", "Hannah", "Isaac", "Julia",
    "Kevin", "Laura", "Marcus", "Nadia", "Omar",
    "Priya", "Quinn", "Rachel", "Samuel", "Tara",
    "Ulises", "Veronica", "William", "Ximena", "Yasmine",
    "Zachary", "Alicia", "Brandon", "Chloe", "Derek",
    "Elena", "Felix", "Grace", "Hector", "Iris",
    "James", "Kara", "Liam", "Maya", "Nathan",
    "Olivia", "Patrick", "Rosa", "Steven", "Tina",
    "Uma", "Victor", "Wendy", "Xavier", "Yolanda",
    "Aaron", "Beth", "Colin", "Daphne", "Eduardo",
    "Fiona", "George", "Holly", "Ivan", "Jenny",
    "Keith", "Linda", "Mohammed", "Nina", "Oscar",
    "Paula", "Raj", "Sara", "Thomas", "Ursula",
    "Vanessa", "Walter", "Yuki", "Zoe", "Andre",
    "Bianca", "Christopher", "Danielle", "Emmanuel", "Francesca",
    "Gregory", "Heidi", "Ian", "Jasmine", "Kenneth",
    "Lorena", "Miguel", "Nicole", "Orlando", "Penelope",
    "Roberto", "Samantha", "Trevor", "Uma", "Valentina",
    "Wesley", "Yusuf", "Zara", "Alexis", "Dante",
]

LAST_NAMES = [
    "Anderson", "Baker", "Carter", "Davis", "Evans",
    "Foster", "Garcia", "Harris", "Ibrahim", "Johnson",
    "Khan", "Lee", "Martinez", "Nelson", "Okafor",
    "Patel", "Quinn", "Robinson", "Singh", "Taylor",
    "Upton", "Vasquez", "Walker", "Xu", "Young",
    "Zimmerman", "Adams", "Brown", "Chen", "Diaz",
    "Edwards", "Flores", "Green", "Hall", "Ingram",
    "Jackson", "Kim", "Lopez", "Moore", "Nguyen",
    "Ortega", "Parker", "Reed", "Scott", "Thompson",
    "Underwood", "Villa", "White", "Yang", "Zapata",
]

STREET_NAMES = [
    "Oak", "Maple", "Pine", "Cedar", "Elm",
    "Main", "Lake", "Park", "Hill", "Ridge",
    "Forest", "Spring", "Sunset", "River", "Meadow",
    "Willow", "Birch", "Holly", "Poplar", "Magnolia",
    "Walnut", "Peach", "Dogwood", "Creekside", "Heritage",
    "Stonegate", "Fairview", "Lakeview", "Greenfield", "Brookside",
]

STREET_TYPES = ["St", "Ave", "Rd", "Blvd", "Ln", "Dr", "Ct", "Way", "Pl", "Cir"]

CITY_ZIP_PAIRS = [
    ("Raleigh", "27601"), ("Raleigh", "27603"), ("Raleigh", "27604"),
    ("Raleigh", "27605"), ("Raleigh", "27606"), ("Raleigh", "27607"),
    ("Raleigh", "27608"), ("Raleigh", "27609"), ("Raleigh", "27610"),
    ("Raleigh", "27612"), ("Raleigh", "27613"), ("Raleigh", "27615"),
    ("Durham", "27701"), ("Durham", "27703"), ("Durham", "27704"),
    ("Durham", "27705"), ("Durham", "27707"),
    ("Chapel Hill", "27514"), ("Chapel Hill", "27516"),
    ("Cary", "27511"), ("Cary", "27513"), ("Cary", "27519"),
    ("Apex", "27502"), ("Apex", "27523"),
    ("Morrisville", "27560"),
    ("Garner", "27529"),
    ("Holly Springs", "27540"),
    ("Wake Forest", "27587"),
    ("Clayton", "27520"),
    ("Fuquay-Varina", "27526"),
    ("Knightdale", "27545"),
    ("Zebulon", "27597"),
]

AREA_CODES = ["919", "984", "704"]

EMAIL_DOMAINS = ["gmail.com", "outlook.com", "yahoo.com", "icloud.com"]


def _generate_customers(rng):
    first_names = list(FIRST_NAMES)
    last_names = list(LAST_NAMES)
    rng.shuffle(first_names)
    rng.shuffle(last_names)

    used_usernames = set()
    customers = []

    for i in range(100):
        first = first_names[i]
        last = last_names[i % len(last_names)]

        base_username = (first[0] + last).lower()
        username = base_username
        counter = 2
        while username in used_usernames:
            username = f"{base_username}{counter}"
            counter += 1
        used_usernames.add(username)

        domain = rng.choice(EMAIL_DOMAINS)
        email = f"{first.lower()}.{last.lower()}{i + 1}@{domain}"

        street_num = rng.randint(100, 9999)
        street_name = rng.choice(STREET_NAMES)
        street_type = rng.choice(STREET_TYPES)
        street_address = f"{street_num} {street_name} {street_type}"

        city, zipcode = rng.choice(CITY_ZIP_PAIRS)
        area_code = rng.choice(AREA_CODES)
        phone = f"{area_code}{rng.randint(1000000, 9999999)}"

        customers.append({
            "username": username,
            "email": email,
            "first_name": first,
            "last_name": last,
            "street_address": street_address,
            "city": city,
            "state": "NC",
            "zipcode": zipcode,
            "phone": phone,
            "email_verified": rng.random() < 0.7,
        })

    return customers


class Command(BaseCommand):
    help = "Seed 100 customer accounts with full profiles"

    def add_arguments(self, parser):
        parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete previously seeded bulk customers before re-seeding",
        )

    def handle(self, *args, **options):
        rng = random.Random(options["seed"])
        customers = _generate_customers(rng)
        usernames = [c["username"] for c in customers]

        if options["clear"]:
            deleted, _ = User.objects.filter(username__in=usernames).delete()
            self.stdout.write(f"Cleared {deleted} existing user(s).")

        created_count = 0
        for c in customers:
            user, created = User.objects.get_or_create(
                username=c["username"],
                defaults={"email": c["email"]},
            )
            if created:
                user.first_name = c["first_name"]
                user.last_name = c["last_name"]
                user.set_password("Password123!")
                user.save()

            UserRole.objects.get_or_create(
                user=user,
                defaults={"role": UserRoleChoices.CUSTOMER},
            )

            CustomerProfile.objects.update_or_create(
                user=user,
                defaults={
                    "email_verified": c["email_verified"],
                    "street_address": c["street_address"],
                    "city": c["city"],
                    "state": c["state"],
                    "zipcode": c["zipcode"],
                    "phone": c["phone"],
                },
            )

            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. {created_count} new customer(s) created ({len(customers)} total processed)."
            )
        )
