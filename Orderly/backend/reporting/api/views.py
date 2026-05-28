import calendar
from decimal import Decimal

from django.db.models import Max, Sum, Count, Avg, F
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response

from orders.models import Order, OrderItem
from accounts.api.permissions import IsStoreManagerOrAbove

from .serializers import (
    ProductSalesListSerializer,
    CategorySalesListSerializer,
    SalesSummaryQuerySerializer,
    ProductSalesQuerySerializer,
    DateRangeSerializer,
)


class SalesSummaryView(APIView):
    permission_classes = [IsStoreManagerOrAbove]

    def get(self, request):
        query_serializer = SalesSummaryQuerySerializer(data=request.GET)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data

        start_date = params["startDate"]
        end_date = params["endDate"]
        group_by = params["groupBy"]

        qs = Order.objects.filter(
            status__in=["PENDING", "COMPLETED"],
            order_date__date__range=[start_date, end_date],
        )

        totals = qs.aggregate(total=Sum("total_payment_due"), count=Count("id"))
        total_revenue = totals["total"] or Decimal("0.00")
        total_orders = totals["count"] or 0

        average_order_value = (
            (total_revenue / total_orders).quantize(Decimal("0.01"))
            if total_orders else Decimal("0.00")
        )

        trunc_fn = TruncDay if group_by == "day" else TruncMonth
        breakdown_qs = (
            qs.annotate(period=trunc_fn("order_date"))
            .values("period")
            .annotate(revenue=Sum("total_payment_due"), orders=Count("id"))
            .order_by("period")
        )
        breakdown = [
            {
                "period": item["period"].strftime("%Y-%m") if group_by == "month" else str(item["period"].date()),
                "revenue": float((item["revenue"] or Decimal("0.00")).quantize(Decimal("0.01"))),
                "orders": item["orders"] or 0,
            }
            for item in breakdown_qs
        ]

        product_qs = (
            OrderItem.objects.filter(
                order__status__in=["PENDING", "COMPLETED"],
                order__order_date__date__range=[start_date, end_date],
            )
            .values("variant__product__name", "variant__name")
            .annotate(
                units_sold=Sum("quantity"),
                revenue=Sum("item_total"),
                unit_price=Max("unit_price_charged"),
            )
            .order_by("-revenue")
        )

        products = [
            {
                "rank": i + 1,
                "name": p["variant__product__name"],
                "variant": p["variant__name"],
                "unit_price": str(Decimal(str(p["unit_price"] or 0)).quantize(Decimal("0.01"))),
                "units_sold": p["units_sold"] or 0,
                "revenue": str(Decimal(str(p["revenue"] or 0)).quantize(Decimal("0.01"))),
            }
            for i, p in enumerate(product_qs)
        ]

        # --- Metadata for Filters ---
        all_counted = Order.objects.filter(status__in=["PENDING", "COMPLETED"])
        available_years = (
            all_counted.annotate(year=F("order_date__year"))
            .values_list("year", flat=True)
            .distinct()
            .order_by("-year")
        )

        available_months = []
        # If the range represents a single year, provide month options for that year
        if start_date.year == end_date.year and start_date.month == 1 and end_date.month == 12:
            months_qs = (
                all_counted.filter(order_date__year=start_date.year)
                .annotate(month=F("order_date__month"))
                .values_list("month", flat=True)
                .distinct()
                .order_by("month")
            )
            for m in months_qs:
                available_months.append({
                    "value": f"{m:02d}-{start_date.year}",
                    "label": calendar.month_name[m]
                })

        return Response({
            "startDate": str(start_date),
            "endDate": str(end_date),
            "groupBy": group_by,
            "totalRevenue": str(Decimal(str(total_revenue)).quantize(Decimal("0.01"))),
            "totalOrders": total_orders,
            "averageOrderValue": str(average_order_value),
            "breakdown": breakdown,
            "products": products,
            "availableYears": list(available_years),
            "availableMonths": available_months,
        })


class BestSellersView(APIView):
    permission_classes = [IsStoreManagerOrAbove]

    def get(self, request):
        query_serializer = ProductSalesQuerySerializer(data=request.GET)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data

        start_date = params["startDate"]
        end_date = params["endDate"]
        limit = params["limit"]

        qs = OrderItem.objects.filter(
            order__status__in=["PENDING", "COMPLETED"],
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
    permission_classes = [IsStoreManagerOrAbove]

    def get(self, request):
        query_serializer = ProductSalesQuerySerializer(data=request.GET)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data

        start_date = params["startDate"]
        end_date = params["endDate"]
        limit = params["limit"]

        qs = OrderItem.objects.filter(
            order__status__in=["PENDING", "COMPLETED"],
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
    permission_classes = [IsStoreManagerOrAbove]

    def get(self, request):
        query_serializer = DateRangeSerializer(data=request.GET)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data

        start_date = params["startDate"]
        end_date = params["endDate"]

        qs = OrderItem.objects.filter(
            order__status__in=["PENDING", "COMPLETED"],
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
