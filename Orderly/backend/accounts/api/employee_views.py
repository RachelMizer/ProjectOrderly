from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, serializers as drf_serializers

from accounts.models import UserRole, UserRoleChoices
from accounts.api.permissions import IsStoreManagerOrAbove

User = get_user_model()


class EmployeeProfileSerializer(drf_serializers.ModelSerializer):
    firstName   = drf_serializers.CharField(source="user.first_name", read_only=True)
    lastName    = drf_serializers.CharField(source="user.last_name",  read_only=True)
    username    = drf_serializers.CharField(source="user.username",   read_only=True)
    email       = drf_serializers.CharField(source="user.email",      read_only=True)
    userId      = drf_serializers.IntegerField(source="user.id",      read_only=True)
    storeName   = drf_serializers.SerializerMethodField()
    storeNumber = drf_serializers.SerializerMethodField()
    dateJoined  = drf_serializers.DateTimeField(source="user.date_joined", read_only=True)

    class Meta:
        model = UserRole
        fields = [
            "userId", "firstName", "lastName", "username", "email",
            "role", "employee_id", "job_title", "pay_rate",
            "hire_date", "date_of_birth", "ssn_last4",
            "phone", "home_address", "city", "state",
            "storeName", "storeNumber", "dateJoined",
        ]
        read_only_fields = [f for f in fields if f != "job_title"]

    def get_storeName(self, obj):
        return str(obj.store) if obj.store else None

    def get_storeNumber(self, obj):
        return obj.store.location_number if obj.store else None


def _can_view_profile(requester_profile, target_role):
    """Return True if the requester may view target_role's profile."""
    role = requester_profile.role if requester_profile else None
    if role in (UserRoleChoices.EXECUTIVE, UserRoleChoices.SUPPORT):
        return True
    if role == UserRoleChoices.STORE_MANAGER:
        return target_role.store_id == requester_profile.store_id
    if role == UserRoleChoices.EMPLOYEE:
        return target_role.user_id == requester_profile.user_id
    return False


class MyEmployeeProfileView(APIView):
    """GET /api/v1/users/employee-profile/me/ — own profile for any staff role."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, "profile", None)
        if not profile:
            return Response({"detail": "No profile found."}, status=404)
        return Response(EmployeeProfileSerializer(profile).data)


class EmployeeProfileDetailView(APIView):
    """
    GET   /api/v1/users/employee-profile/<user_id>/
    PATCH /api/v1/users/employee-profile/<user_id>/  — job_title only (manager/exec)
    """
    permission_classes = [IsAuthenticated]

    def _get_target(self, request, user_id):
        target = get_object_or_404(UserRole, user_id=user_id)
        requester = getattr(request.user, "profile", None)
        if not _can_view_profile(requester, target):
            return None, Response({"detail": "Permission denied."}, status=403)
        return target, None

    def get(self, request, user_id):
        target, err = self._get_target(request, user_id)
        if err:
            return err
        return Response(EmployeeProfileSerializer(target).data)

    def patch(self, request, user_id):
        target, err = self._get_target(request, user_id)
        if err:
            return err
        requester = getattr(request.user, "profile", None)
        if requester and requester.role not in (UserRoleChoices.STORE_MANAGER, UserRoleChoices.EXECUTIVE):
            return Response({"detail": "Only managers and executives can edit job titles."}, status=403)
        job_title = request.data.get("job_title")
        if job_title is not None:
            target.job_title = str(job_title).strip()
            target.save(update_fields=["job_title"])
        return Response(EmployeeProfileSerializer(target).data)


class EmployeeListView(APIView):
    """
    GET /api/v1/users/employee-profiles/
    - EXECUTIVE/SUPPORT: all employees + managers
    - STORE_MANAGER: only their store's employees
    """
    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def get(self, request):
        profile = getattr(request.user, "profile", None)
        role = profile.role if profile else None

        if role == UserRoleChoices.STORE_MANAGER:
            if not profile.store_id:
                return Response({"results": []})
            qs = UserRole.objects.filter(
                store=profile.store,
                role__in=[UserRoleChoices.EMPLOYEE, UserRoleChoices.STORE_MANAGER],
            ).select_related("user", "store")
        else:
            qs = UserRole.objects.filter(
                role__in=[UserRoleChoices.EMPLOYEE, UserRoleChoices.STORE_MANAGER],
            ).select_related("user", "store").order_by("store__location_number", "user__last_name")

        search = request.query_params.get("search", "").strip().lower()
        store_id = request.query_params.get("store")
        if search:
            qs = [
                r for r in qs
                if search in r.user.get_full_name().lower()
                or search in r.user.username.lower()
                or search in (r.job_title or "").lower()
            ]
        if store_id:
            try:
                store_id = int(store_id)
                if not isinstance(qs, list):
                    qs = qs.filter(store_id=store_id)
            except ValueError:
                pass

        if not isinstance(qs, list):
            qs = list(qs)

        return Response({
            "count": len(qs),
            "results": EmployeeProfileSerializer(qs, many=True).data,
        })
