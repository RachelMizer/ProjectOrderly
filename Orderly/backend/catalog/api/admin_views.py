from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.api.permissions import IsBusinessUser
from catalog.models import Category, ModifierGroup, ModifierOption, Product, ProductVariant

from .admin_serializers import (
    AdminCategorySerializer,
    AdminModifierGroupSerializer,
    AdminModifierOptionSerializer,
    AdminProductSerializer,
    AdminProductVariantSerializer,
    AdminVariantFlatSerializer,
    AdminVariantInventorySerializer,
)


class AdminCategoryListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessUser]

    def get(self, request):
        categories = Category.objects.all()
        serializer = AdminCategorySerializer(categories, many=True)
        return Response({"results": serializer.data})

    def post(self, request):
        serializer = AdminCategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminCategoryDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessUser]

    def patch(self, request, categoryId):
        category = get_object_or_404(Category, pk=categoryId)
        serializer = AdminCategorySerializer(category, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, categoryId):
        category = get_object_or_404(Category, pk=categoryId)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminProductListCreateView(APIView):
    """
    Business-only admin endpoint for listing and creating products.
    """

    permission_classes = [IsAuthenticated, IsBusinessUser]

    def get(self, request):
        products = Product.objects.select_related("category", "supplier").order_by("name")
        serializer = AdminProductSerializer(products, many=True, context={"request": request})

        return Response(
            {
                "count": products.count(),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = AdminProductSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        return Response(
            AdminProductSerializer(product, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class AdminProductDetailView(APIView):
    """
    Business-only admin endpoint for updating and deleting a product.
    """

    permission_classes = [IsAuthenticated, IsBusinessUser]

    def get(self, request, productId):
        product = get_object_or_404(Product, pk=productId)
        serializer = AdminProductSerializer(product, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, productId):
        product = get_object_or_404(Product, pk=productId)
        serializer = AdminProductSerializer(product, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated_product = serializer.save()

        return Response(
            AdminProductSerializer(updated_product, context={"request": request}).data,
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
        serializer = AdminProductVariantSerializer(variants, many=True)

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
    Business-only admin endpoint for updating and deleting a specific variant
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
        serializer = AdminProductVariantSerializer(
            variant,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        updated_variant = serializer.save()

        return Response(
            AdminProductVariantSerializer(updated_variant).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, productId, variantId):
        variant = self.get_object(productId, variantId)
        variant.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminVariantListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessUser]

    def get(self, request):
        variants = ProductVariant.objects.select_related("product").order_by("product__name", "name")
        serializer = AdminVariantFlatSerializer(variants, many=True)
        return Response({"count": variants.count(), "results": serializer.data})

    def post(self, request):
        serializer = AdminVariantFlatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        variant = serializer.save()
        variant = ProductVariant.objects.select_related("product").get(pk=variant.pk)
        return Response(AdminVariantFlatSerializer(variant).data, status=status.HTTP_201_CREATED)


class AdminVariantDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessUser]

    def patch(self, request, variantId):
        variant = get_object_or_404(ProductVariant, pk=variantId)
        serializer = AdminVariantFlatSerializer(variant, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        updated = ProductVariant.objects.select_related("product").get(pk=variantId)
        return Response(AdminVariantFlatSerializer(updated).data)

    def delete(self, request, variantId):
        variant = get_object_or_404(ProductVariant, pk=variantId)
        variant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminModifierGroupListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessUser]

    def get(self, request):
        groups = (
            ModifierGroup.objects
            .select_related("variant__product")
            .prefetch_related("options")
            .order_by("variant__product__name", "variant__name", "name")
        )
        serializer = AdminModifierGroupSerializer(groups, many=True)
        return Response({"count": groups.count(), "results": serializer.data})

    def post(self, request):
        serializer = AdminModifierGroupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        group = (
            ModifierGroup.objects
            .select_related("variant__product")
            .prefetch_related("options")
            .get(pk=group.pk)
        )
        return Response(AdminModifierGroupSerializer(group).data, status=status.HTTP_201_CREATED)


class AdminModifierGroupDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessUser]

    def patch(self, request, groupId):
        group = get_object_or_404(ModifierGroup, pk=groupId)
        serializer = AdminModifierGroupSerializer(group, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        updated = (
            ModifierGroup.objects
            .select_related("variant__product")
            .prefetch_related("options")
            .get(pk=groupId)
        )
        return Response(AdminModifierGroupSerializer(updated).data)

    def delete(self, request, groupId):
        group = get_object_or_404(ModifierGroup, pk=groupId)
        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminModifierOptionListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessUser]

    def post(self, request, groupId):
        group = get_object_or_404(ModifierGroup, pk=groupId)
        serializer = AdminModifierOptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        option = serializer.save(group=group)
        return Response(AdminModifierOptionSerializer(option).data, status=status.HTTP_201_CREATED)


class AdminModifierOptionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessUser]

    def patch(self, request, groupId, optionId):
        option = get_object_or_404(ModifierOption, pk=optionId, group_id=groupId)
        serializer = AdminModifierOptionSerializer(option, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(AdminModifierOptionSerializer(updated).data)

    def delete(self, request, groupId, optionId):
        option = get_object_or_404(ModifierOption, pk=optionId, group_id=groupId)
        option.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)