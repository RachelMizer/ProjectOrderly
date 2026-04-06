from django.conf import settings
from django.db.models import Min
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny

from catalog.models import (
    Category,
    Product,
    ProductVariant,
    ModifierGroup,
    ModifierOption,
)

from .serializers import (
    ReadCategoriesSerializer,
    ReadProductSerializer,
    ReadVariantSerializer,
    ReadModifierGroupSerializer,
    CreateCategoriesSerializer,
    CreateProductsSerializer,
    CreateVariantsSerializer,
    CreateModifierGroupsSerializer,
    CreateModifierOptionsSerializer,
    UpdateCategoriesSerializer,
    UpdateProductsSerializer,
    UpdateVariantsSerializer,
    UpdateModifierGroupsSerializer,
    UpdateModifierOptionsSerializer,
)


def require_business_user(request):
    user = request.user

    if not user or not user.is_authenticated:
        raise PermissionDenied("missing or expired access token")

    if not hasattr(user, "profile") or user.profile.role != "BUSINESS":
        raise PermissionDenied("insufficient role")


###########
# READ View
###########


# Create and Read view due to same url pattern
class CategoriesView(APIView):

    # Override default auth & perm classes
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        categories = Category.objects.all()
        serializer = ReadCategoriesSerializer(categories, many=True)

        return Response({"results": serializer.data})

    def post(self, request):
        require_business_user(request)

        serializer = CreateCategoriesSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "error": "INVALID_DATA",
                    "message": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        category = serializer.save()

        return Response(
            {
                "message": f"category {category.name} created",
                "category": {
                    "id": category.id,
                    "name": category.name,
                    "imageUrl": None,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class ReadProductsView(APIView):

    # Override default auth & perm classes
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        category_id = request.query_params.get("categoryId")
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("pageSize", 50))

        products = Product.objects.annotate(
            minPrice=Min("variants__unit_price")
        ).order_by("name")

        if category_id is not None:
            products = products.filter(category_id=int(category_id))

        count = products.count()

        start = (page - 1) * page_size
        end = start + page_size

        products = products[start:end]

        serializer = ReadProductSerializer(products, many=True)

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


# Create and Read view due to same url pattern
class VariantsView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return super().get_permissions()

    def get(self, request, productId):

        product = get_object_or_404(Product, pk=productId)

        variants = list(
            ProductVariant.objects.filter(product_id=productId).order_by("name")
        )

        count = len(variants)

        serializer = ReadVariantSerializer(variants, many=True)

        return Response({"count": count, "results": serializer.data})

    def post(self, request, productId):
        require_business_user(request)

        serializer = CreateVariantsSerializer(
            data=request.data, context={"productId": productId}
        )

        if not serializer.is_valid():
            return Response(
                {
                    "error": "INVALID_DATA",
                    "message": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        variant = serializer.save()

        if ProductVariant.objects.filter(product_id=productId).count() > 1:
            Product.objects.filter(id=productId).update(has_variants=True)

        return Response(
            {
                "message": f"variant {variant.name} created",
                "variant": {
                    "id": variant.id,
                    "productId": productId,
                    "name": variant.name,
                    "SKU": variant.sku,
                    "unitPrice": variant.unit_price,
                    "stockQuantity": variant.stock_quantity,
                    "reorderLevel": variant.reorder_level,
                    "imageUrl": None,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class ReadModifiersView(APIView):

    # Override default auth & perm classes
    authentication_classes = []
    permission_classes = []

    def get(self, request, productId, variantId):
        product = get_object_or_404(Product, pk=productId)

        variant = get_object_or_404(ProductVariant, pk=variantId, product=product)

        # Currently only sorts groups, not options
        groups = list(
            ModifierGroup.objects.filter(variant=variant)
            .prefetch_related("options")
            .order_by("name")
        )

        serializer = ReadModifierGroupSerializer(groups, many=True)

        return Response({"count": len(groups), "groups": serializer.data})


#############
# Create View
#############


class CreateProductsView(APIView):
    pass


class CreateModifierGroupsView(APIView):
    pass


class CreateModifierOptionsView(APIView):
    pass


#############
# Update View
#############


class UpdateCategoriesView(APIView):
    pass


class UpdateProductsView(APIView):
    pass


class UpdateVariantsView(APIView):
    pass


class UpdateModifierGroupsView(APIView):
    pass


class UpdateModifierOptionsView(APIView):
    pass
