from decimal import Decimal

from django.db.models import Max, Sum, Count, Avg
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response

from orders.models import Order, OrderItem
from sales.models import DailySale
from catalog.models import Product as CatalogProduct
from accounts.api.permissions import IsBusinessUser

from .serializers import (
    SalesSummarySerializer,
    ProductSalesListSerializer,
    CategorySalesListSerializer,
    SalesSummaryQuerySerializer,
    ProductSalesQuerySerializer,
    DateRangeSerializer,
)


_MONTH_NAMES = {
    1: "January", 2: "February", 3: "March", 4: "April",
    5: "May", 6: "June", 7: "July", 8: "August",
    9: "September", 10: "October", 11: "November", 12: "December",
}


class SalesSummaryView(APIView):
    permission_classes = [IsBusinessUser]

    def get(self, request):
        query_serializer = SalesSummaryQuerySerializer(data=request.GET)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data

        start_date = params["startDate"]
        end_date = params["endDate"]
        group_by = params["groupBy"]

        qs = DailySale.objects.filter(sale_date__range=[start_date, end_date])

        total_revenue = qs.aggregate(total=Sum("daily_revenue"))["total"] or Decimal("0.00")
        total_units = qs.aggregate(total=Sum("units_sold"))["total"] or 0

        # Chart data
        trunc_fn = TruncDay if group_by == "day" else TruncMonth
        chart_qs = (
            qs.annotate(period=trunc_fn("sale_date"))
            .values("period")
            .annotate(rev=Sum("daily_revenue"), units=Sum("units_sold"))
            .order_by("period")
        )
        chart_data = []
        for item in chart_qs:
            label = str(item["period"].day) if group_by == "day" else _MONTH_NAMES[item["period"].month]
            chart_data.append({
                "label": label,
                "revenue": float((item["rev"] or Decimal("0.00")).quantize(Decimal("0.01"))),
                "units_sold": item["units"] or 0,
            })

        # Products breakdown
        categories = {
            p.name: p.category.name
            for p in CatalogProduct.objects.select_related("category").all()
        }
        products_qs = (
            qs.values("product_name", "variant_name")
            .annotate(
                units_sold=Sum("units_sold"),
                revenue=Sum("daily_revenue"),
                unit_price=Max("unit_price"),
            )
            .order_by("-units_sold")
        )
        products = [
            {
                "name": r["product_name"],
                "variant": r["variant_name"],
                "category": categories.get(r["product_name"], "—"),
                "unit_price": str((r["unit_price"] or Decimal("0.00")).quantize(Decimal("0.01"))),
                "units_sold": r["units_sold"] or 0,
                "revenue": str((r["revenue"] or Decimal("0.00")).quantize(Decimal("0.01"))),
            }
            for r in products_qs
        ]

        # Available years and months across all data (for filter dropdowns)
        all_months_qs = (
            DailySale.objects
            .annotate(period=TruncMonth("sale_date"))
            .values("period")
            .distinct()
            .order_by("period")
        )
        available_years = sorted({m["period"].year for m in all_months_qs})
        all_months_qs2 = (
            DailySale.objects
            .annotate(period=TruncMonth("sale_date"))
            .values("period")
            .distinct()
            .order_by("period")
        )
        available_months = [
            {
                "value": f"{m['period'].month:02d}-{m['period'].year}",
                "label": f"{_MONTH_NAMES[m['period'].month]} {m['period'].year}",
            }
            for m in all_months_qs2
        ]

        return Response({
            "total_revenue": str(Decimal(str(total_revenue)).quantize(Decimal("0.01"))),
            "order_count": total_units,
            "available_years": available_years,
            "available_months": available_months,
            "chart_data": chart_data,
            "products": products,
        })


class BestSellersView(APIView):
    permission_classes = [IsBusinessUser]

    def get(self, request):
        query_serializer = ProductSalesQuerySerializer(data=request.GET)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data

        start_date = params["startDate"]
        end_date = params["endDate"]
        limit = params["limit"]

        qs = OrderItem.objects.filter(
            order__status="COMPLETED",
            order__order_date__date__range=[start_date, end_date],
        )

        results = (
            qs.values(
                "variant__product__id",
                "variant__product__name",
            )
            .annotate(
                quantitySold=Sum("quantity"),
                grossSales=Sum("item_total"),
            )
            .order_by("-quantitySold")[:limit]
        )

        data = {
            "startDate": start_date,
            "endDate": end_date,
            "limit": limit,
            "results": [
                {
                    "productId": r["variant__product__id"],
                    "productName": r["variant__product__name"],
                    "quantitySold": r["quantitySold"] or 0,
                    "grossSales": r["grossSales"] or 0,
                }
                for r in results
            ],
        }

        return Response(ProductSalesListSerializer(data).data)


class WorstSellersView(APIView):
    permission_classes = [IsBusinessUser]

    def get(self, request):
        query_serializer = ProductSalesQuerySerializer(data=request.GET)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data

        start_date = params["startDate"]
        end_date = params["endDate"]
        limit = params["limit"]

        qs = OrderItem.objects.filter(
            order__status="COMPLETED",
            order__order_date__date__range=[start_date, end_date],
        )

        results = (
            qs.values(
                "variant__product__id",
                "variant__product__name",
            )
            .annotate(
                quantitySold=Sum("quantity"),
                grossSales=Sum("item_total"),
            )
            .order_by("quantitySold")[:limit]
        )

        data = {
            "startDate": start_date,
            "endDate": end_date,
            "limit": limit,
            "results": [
                {
                    "productId": r["variant__product__id"],
                    "productName": r["variant__product__name"],
                    "quantitySold": r["quantitySold"] or 0,
                    "grossSales": r["grossSales"] or 0,
                }
                for r in results
            ],
        }

        return Response(ProductSalesListSerializer(data).data)


class SalesByCategoryView(APIView):
    permission_classes = [IsBusinessUser]

    def get(self, request):
        query_serializer = DateRangeSerializer(data=request.GET)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data

        start_date = params["startDate"]
        end_date = params["endDate"]

        qs = OrderItem.objects.filter(
            order__status="COMPLETED",
            order__order_date__date__range=[start_date, end_date],
        )

        results = (
            qs.values(
                "variant__product__category__id",
                "variant__product__category__name",
            )
            .annotate(
                quantitySold=Sum("quantity"),
                grossSales=Sum("item_total"),
            )
            .order_by("-grossSales")
        )

        data = {
            "startDate": start_date,
            "endDate": end_date,
            "results": [
                {
                    "categoryId": r["variant__product__category__id"],
                    "categoryName": r["variant__product__category__name"],
                    "quantitySold": r["quantitySold"] or 0,
                    "grossSales": r["grossSales"] or 0,
                }
                for r in results
            ],
        }

        return Response(CategorySalesListSerializer(data).data)
