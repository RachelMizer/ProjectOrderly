"""
generate_sales_csv.py
Django management command — generates monthly sales CSV seed files.

Usage:
    python manage.py generate_sales_csv
    python manage.py generate_sales_csv --seed 99   # different RNG seed

Output files (written alongside this script):
    12-2025_sales.csv
    01-2026_sales.csv
    02-2026_sales.csv
    03-2026_sales.csv
    04-2026_sales.csv  (to-date: current date at generation time)

Each file contains three sections:
    1. DAILY SALES     — one row per product-variant per day
    2. MONTHLY SUMMARY — aggregated totals per product-variant
    3. MONTH TOTALS    — grand total units and revenue for the month
"""

import csv
import random
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand


# ---------------------------------------------------------------------------
# Product catalog — matches seed_data.py variants exactly
# (product_name, variant_name, unit_price, base_weekday_units)
# ---------------------------------------------------------------------------
PRODUCTS = [
    ("House Coffee",        "Small",         Decimal("2.50"),  12),
    ("House Coffee",        "Medium",        Decimal("2.95"),  15),
    ("House Coffee",        "Large",         Decimal("3.25"),   9),
    ("Latte",               "Small",         Decimal("4.50"),   8),
    ("Latte",               "Medium",        Decimal("5.00"),  13),
    ("Latte",               "Large",         Decimal("5.50"),  10),
    ("Cappuccino",          "Small",         Decimal("4.25"),   6),
    ("Cappuccino",          "Medium",        Decimal("4.75"),   8),
    ("Cappuccino",          "Large",         Decimal("5.25"),   5),
    ("Mocha",               "Small",         Decimal("4.75"),   6),
    ("Mocha",               "Medium",        Decimal("5.25"),   7),
    ("Mocha",               "Large",         Decimal("5.75"),   4),
    ("Cold Brew",           "Small",         Decimal("3.75"),   5),
    ("Cold Brew",           "Large",         Decimal("4.50"),   3),
    ("Green Tea",           "Small",         Decimal("2.75"),   5),
    ("Green Tea",           "Medium",        Decimal("3.10"),   7),
    ("Green Tea",           "Large",         Decimal("3.50"),   4),
    ("Chai Tea Latte",      "Small",         Decimal("4.25"),   6),
    ("Chai Tea Latte",      "Medium",        Decimal("4.75"),   8),
    ("Chai Tea Latte",      "Large",         Decimal("5.25"),   4),
    ("Blueberry Muffin",    "Standard",      Decimal("2.95"),  12),
    ("Chocolate Croissant", "Standard",      Decimal("3.45"),   8),
    ("Breakfast Sandwich",  "Standard",      Decimal("5.95"),   6),
    ("Pumpkin Spice Latte", "Small",         Decimal("5.00"),   8),
    ("Pumpkin Spice Latte", "Medium",        Decimal("5.50"),  10),
    ("Pumpkin Spice Latte", "Large",         Decimal("6.00"),   6),
    ("Cake Pop",            "Chocolate",     Decimal("2.00"),   5),
    ("Cake Pop",            "Birthday Cake", Decimal("2.00"),   3),
    ("Cake Pop",            "Vanilla",       Decimal("2.00"),   3),
]

# ---------------------------------------------------------------------------
# Day-of-week multipliers (Monday=0 … Sunday=6)
# ---------------------------------------------------------------------------
DOW_MULT = {
    0: 1.00,  # Mon
    1: 0.95,  # Tue
    2: 1.05,  # Wed
    3: 1.00,  # Thu
    4: 1.15,  # Fri
    5: 1.30,  # Sat
    6: 0.75,  # Sun
}

# ---------------------------------------------------------------------------
# Special-date overrides (override DOW multiplier entirely)
# ---------------------------------------------------------------------------
SPECIAL_DATES = {
    date(2025, 12, 18): 1.10,  # Pre-Christmas ramp
    date(2025, 12, 19): 1.25,
    date(2025, 12, 20): 1.40,
    date(2025, 12, 21): 0.90,
    date(2025, 12, 22): 1.15,
    date(2025, 12, 23): 1.20,
    date(2025, 12, 24): 1.50,  # Christmas Eve
    date(2025, 12, 25): 0.20,  # Christmas Day (limited hours)
    date(2025, 12, 26): 0.85,  # Post-Christmas
    date(2025, 12, 31): 1.20,  # New Year's Eve
    date(2026,  1,  1): 0.25,  # New Year's Day (limited hours)
    date(2026,  1,  2): 0.85,  # Post-NYE
    date(2026,  2, 14): 1.20,  # Valentine's Day
    date(2026,  3, 17): 1.15,  # St. Patrick's Day
}

# ---------------------------------------------------------------------------
# Seasonal adjustments — (product_name, month) → multiplier on base units
# 0.0 = off-menu entirely (row omitted from CSV)
# ---------------------------------------------------------------------------
SEASONAL = {
    # PSL — on menu Aug through Nov, off menu Dec onward
    ("Pumpkin Spice Latte",  8): 0.40,  # Just launched
    ("Pumpkin Spice Latte",  9): 0.80,  # Picking up
    ("Pumpkin Spice Latte", 10): 1.00,  # Peak season
    ("Pumpkin Spice Latte", 11): 0.70,  # Tapering
    ("Pumpkin Spice Latte", 12): 0.00,  # Off menu
    ("Pumpkin Spice Latte",  1): 0.00,
    ("Pumpkin Spice Latte",  2): 0.00,
    ("Pumpkin Spice Latte",  3): 0.00,
    ("Pumpkin Spice Latte",  4): 0.00,
    # Cold Brew — stronger in warm months, slower in winter
    ("Cold Brew",            8): 1.40,  # Summer peak
    ("Cold Brew",            9): 1.20,  # Early fall
    ("Cold Brew",           10): 0.95,
    ("Cold Brew",           11): 0.80,
    ("Cold Brew",           12): 0.70,
    ("Cold Brew",            1): 0.65,
    ("Cold Brew",            2): 0.70,
    ("Cold Brew",            3): 0.85,
    ("Cold Brew",            4): 1.00,
}

# ---------------------------------------------------------------------------
# Months to generate
# (year, month, output_filename, optional_cutoff_date_or_None)
# ---------------------------------------------------------------------------
MONTHS = [
    (2025,  8, "08-2025_sales.csv", None),
    (2025,  9, "09-2025_sales.csv", None),
    (2025, 10, "10-2025_sales.csv", None),
    (2025, 11, "11-2025_sales.csv", None),
    (2025, 12, "12-2025_sales.csv", None),
    (2026,  1, "01-2026_sales.csv", None),
    (2026,  2, "02-2026_sales.csv", None),
    (2026,  3, "03-2026_sales.csv", None),
    (2026,  4, "04-2026_sales.csv", date.today()),  # to-date
]


class Command(BaseCommand):
    help = "Generates monthly sales CSV seed files for the Orderly sales dashboard."

    def add_arguments(self, parser):
        parser.add_argument(
            "--seed",
            type=int,
            default=42,
            help="RNG seed for reproducible output (default: 42)",
        )

    def handle(self, *args, **options):
        rng = random.Random(options["seed"])
        out_dir = Path(__file__).resolve().parent

        for year, month, filename, cutoff in MONTHS:
            rows = self._generate_month(year, month, cutoff, rng)
            path = out_dir / filename
            self._write_csv(path, year, month, rows)
            self.stdout.write(self.style.SUCCESS(f"Written: {filename}"))

        self.stdout.write(self.style.SUCCESS("All sales CSV files generated."))

    # -----------------------------------------------------------------------
    # Helpers
    # -----------------------------------------------------------------------

    def _days_in_month(self, year, month):
        if month == 12:
            first_next = date(year + 1, 1, 1)
        else:
            first_next = date(year, month + 1, 1)
        return (first_next - date(year, month, 1)).days

    def _generate_month(self, year, month, cutoff, rng):
        """
        Returns a list of row tuples:
            (date, product, variant, unit_price, units_sold, daily_revenue)
        """
        days = self._days_in_month(year, month)
        rows = []

        for day in range(1, days + 1):
            d = date(year, month, day)
            if cutoff and d > cutoff:
                break

            day_mult = SPECIAL_DATES.get(d, DOW_MULT[d.weekday()])

            for product, variant, price, base in PRODUCTS:
                seasonal_mult = SEASONAL.get((product, month), 1.0)

                if seasonal_mult == 0.0:
                    units = 0
                else:
                    raw = base * day_mult * seasonal_mult
                    noise = rng.uniform(-1.5, 1.5)
                    units = max(0, round(raw + noise))

                revenue = (price * units).quantize(Decimal("0.01"))
                rows.append((d, product, variant, price, units, revenue))

        return rows

    def _write_csv(self, path, year, month, rows):
        # Build per-product-variant totals
        summary = {}
        for d, product, variant, price, units, revenue in rows:
            key = (product, variant, price)
            if key not in summary:
                summary[key] = {"units": 0, "revenue": Decimal("0.00")}
            summary[key]["units"] += units
            summary[key]["revenue"] += revenue

        total_units = sum(v["units"] for v in summary.values())
        total_revenue = sum(v["revenue"] for v in summary.values())

        month_label = date(year, month, 1).strftime("%B %Y").upper()

        with open(path, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)

            # ── Section 1: Daily Sales ──────────────────────────────────
            w.writerow([f"DAILY SALES — {month_label}"])
            w.writerow([
                "Date", "Product", "Variant",
                "Units Sold", "Unit Price", "Daily Revenue",
            ])
            for d, product, variant, price, units, revenue in rows:
                w.writerow([
                    d.strftime("%Y-%m-%d"),
                    product,
                    variant,
                    units,
                    f"${price}",
                    f"${revenue}",
                ])

            w.writerow([])  # blank separator

            # ── Section 2: Monthly Summary ──────────────────────────────
            w.writerow([f"MONTHLY SUMMARY — {month_label}"])
            w.writerow([
                "Product", "Variant",
                "Total Units Sold", "Unit Price", "Total Revenue",
            ])
            for (product, variant, price), totals in sorted(summary.items()):
                w.writerow([
                    product,
                    variant,
                    totals["units"],
                    f"${price}",
                    f"${totals['revenue']}",
                ])

            w.writerow([])  # blank separator

            # ── Section 3: Month Totals ─────────────────────────────────
            w.writerow([f"MONTH TOTALS — {month_label}"])
            w.writerow(["Total Units Sold", total_units])
            w.writerow(["Total Revenue", f"${total_revenue}"])
