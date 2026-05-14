from django.shortcuts import get_object_or_404

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from accounts.api.permissions import IsBusinessOrExecutive
from suppliers.models import Supplier
from catalog.api.admin_serializers import AdminSupplierSerializer


class AdminSupplierListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def get(self, request):
        suppliers = Supplier.objects.all().order_by("name")
        serializer = AdminSupplierSerializer(suppliers, many=True)
        return Response({"results": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AdminSupplierSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        supplier = serializer.save()
        return Response(
            AdminSupplierSerializer(supplier).data,
            status=status.HTTP_201_CREATED,
        )


class AdminSupplierDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def patch(self, request, supplierId):
        supplier = get_object_or_404(Supplier, pk=supplierId)
        serializer = AdminSupplierSerializer(supplier, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        supplier = serializer.save()
        return Response(
            AdminSupplierSerializer(supplier).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, supplierId):
        supplier = get_object_or_404(Supplier, pk=supplierId)
        supplier.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)