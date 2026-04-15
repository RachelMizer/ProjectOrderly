from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.core.management.base import CommandError

from catalog.models import Category, Product, ProductVariant
from sales.models import DailySale, SalesImportBatch


@pytest.fixture
def product_variant(db):
    """
    Creates valid Product + Variant based on actual model requirements
    """
    category = Category.objects.create(name="Drinks")

    product = Product.objects.create(
        name="Latte",
        category=category,
        description="Test product",
        has_variants=True,
        has_modifiers=False,
    )

    variant = ProductVariant.objects.create(
        product=product,
        name="Small",
        sku="LATTE-SMALL-TEST",
        unit_price=Decimal("4.50"),
    )

    return product, variant


@pytest.mark.django_db
def test_import_sales_creates_batch_and_daily_sales(tmp_path, product_variant):
    csv_file = tmp_path / "04-2026_sales.csv"
    csv_file.write_text(
        "\n".join(
            [
                "DAILY SALES — APRIL 2026",
                "Date,Product,Variant,Units Sold,Unit Price,Daily Revenue",
                "2026-04-01,Latte,Small,3,4.50,13.50",
                "2026-04-02,Latte,Small,2,4.50,9.00",
            ]
        ),
        encoding="utf-8",
    )

    call_command("import_sales", str(csv_file))

    assert SalesImportBatch.objects.count() == 1
    assert DailySale.objects.count() == 2


@pytest.mark.django_db
def test_import_sales_updates_existing(tmp_path, product_variant):
    csv_file = tmp_path / "04-2026_sales.csv"

    csv_file.write_text(
        "2026-04-01,Latte,Small,3,4.50,13.50",
        encoding="utf-8",
    )

    call_command("import_sales", str(csv_file))

    csv_file.write_text(
        "2026-04-01,Latte,Small,5,4.50,22.50",
        encoding="utf-8",
    )

    call_command("import_sales", str(csv_file), update_existing=True)

    sale = DailySale.objects.get()
    assert sale.units_sold == 5
    assert sale.daily_revenue == Decimal("22.50")


@pytest.mark.django_db
def test_import_sales_skips_unmatched_variant(tmp_path, product_variant):
    csv_file = tmp_path / "04-2026_sales.csv"
    csv_file.write_text(
        "2026-04-01,Latte,Large,3,4.50,13.50",
        encoding="utf-8",
    )

    call_command("import_sales", str(csv_file))

    assert DailySale.objects.count() == 0


@pytest.mark.django_db
def test_import_sales_rejects_bad_filename(tmp_path):
    csv_file = tmp_path / "badname.csv"
    csv_file.write_text("test", encoding="utf-8")

    with pytest.raises(CommandError):
        call_command("import_sales", str(csv_file))


@pytest.mark.django_db
def test_import_sales_invalid_month_validation(tmp_path, product_variant):
    csv_file = tmp_path / "13-2026_sales.csv"
    csv_file.write_text(
        "2026-04-01,Latte,Small,3,4.50,13.50",
        encoding="utf-8",
    )

    with pytest.raises(ValidationError):
        call_command("import_sales", str(csv_file))

    assert SalesImportBatch.objects.count() == 0