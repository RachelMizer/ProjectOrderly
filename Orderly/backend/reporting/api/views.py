from decimal import Decimal

from django.db.models import Max, Sum, Count, Avg
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response

from orders.models import Order, OrderItem
from accounts.api.permissions import IsBusinessUser

from .serializers import (
    ProductSalesListSerializer,
    CategorySalesListSerializer,
    SalesSummaryQuerySerializer,
    ProductSalesQuerySerializer,
    DateRangeSerializer,
)


class SalesSummaryView(APIView):
    permission_classes = [IsBusinessUser]

    def get(self, request):
        query_serializer = SalesSummaryQuerySerializer(data=request.GET)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data

        start_date = params["startDate"]
        end_date = params["endDate"]
        group_by = params["groupBy"]

        qs = Order.objects.filter(
            status="COMPLETED",
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

        return Response({
            "startDate": str(start_date),
            "endDate": str(end_date),
            "groupBy": group_by,
            "totalRevenue": str(Decimal(str(total_revenue)).quantize(Decimal("0.01"))),
            "totalOrders": total_orders,
            "averageOrderValue": str(average_order_value),
            "breakdown": breakdown,
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
