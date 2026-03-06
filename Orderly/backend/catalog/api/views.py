from django.conf import settings

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
    CategoriesSerializer,
    ProductsSerializer,
    VariantsSerializer,
    ModifiersSerializer,
)


class CategoriesView(APIView):

    # Override default auth & perm classes
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategoriesSerializer(categories, many=True)

        return Response({"results": serializer.data})


class ProductsView(APIView):
    pass


class VariantsView(APIView):
    pass


class ModifiersView(APIView):
    pass
