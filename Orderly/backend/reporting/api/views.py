from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response

from orders.models import Order, OrderItem
from accounts.api.permissions import IsBusinessUser

from .serializers import (
    SalesSummarySerializer,
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

        total_revenue = qs.aggregate(total=Sum("total_payment_due"))["total"] or 0
        total_orders = qs.count()
        avg_order = qs.aggregate(avg=Avg("total_payment_due"))["avg"] or 0

        trunc_map = {"day": TruncDay, "week": TruncWeek, "month": TruncMonth}
        trunc_func = trunc_map[group_by]

        breakdown_qs = (
            qs.annotate(period=trunc_func("order_date"))
            .values("period")
            .annotate(
                revenue=Sum("total_payment_due"),
                orders=Count("id"),
            )
            .order_by("period")
        )

        breakdown = []
        for item in breakdown_qs:
            if group_by == "month":
                period = item["period"].strftime("%Y-%m")
            else:
                period = str(item["period"].date())

            breakdown.append(
                {
                    "period": period,
                    "revenue": item["revenue"] or 0,
                    "orders": item["orders"] or 0,
                }
            )

        data = {
            "startDate": start_date,
            "endDate": end_date,
            "groupBy": group_by,
            "totalRevenue": total_revenue,
            "totalOrders": total_orders,
            "averageOrderValue": avg_order,
            "breakdown": breakdown,
        }

        return Response(SalesSummarySerializer(data).data)


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
                "variant__product__category__categoryName",
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
                    "categoryName": r["variant__product__category__categoryName"],
                    "quantitySold": r["quantitySold"] or 0,
                    "grossSales": r["grossSales"] or 0,
                }
                for r in results
            ],
        }

        return Response(CategorySalesListSerializer(data).data)
