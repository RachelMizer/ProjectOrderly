from django.shortcuts import get_object_or_404
from django.db.models import F, Prefetch

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from accounts.api.permissions import IsBusinessUser
from inventory.models import InventoryItem, VariantInventoryUsage
from .admin_serializers import AdminInventoryItemSerializer, LowStockInventorySerializer


class AdminInventoryListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessUser]

    def get(self, request):
        items = InventoryItem.objects.all().order_by("name")
        serializer = AdminInventoryItemSerializer(items, many=True)
        return Response({"results": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AdminInventoryItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return Response(
            AdminInventoryItemSerializer(item).data,
            status=status.HTTP_201_CREATED,
        )


class AdminInventoryDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessUser]

    def patch(self, request, itemId):
        item = get_object_or_404(InventoryItem, pk=itemId)
        serializer = AdminInventoryItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return Response(
            AdminInventoryItemSerializer(item).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, itemId):
        item = get_object_or_404(InventoryItem, pk=itemId)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class AdminLowStockView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessUser]

    def get(self, request):
        low_stock_items = (
            InventoryItem.objects.filter(
                reorder_level__isnull=False,
                stock_quantity__lte=F("reorder_level"),
            )
            .prefetch_related(
                Prefetch(
                    "variant_usages",
                    queryset=VariantInventoryUsage.objects.select_related(
                        "variant",
                        "variant__product",
                    ),
                )
            )
            .order_by("name")
        )

        serializer = LowStockInventorySerializer(low_stock_items, many=True)