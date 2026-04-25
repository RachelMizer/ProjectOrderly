import csv
from django.http import HttpResponse
from rest_framework.views import APIView

from accounts.api.permissions import IsBusinessUser
from catalog.models import ProductVariant
from inventory.models import InventoryItem
from orders.models import Order


class ExportOrdersView(APIView):
    permission_classes = [IsBusinessUser]

    def get(self, request):
        start_date = request.GET.get("startDate")
        end_date = request.GET.get("endDate")

        qs = Order.objects.exclude(status="DRAFT").order_by("-order_date")
        if start_date:
            qs = qs.filter(order_date__date__gte=start_date)
        if end_date:
            qs = qs.filter(order_date__date__lte=end_date)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="orders.csv"'

        writer = csv.writer(response)
        writer.writerow(["Order ID", "Date", "Customer", "Status", "Subtotal", "Tax", "Total", "Payment Type"])

        for order in qs.select_related("customer__user").prefetch_related("payments"):
            payment = order.payments.first()
            if order.customer:
                u = order.customer.user
                customer_name = f"{u.first_name} {u.last_name}".strip() or u.username
            else:
                customer_name = order.guest_email or ""

            writer.writerow([
                order.id,
                order.order_date.strftime("%Y-%m-%d %H:%M"),
                customer_name,
                order.status,
                order.subtotal,
                order.tax_amount,
                order.total_payment_due,
                payment.payment_type if payment else "",
            ])

        return response


class ExportInventoryView(APIView):
    permission_classes = [IsBusinessUser]

    def get(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="inventory.csv"'

        writer = csv.writer(response)
        writer.writerow(["Item Name", "Unit", "Stock Quantity", "Reorder Level", "Status"])

        for item in InventoryItem.objects.all().order_by("name"):
            reorder = item.reorder_level
            qty = item.stock_quantity
            if qty == 0:
                status = "Out of Stock"
            elif reorder is not None and qty <= reorder:
                status = "Low Stock"
            else:
                status = "In Stock"
            writer.writerow([item.name, item.unit_of_measure, qty, reorder if reorder is not None else "", status])

        return response


class ExportProductsView(APIView):
    permission_classes = [IsBusinessUser]

    def get(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="products.csv"'

        writer = csv.writer(response)
        writer.writerow(["Product", "Category", "Variant", "SKU", "Price", "Stock", "Reorder Level"])

        qs = ProductVariant.objects.select_related(
            "product", "product__category"
        ).order_by("product__name", "name")

        for variant in qs:
            writer.writerow([
                variant.product.name,
                variant.product.category.name if variant.product.category else "",
                variant.name,
                variant.sku,
                variant.unit_price,
                variant.stock_quantity if variant.stock_quantity is not None else "",
                variant.reorder_level if variant.reorder_level is not None else "",
            ])

        return response
