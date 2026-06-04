from django.shortcuts import get_object_or_404

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from accounts.api.permissions import IsStoreManager, IsStoreManagerOrAbove
from accounts.models import UserRoleChoices
from payroll.models import PayPeriod
from .serializers import PayPeriodSerializer


def _manager_store(request):
    profile = getattr(request.user, "profile", None)
    if profile and profile.role == UserRoleChoices.STORE_MANAGER and profile.store_id:
        return profile.store
    return None


class PayPeriodListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsStoreManager]

    def get(self, request):
        store = _manager_store(request)
        if not store:
            return Response({"detail": "No store assigned."}, status=400)
        periods = PayPeriod.objects.filter(store=store)
        return Response(PayPeriodSerializer(periods, many=True).data)

    def post(self, request):
        store = _manager_store(request)
        if not store:
            return Response({"detail": "No store assigned."}, status=400)
        serializer = PayPeriodSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        period = serializer.save(
            store=store,
            created_by=request.user,
            start_date=serializer.validated_data["start_date"],
            end_date=serializer.validated_data["end_date"],
        )
        return Response(PayPeriodSerializer(period).data, status=status.HTTP_201_CREATED)


class PayPeriodDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStoreManager]

    def _get(self, request, pk):
        store = _manager_store(request)
        if not store:
            return None, Response({"detail": "No store assigned."}, status=400)
        period = get_object_or_404(PayPeriod, pk=pk, store=store)
        return period, None

    def get(self, request, pk):
        period, err = self._get(request, pk)
        if err:
            return err
        return Response(PayPeriodSerializer(period).data)

    def patch(self, request, pk):
        period, err = self._get(request, pk)
        if err:
            return err
        serializer = PayPeriodSerializer(period, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        period = serializer.save(
            **{k: v for k, v in [
                ("start_date", serializer.validated_data.get("start_date")),
                ("end_date", serializer.validated_data.get("end_date")),
            ] if v is not None}
        )
        return Response(PayPeriodSerializer(period).data)

    def delete(self, request, pk):
        period, err = self._get(request, pk)
        if err:
            return err
        period.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
