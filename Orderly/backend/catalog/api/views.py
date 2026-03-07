from django.conf import settings
from django.db.models import Min
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import (
    Category,
    Product,
    ProductVariant,
    ModifierGroup,
    ModifierOption,
)

from .serializers import (
    CategorieSerializer,
    ProductSerializer,
    VariantSerializer,
    ModifierGroupSerializer,
)


class CategoriesView(APIView):

    # Override default auth & perm classes
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorieSerializer(categories, many=True)

        return Response({"results": serializer.data})


class ProductsView(APIView):

    # Override default auth & perm classes
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        category_id = request.query_params.get("categoryId")
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("pageSize", 50))

        products = Product.objects.annotate(
            minPrice=Min("productvariant__unit_price")
        ).order_by("name")

        if category_id is not None:
            products = products.filter(category_id=int(category_id))

        count = products.count()

        start = (page - 1) * page_size
        end = start + page_size

        products = products[start:end]

        serializer = ProductSerializer(products, many=True)

        next_url = None
        previous_url = None

        query = f"pageSize={page_size}"

        if category_id:
            query += f"&categoryId={category_id}"

        if end < count:
            next_url = f"/api/v1/products?page={page+1}&{query}"

        if page > 1:
            previous_url = f"/api/v1/products?page={page-1}&{query}"

        return Response(
            {
                "count": count,
                "pageSize": page_size,
                "next": next_url,
                "previous": previous_url,
                "results": serializer.data,
            }
        )


class VariantsView(APIView):

    # Override default auth & perm classes
    authentication_classes = []
    permission_classes = []

    def get(self, request, productId):

        product = get_object_or_404(Product, pk=productId)

        variants = list(
            ProductVariant.objects.filter(product_id=productId).order_by("name")
        )

        count = len(variants)

        serializer = VariantSerializer(variants, many=True)

        return Response({"count": count, "results": serializer.data})


class ModifiersView(APIView):

    # Override default auth & perm classes
    authentication_classes = []
    permission_classes = []

    def get(self, request, productId, variantId):
        product = get_object_or_404(Product, pk=productId)

        variant = get_object_or_404(ProductVariant, pk=variantId, product=product)

        groups = list(
            ModifierGroup.objects.filter(variant=variant)
            .prefetch_related("options")
            .order_by("name")
        )

        serializer = ModifierGroupSerializer(groups, many=True)

        return Response({"count": len(groups), "groups": serializer.data})
