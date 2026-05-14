import csv
from datetime import date
from decimal import Decimal, InvalidOperation
from pathlib import Path

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from accounts.api.permissions import IsBusinessOrExecutive
from catalog.models import Product


_COMMANDS_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "sales"
    / "data"
)

_MONTH_NAMES = {
    "01": "January", "02": "February", "03": "March",
    "04": "April",   "05": "May",      "06": "June",
    "07": "July",    "08": "August",   "09": "September",
    "10": "October", "11": "November", "12": "December",
}


def _available_years():
    years = set()
    for f in _COMMANDS_DIR.glob("*_sales.csv"):
        parts = f.stem.replace("_sales", "").split("-")
        if len(parts) == 2:
            try:
                years.add(int(parts[1]))
            except ValueError:
                pass
    return sorted(years)


def _available_months(year=None):
    months = []
    for f in sorted(_COMMANDS_DIR.glob("*_sales.csv")):
        stem = f.stem.replace("_sales", "")
        parts = stem.split("-")
        if len(parts) == 2:
            mm, yyyy = parts
            if year and yyyy != str(year):
                continue
            label = f"{_MONTH_NAMES.get(mm, mm)} {yyyy}"
            months.append({"value": stem, "label": label})
    return months


def _read_summary(filepath):
    """Parses the MONTHLY SUMMARY section. Returns list of product-variant dicts."""
    rows = []
    in_summary = False

    with open(filepath, "r", encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or not row[0].strip():
                in_summary = False
                continue
            first = row[0].strip()
            if first.startswith("MONTHLY SUMMARY"):
                in_summary = True
                continue
            if first == "Product":
                continue
            if first.startswith("MONTH TOTALS"):
                in_summary = False
                continue
            if in_summary and len(row) >= 5:
                try:
                    units = int(row[2].strip())
                    unit_price = Decimal(row[3].strip().lstrip("$"))
                    revenue = Decimal(row[4].strip().lstrip("$"))
                except (ValueError, InvalidOperation):
                    continue
                rows.append({
                    "name": first,
                    "variant": row[1].strip(),
                    "unit_price": unit_price,
                    "units_sold": units,
                    "revenue": revenue,
                })
    return rows


def _read_daily(filepath):
    """
    Parses the DAILY SALES section of one CSV file.
    Returns dict keyed by date string: {units_sold, revenue}
    """
    daily = {}
    in_daily = False

    with open(filepath, "r", encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or not row[0].strip():
                continue
            first = row[0].strip()
            if first.startswith("DAILY SALES"):
                in_daily = True
                continue
            if first == "Date":
                continue
            if first.startswith("MONTHLY SUMMARY"):
                break
            if in_daily and len(row) >= 6:
                try:
                    date_str = first           # "2026-04-01"
                    units = int(row[3].strip())
                    revenue = Decimal(row[5].strip().lstrip("$"))
                except (ValueError, InvalidOperation):
                    continue
                if date_str not in daily:
                    daily[date_str] = {"units_sold": 0, "revenue": Decimal("0.00")}
                daily[date_str]["units_sold"] += units
                daily[date_str]["revenue"] += revenue

    return daily


def _build_chart_data(files, month_filter, year_filter):
    """
    Returns a list of chart points.
    - Month selected  → one point per day  (label = "1", "2", …)
    - Year selected   → one point per month, all 12 months, zeros for missing ones
    - No filter       → one point per month across all available files
    """
    if month_filter:
        filepath = _COMMANDS_DIR / f"{month_filter}_sales.csv"
        daily = _read_daily(filepath)
        points = []
        for date_str in sorted(daily):
            day_num = date_str.split("-")[2].lstrip("0") or "0"
            d = daily[date_str]
            points.append({
                "label": day_num,
                "revenue": float(d["revenue"].quantize(Decimal("0.01"))),
                "units_sold": d["units_sold"],
            })
        return points

    if year_filter:
        # Always return all 12 months; fill missing ones with zeros
        file_map = {}
        for f in files:
            stem = f.stem.replace("_sales", "")
            parts = stem.split("-")
            if len(parts) == 2:
                file_map[parts[0]] = f  # key by "MM"

        points = []
        for mm in ["01","02","03","04","05","06","07","08","09","10","11","12"]:
            label = _MONTH_NAMES[mm]
            if mm in file_map:
                daily = _read_daily(file_map[mm])
                total_revenue = sum(d["revenue"] for d in daily.values())
                total_units = sum(d["units_sold"] for d in daily.values())
            else:
                total_revenue = Decimal("0.00")
                total_units = 0
            points.append({
                "label": label,
                "revenue": float(total_revenue.quantize(Decimal("0.01"))),
                "units_sold": total_units,
            })
        return points

    # No year filter — just show available months
    points = []
    for f in sorted(files):
        stem = f.stem.replace("_sales", "")
        parts = stem.split("-")
        if len(parts) != 2:
            continue
        mm, yyyy = parts
        label = _MONTH_NAMES.get(mm, mm)
        daily = _read_daily(f)
        total_revenue = sum(d["revenue"] for d in daily.values())
        total_units = sum(d["units_sold"] for d in daily.values())
        points.append({
            "label": label,
            "revenue": float(total_revenue.quantize(Decimal("0.01"))),
            "units_sold": total_units,
        })
    return points


def _aggregate(all_rows):
    totals = {}
    for row in all_rows:
        key = (row["name"], row["variant"])
        if key not in totals:
            totals[key] = {
                "name": row["name"],
                "variant": row["variant"],
                "unit_price": row["unit_price"],
                "units_sold": 0,
                "revenue": Decimal("0.00"),
            }
        totals[key]["units_sold"] += row["units_sold"]
        totals[key]["revenue"] += row["revenue"]
    return list(totals.values())


def _category_lookup():
    """Returns {product_name: category_name} from the catalog DB."""
    return {
        p.name: p.category.name
        for p in Product.objects.select_related("category").all()
    }


def _serialize_rows(rows):
    categories = _category_lookup()
    return [
        {
            "name": r["name"],
            "variant": r["variant"],
            "category": categories.get(r["name"], "—"),
            "unit_price": str(r["unit_price"].quantize(Decimal("0.01"))),
            "units_sold": r["units_sold"],
            "revenue": str(r["revenue"].quantize(Decimal("0.01"))),
        }
        for r in sorted(rows, key=lambda r: r["units_sold"], reverse=True)
    ]


def _read_daily_for_product(filepath, name, variant):
    """
    Parses the DAILY SALES section and returns daily totals for one product-variant.
    Returns dict keyed by date string: {units_sold, revenue}
    """
    daily = {}
    in_daily = False

    with open(filepath, "r", encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or not row[0].strip():
                continue
            first = row[0].strip()
            if first.startswith("DAILY SALES"):
                in_daily = True
                continue
            if first == "Date":
                continue
            if first.startswith("MONTHLY SUMMARY"):
                break
            if in_daily and len(row) >= 6:
                if row[1].strip() != name or row[2].strip() != variant:
                    continue
                try:
                    units   = int(row[3].strip())
                    revenue = Decimal(row[5].strip().lstrip("$"))
                except (ValueError, InvalidOperation):
                    continue
                if first not in daily:
                    daily[first] = {"units_sold": 0, "revenue": Decimal("0.00")}
                daily[first]["units_sold"] += units
                daily[first]["revenue"]    += revenue

    return daily


def _all_products():
    """Returns sorted list of unique {name, variant} dicts across all CSV files."""
    seen = set()
    products = []
    for f in sorted(_COMMANDS_DIR.glob("*_sales.csv")):
        for row in _read_summary(f):
            key = (row["name"], row["variant"])
            if key not in seen:
                seen.add(key)
                products.append({"name": row["name"], "variant": row["variant"]})
    return sorted(products, key=lambda p: (p["name"], p["variant"]))


class AdminProductPerformanceView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def get(self, request):
        name         = request.query_params.get("name")
        variant      = request.query_params.get("variant")
        year_filter  = request.query_params.get("year")
        month_filter = request.query_params.get("month")

        try:
            all_products = _all_products()

            if not name or not variant:
                return Response(
                    {"products": all_products, "selected": None},
                    status=status.HTTP_200_OK,
                )

            total_revenue = Decimal("0.00")
            total_units   = 0
            best_revenue  = Decimal("0.00")
            best_period   = None
            breakdown     = []

            if month_filter:
                # Daily granularity — one row per day in the month
                granularity = "daily"
                filepath = _COMMANDS_DIR / f"{month_filter}_sales.csv"
                if not filepath.exists():
                    return Response(
                        {"detail": f"No sales file found for {month_filter}."},
                        status=status.HTTP_404_NOT_FOUND,
                    )
                daily = _read_daily_for_product(filepath, name, variant)
                for date_str in sorted(daily):
                    d     = daily[date_str]
                    rev   = d["revenue"]
                    units = d["units_sold"]
                    day_num = date_str.split("-")[2].lstrip("0") or "0"
                    label   = f"Day {day_num}"
                    total_revenue += rev
                    total_units   += units
                    if rev > best_revenue:
                        best_revenue = rev
                        best_period  = label
                    breakdown.append({
                        "label":      label,
                        "date_key":   date_str,
                        "units_sold": units,
                        "revenue":    float(rev.quantize(Decimal("0.01"))),
                    })

            else:
                # Monthly granularity — one row per available month
                granularity  = "monthly"
                all_files    = sorted(_COMMANDS_DIR.glob("*_sales.csv"))
                scoped_files = []
                for f in all_files:
                    stem  = f.stem.replace("_sales", "")
                    parts = stem.split("-")
                    if len(parts) == 2 and year_filter and parts[1] != year_filter:
                        continue
                    scoped_files.append(f)

                for f in scoped_files:
                    stem  = f.stem.replace("_sales", "")
                    parts = stem.split("-")
                    if len(parts) != 2:
                        continue
                    mm, yyyy = parts
                    label = f"{_MONTH_NAMES.get(mm, mm)} {yyyy}"
                    rows  = _read_summary(f)
                    match = next(
                        (r for r in rows if r["name"] == name and r["variant"] == variant),
                        None,
                    )
                    rev   = match["revenue"]    if match else Decimal("0.00")
                    units = match["units_sold"] if match else 0
                    total_revenue += rev
                    total_units   += units
                    if rev > best_revenue:
                        best_revenue = rev
                        best_period  = label
                    breakdown.append({
                        "label":      label,
                        "month_key":  stem,
                        "units_sold": units,
                        "revenue":    float(rev.quantize(Decimal("0.01"))),
                    })

        except Exception as e:
            return Response(
                {"detail": f"Failed to read product data: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "products": all_products,
                "selected": {
                    "name":          name,
                    "variant":       variant,
                    "total_revenue": str(total_revenue.quantize(Decimal("0.01"))),
                    "total_units":   total_units,
                    "best_period":   best_period or "N/A",
                    "granularity":   granularity,
                    "breakdown":     breakdown,
                },
            },
            status=status.HTTP_200_OK,
        )


class AdminSalesSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def get(self, request):
        month_filter = request.query_params.get("month")
        year_filter  = request.query_params.get("year")

        try:
            # Determine which files are in scope
            all_files = sorted(_COMMANDS_DIR.glob("*_sales.csv"))
            scoped_files = []
            for f in all_files:
                stem = f.stem.replace("_sales", "")
                parts = stem.split("-")
                if len(parts) == 2 and year_filter and parts[1] != year_filter:
                    continue
                scoped_files.append(f)

            if month_filter:
                filepath = _COMMANDS_DIR / f"{month_filter}_sales.csv"
                if not filepath.exists():
                    return Response(
                        {"detail": f"No sales file found for {month_filter}."},
                        status=status.HTTP_404_NOT_FOUND,
                    )
                rows = _read_summary(filepath)
            else:
                all_rows = []
                for f in scoped_files:
                    all_rows.extend(_read_summary(f))
                rows = _aggregate(all_rows)

            chart_data = _build_chart_data(
                scoped_files if not month_filter else [],
                month_filter,
                year_filter,
            )

        except Exception as e:
            return Response(
                {"detail": f"Failed to read sales data: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serialized = _serialize_rows(rows)
        total_revenue = sum(Decimal(r["revenue"]) for r in serialized)
        total_units = sum(r["units_sold"] for r in serialized)

        return Response(
            {
                "total_revenue": str(total_revenue.quantize(Decimal("0.01"))),
                "order_count": total_units,
                "available_years": _available_years(),
                "available_months": _available_months(year=year_filter),
                "chart_data": chart_data,
                "products": serialized,
            },
            status=status.HTTP_200_OK,
        )
