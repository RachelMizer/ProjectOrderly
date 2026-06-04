from datetime import date
import calendar

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from accounts.api.permissions import IsStoreManager
from accounts.models import UserRoleChoices
from schedule.models import StoreShift, ShiftAssignment
from .serializers import (
    StoreShiftSerializer,
    ShiftAssignmentSerializer,
    ShiftAssignmentCreateSerializer,
)

User = get_user_model()


def _manager_store(request):
    profile = getattr(request.user, "profile", None)
    if profile and profile.role == UserRoleChoices.STORE_MANAGER and profile.store_id:
        return profile.store
    return None


class ShiftListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsStoreManager]

    def get(self, request):
        store = _manager_store(request)
        if not store:
            return Response({"detail": "No store assigned."}, status=400)
        shifts = StoreShift.objects.filter(store=store)
        return Response(StoreShiftSerializer(shifts, many=True).data)

    def post(self, request):
        store = _manager_store(request)
        if not store:
            return Response({"detail": "No store assigned."}, status=400)
        serializer = StoreShiftSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        shift = serializer.save(
            store=store,
            start_time=serializer.validated_data["start_time"],
            end_time=serializer.validated_data["end_time"],
        )
        return Response(StoreShiftSerializer(shift).data, status=status.HTTP_201_CREATED)


class ShiftDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStoreManager]

    def patch(self, request, shift_id):
        store = _manager_store(request)
        if not store:
            return Response({"detail": "No store assigned."}, status=400)
        shift = get_object_or_404(StoreShift, pk=shift_id, store=store)
        serializer = StoreShiftSerializer(shift, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        shift = serializer.save()
        return Response(StoreShiftSerializer(shift).data)

    def delete(self, request, shift_id):
        store = _manager_store(request)
        if not store:
            return Response({"detail": "No store assigned."}, status=400)
        shift = get_object_or_404(StoreShift, pk=shift_id, store=store)
        shift.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ScheduleMonthView(APIView):
    permission_classes = [IsAuthenticated, IsStoreManager]

    def get(self, request):
        store = _manager_store(request)
        if not store:
            return Response({"detail": "No store assigned."}, status=400)

        today = date.today()
        try:
            year = int(request.query_params.get("year", today.year))
            month = int(request.query_params.get("month", today.month))
        except (ValueError, TypeError):
            return Response({"detail": "year and month must be integers."}, status=400)

        _, days_in_month = calendar.monthrange(year, month)
        start = date(year, month, 1)
        end = date(year, month, days_in_month)

        shifts = StoreShift.objects.filter(store=store)
        assignments = (
            ShiftAssignment.objects
            .filter(store=store, date__gte=start, date__lte=end)
            .select_related("employee", "shift")
            .order_by("date", "shift__sort_order", "shift__start_time")
        )

        return Response({
            "year": year,
            "month": month,
            "shifts": StoreShiftSerializer(shifts, many=True).data,
            "assignments": ShiftAssignmentSerializer(assignments, many=True).data,
        })


class ShiftAssignmentCreateView(APIView):
    permission_classes = [IsAuthenticated, IsStoreManager]

    def post(self, request):
        store = _manager_store(request)
        if not store:
            return Response({"detail": "No store assigned."}, status=400)

        serializer = ShiftAssignmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        shift = get_object_or_404(StoreShift, pk=serializer.validated_data["shift_id"], store=store)
        employee = get_object_or_404(User, pk=serializer.validated_data["employee_id"])

        # Verify the employee belongs to this store
        emp_profile = getattr(employee, "profile", None)
        if not emp_profile or emp_profile.store != store or emp_profile.role != UserRoleChoices.EMPLOYEE:
            return Response({"detail": "Employee not found at this store."}, status=400)

        assignment, created = ShiftAssignment.objects.get_or_create(
            store=store,
            employee=employee,
            date=serializer.validated_data["date"],
            shift=shift,
        )

        return Response(
            ShiftAssignmentSerializer(assignment).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ShiftAssignmentDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsStoreManager]

    def delete(self, request, assignment_id):
        store = _manager_store(request)
        if not store:
            return Response({"detail": "No store assigned."}, status=400)
        assignment = get_object_or_404(ShiftAssignment, pk=assignment_id, store=store)
        assignment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
