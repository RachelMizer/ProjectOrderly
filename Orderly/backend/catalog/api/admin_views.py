from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.api.permissions import IsBusinessUser
from catalog.models import Product, ProductVariant

from .admin_serializers import (
    AdminProductSerializer,
    AdminProductVariantSerializer,
    AdminVariantInventorySerializer,
)


class AdminProductListCreateView(APIView):
    """
    Business-only admin endpoint for listing and creating products.
    """

    permission_classes = [IsAuthenticated, IsBusinessUser]

    def get(self, request):
        products = Product.objects.select_related("category", "supplier").order_by("name")
        serializer = AdminProductSerializer(products, many=True)

        return Response(
            {
                "count": products.count(),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = AdminProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        return Response(
            AdminProductSerializer(product).data,
            status=status.HTTP_201_CREATED,
        )


class AdminProductDetailView(APIView):
    """
    Business-only admin endpoint for updating and deleting a product.
    """

    permission_classes = [IsAuthenticated, IsBusinessUser]

    def patch(self, request, productId):
        product = get_object_or_404(Product, pk=productId)
        serializer = AdminProductSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_product = serializer.save()

        return Response(
            AdminProductSerializer(updated_product).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, productId):
        product = get_object_or_404(Product, pk=productId)
        product.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminProductVariantListCreateView(APIView):
    """
    Business-only admin endpoint for listing variant inventory and
    creating variants for a product.
    """

    permission_classes = [IsAuthenticated, IsBusinessUser]

    def get(self, request, productId):
        product = get_object_or_404(Product, pk=productId)
        variants = product.variants.all().order_by("name")
        serializer = AdminVariantInventorySerializer(variants, many=True)

        return Response(
            {
                "count": variants.count(),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, productId):
        product = get_object_or_404(Product, pk=productId)
        serializer = AdminProductVariantSerializer(
            data=request.data,
            context={"product": product},
        )
        serializer.is_valid(raise_exception=True)
        variant = serializer.save()

        return Response(
            AdminProductVariantSerializer(variant).data,
            status=status.HTTP_201_CREATED,
        )


class AdminProductVariantDetailView(APIView):
    """
    Business-only admin endpoint for updating inventory on a specific variant
    that belongs to a specific product.
    """

    permission_classes = [IsAuthenticated, IsBusinessUser]

    def get_object(self, productId, variantId):
        return get_object_or_404(
            ProductVariant,
            pk=variantId,
            product_id=productId,
        )

    def patch(self, request, productId, variantId):
        variant = self.get_object(productId, variantId)
        serializer = AdminVariantInventorySerializer(
            variant,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        updated_variant = serializer.save()

        return Response(
            AdminVariantInventorySerializer(updated_variant).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, productId, variantId):
        variant = self.get_object(productId, variantId)
        variant.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)