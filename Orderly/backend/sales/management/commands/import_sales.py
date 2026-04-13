from __future__ import annotations

import csv
import re
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from catalog.models import ProductVariant
from sales.models import DailySale, SalesImportBatch


class Command(BaseCommand):
    help = "Import daily sales CSV files into the sales app."

    def add_arguments(self, parser):
        parser.add_argument(
            "csv_files",
            nargs="+",
            type=str,
            help="One or more CSV file paths to import.",
        )
        parser.add_argument(
            "--update-existing",
            action="store_true",
            help="Update existing DailySale rows when a matching row already exists.",
        )

    def handle(self, *args, **options):
        csv_files = options["csv_files"]
        update_existing = options["update_existing"]

        total_created = 0
        total_updated = 0
        total_skipped = 0

        for file_path_str in csv_files:
            file_path = Path(file_path_str)

            if not file_path.exists():
                raise CommandError(f"File does not exist: {file_path}")

            created, updated, skipped = self._import_file(
                file_path=file_path,
                update_existing=update_existing,
            )
            total_created += created
            total_updated += updated
            total_skipped += skipped

        self.stdout.write(
            self.style.SUCCESS(
                f"Import complete. Created={total_created}, "
                f"Updated={total_updated}, Skipped={total_skipped}"
            )
        )

    @transaction.atomic
    def _import_file(self, file_path: Path, update_existing: bool) -> tuple[int, int, int]:
        month, year = self._extract_month_year_from_filename(file_path.name)

        batch, _ = SalesImportBatch.objects.get_or_create(
            file_name=file_path.name,
            defaults={
                "month": month,
                "year": year,
            },
        )

        created_count = 0
        updated_count = 0
        skipped_count = 0

        with file_path.open(mode="r", encoding="utf-8-sig", newline="") as csvfile:
            reader = csv.reader(csvfile)
            rows = list(reader)

        # Keep only actual data rows
        data_rows = self._extract_data_rows(rows)

        for row_num, row in data_rows:
            try:
                sale_date_str, product_name, variant_name, units_sold_str, unit_price_str, daily_revenue_str = row
            except ValueError:
                skipped_count += 1
                self.stdout.write(
                    self.style.WARNING(
                        f"[{file_path.name}] Skipping malformed row {row_num}: {row}"
                    )
                )
                continue

            try:
                sale_date = datetime.strptime(sale_date_str.strip(), "%Y-%m-%d").date()
            except ValueError:
                skipped_count += 1
                self.stdout.write(
                    self.style.WARNING(
                        f"[{file_path.name}] Invalid date on row {row_num}: {sale_date_str}"
                    )
                )
                continue

            product_name = product_name.strip()
            variant_name = variant_name.strip()

            try:
                units_sold = int(units_sold_str.strip())
                unit_price = self._parse_money(unit_price_str)
                daily_revenue = self._parse_money(daily_revenue_str)
            except (ValueError, InvalidOperation) as exc:
                skipped_count += 1
                self.stdout.write(
                    self.style.WARNING(
                        f"[{file_path.name}] Invalid numeric value on row {row_num}: {exc}"
                    )
                )
                continue

            variant = ProductVariant.objects.filter(
                product__name=product_name,
                name=variant_name,
            ).select_related("product").first()

            if variant is None:
                skipped_count += 1
                self.stdout.write(
                    self.style.WARNING(
                        f"[{file_path.name}] No ProductVariant match on row {row_num}: "
                        f"{product_name} / {variant_name}"
                    )
                )
                continue

            sale, created = DailySale.objects.get_or_create(
                sale_date=sale_date,
                variant=variant,
                defaults={
                    "import_batch": batch,
                    "product_name": product_name,
                    "variant_name": variant_name,
                    "units_sold": units_sold,
                    "unit_price": unit_price,
                    "daily_revenue": daily_revenue,
                },
            )

            if created:
                created_count += 1
                continue

            if update_existing:
                changed = False

                if sale.import_batch != batch:
                    sale.import_batch = batch
                    changed = True
                if sale.product_name != product_name:
                    sale.product_name = product_name
                    changed = True
                if sale.variant_name != variant_name:
                    sale.variant_name = variant_name
                    changed = True
                if sale.units_sold != units_sold:
                    sale.units_sold = units_sold
                    changed = True
                if sale.unit_price != unit_price:
                    sale.unit_price = unit_price
                    changed = True
                if sale.daily_revenue != daily_revenue:
                    sale.daily_revenue = daily_revenue
                    changed = True

                if changed:
                    sale.save()
                    updated_count += 1
                else:
                    skipped_count += 1
            else:
                skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"{file_path.name}: Created={created_count}, "
                f"Updated={updated_count}, Skipped={skipped_count}"
            )
        )

        return created_count, updated_count, skipped_count

    def _extract_month_year_from_filename(self, filename: str) -> tuple[int, int]:
        match = re.match(r"^(?P<month>\d{2})-(?P<year>\d{4})_sales\.csv$", filename)
        if not match:
            raise CommandError(
                f"Filename must match MM-YYYY_sales.csv format: {filename}"
            )

        month = int(match.group("month"))
        year = int(match.group("year"))
        return month, year

    def _parse_money(self, value: str) -> Decimal:
        cleaned = value.strip().replace("$", "").replace(",", "")
        return Decimal(cleaned).quantize(Decimal("0.01"))

    def _extract_data_rows(self, rows: list[list[str]]) -> list[tuple[int, list[str]]]:
        """
        Returns only the true sales rows:
        Date, Product, Variant, Units Sold, Unit Price, Daily Revenue

        Skips:
        - title row like DAILY SALES — ...
        - header rows
        - blank rows
        - monthly summary/footer rows
        """
        extracted: list[tuple[int, list[str]]] = []

        for index, row in enumerate(rows, start=1):
            if not row:
                continue

            normalized = [cell.strip() for cell in row]

            # Skip completely empty rows
            if not any(normalized):
                continue

            first_cell = normalized[0]

            # Skip title rows / summary rows / footer rows
            if first_cell.startswith("DAILY SALES"):
                continue
            if first_cell == "MONTHLY SUMMARY":
                continue
            if first_cell == "Date":
                continue
            if first_cell == "Total Units Sold":
                continue
            if first_cell == "Total Revenue":
                continue

            # Need exactly 6 columns for a usable sales row
            if len(normalized) != 6:
                continue

            extracted.append((index, normalized))

        return extracted