from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.api.permissions import IsBusinessUser
from catalog.models import Product

from .admin_serializers import AdminProductSerializer


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