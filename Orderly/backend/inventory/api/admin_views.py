from django.shortcuts import get_object_or_404
from django.db.models import F, Q

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from accounts.api.permissions import IsStoreManagerOrAbove
from accounts.models import UserRoleChoices
from inventory.models import InventoryItem, StoreInventoryLevel
from catalog.models import ProductVariant
from .admin_serializers import (
    AdminInventoryItemSerializer,
    StoreInventoryLevelSerializer,
    LowStockInventorySerializer,
    LowStockInventoryLevelSerializer,
    LowStockVariantSerializer,
)


def _is_store_manager(request):
    profile = getattr(request.user, "profile", None)
    return (
        profile is not None
        and profile.role == UserRoleChoices.STORE_MANAGER
        and profile.store_id is not None
    )


class AdminInventoryListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def get(self, request):
        if _is_store_manager(request):
            store = request.user.profile.store
            levels = (
                StoreInventoryLevel.objects
                .filter(store=store)
                .select_related("inventory_item__supplier")
                .order_by("inventory_item__name")
            )
            serializer = StoreInventoryLevelSerializer(levels, many=True)
        else:
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
    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def get(self, request, itemId):
        if _is_store_manager(request):
            level = get_object_or_404(
                StoreInventoryLevel,
                pk=itemId,
                store=request.user.profile.store,
            )
            return Response(StoreInventoryLevelSerializer(level).data, status=status.HTTP_200_OK)
        item = get_object_or_404(InventoryItem, pk=itemId)
        return Response(AdminInventoryItemSerializer(item).data, status=status.HTTP_200_OK)

    def patch(self, request, itemId):
        if _is_store_manager(request):
            level = get_object_or_404(
                StoreInventoryLevel,
                pk=itemId,
                store=request.user.profile.store,
            )
            serializer = StoreInventoryLevelSerializer(level, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            level = serializer.save()
            return Response(StoreInventoryLevelSerializer(level).data, status=status.HTTP_200_OK)
        item = get_object_or_404(InventoryItem, pk=itemId)
        serializer = AdminInventoryItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return Response(AdminInventoryItemSerializer(item).data, status=status.HTTP_200_OK)

    def delete(self, request, itemId):
        item = get_object_or_404(InventoryItem, pk=itemId)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminLowStockView(APIView):
    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def get(self, request):
        low_stock_variants = ProductVariant.objects.filter(
            stock_quantity__isnull=False,
            reorder_level__isnull=False,
            stock_quantity__lte=F("reorder_level"),
        ).order_by("product__name", "name")

        if _is_store_manager(request):
            store = request.user.profile.store
            low_stock_items = (
                StoreInventoryLevel.objects
                .filter(store=store)
                .filter(
                    Q(stock_quantity=0) |
                    Q(
                        stock_quantity__isnull=False,
                        reorder_level__isnull=False,
                        stock_quantity__lte=F("reorder_level"),
                    )
                )
                .select_related("inventory_item__supplier")
                .order_by("inventory_item__name")
            )
            inventory_data = LowStockInventoryLevelSerializer(low_stock_items, many=True).data
        else:
            low_stock_items = InventoryItem.objects.select_related("supplier").filter(
                Q(stock_quantity=0) |
                Q(
                    stock_quantity__isnull=False,
                    reorder_level__isnull=False,
                    stock_quantity__lte=F("reorder_level"),
                )
            ).distinct().order_by("name")
            inventory_data = LowStockInventorySerializer(low_stock_items, many=True).data

        return Response(
            {
                "productVariants": LowStockVariantSerializer(low_stock_variants, many=True).data,
                "inventoryItems": inventory_data,
            },
            status=status.HTTP_200_OK,
        )