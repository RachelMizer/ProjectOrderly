from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.api.permissions import IsExecutiveUser, IsStoreManagerOrAbove
from accounts.models import UserRole, UserRoleChoices
from locations.models import Location, Region, StateProvince
from .serializers import LocationSerializer, RegionSerializer, StateProvinceSerializer

User = get_user_model()


class RegionListView(APIView):
    """
    GET  /api/v1/locations/regions/   — list all regions (any staff role)
    POST /api/v1/locations/regions/   — create a region (EXECUTIVE only)
    """

    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def get(self, request):
        regions = Region.objects.all()
        serializer = RegionSerializer(regions, many=True)
        return Response({"count": regions.count(), "results": serializer.data})

    def post(self, request):
        role = getattr(getattr(request.user, "profile", None), "role", None)
        if role != UserRoleChoices.EXECUTIVE:
            return Response({"error": "PERMISSION_DENIED", "message": "Only executives can create regions."}, status=403)

        serializer = RegionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "VALIDATION_ERROR", "details": serializer.errors}, status=400)
        serializer.save()
        return Response(serializer.data, status=201)


class RegionDetailView(APIView):
    """
    GET    /api/v1/locations/regions/{id}/          — any staff role
    PATCH  /api/v1/locations/regions/{id}/          — EXECUTIVE only
    DELETE /api/v1/locations/regions/{id}/          — EXECUTIVE only
    """

    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def _get_region(self, pk):
        try:
            return Region.objects.get(pk=pk)
        except Region.DoesNotExist:
            return None

    def get(self, request, pk):
        region = self._get_region(pk)
        if not region:
            return Response({"error": "NOT_FOUND"}, status=404)
        return Response(RegionSerializer(region).data)

    def patch(self, request, pk):
        role = getattr(getattr(request.user, "profile", None), "role", None)
        if role != UserRoleChoices.EXECUTIVE:
            return Response({"error": "PERMISSION_DENIED", "message": "Only executives can edit regions."}, status=403)

        region = self._get_region(pk)
        if not region:
            return Response({"error": "NOT_FOUND"}, status=404)

        serializer = RegionSerializer(region, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"error": "VALIDATION_ERROR", "details": serializer.errors}, status=400)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        role = getattr(getattr(request.user, "profile", None), "role", None)
        if role != UserRoleChoices.EXECUTIVE:
            return Response({"error": "PERMISSION_DENIED", "message": "Only executives can delete regions."}, status=403)

        region = self._get_region(pk)
        if not region:
            return Response({"error": "NOT_FOUND"}, status=404)
        region.delete()
        return Response(status=204)


class LocationListView(APIView):
    """
    GET  /api/v1/locations/   — list locations
        STORE_MANAGER with assigned store sees only their location.
        EXECUTIVE and SUPPORT see all.
    POST /api/v1/locations/   — create (EXECUTIVE only)
    """

    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def get(self, request):
        role = getattr(getattr(request.user, "profile", None), "role", None)
        store_fk = getattr(getattr(request.user, "profile", None), "store_id", None)

        if role == UserRoleChoices.STORE_MANAGER and store_fk is not None:
            qs = Location.objects.filter(pk=store_fk)
        else:
            qs = Location.objects.all()

        region_id = request.query_params.get("region")
        is_active = request.query_params.get("is_active")
        if region_id:
            qs = qs.filter(region_id=region_id)
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")

        serializer = LocationSerializer(qs, many=True)
        return Response({"count": qs.count(), "results": serializer.data})

    def post(self, request):
        role = getattr(getattr(request.user, "profile", None), "role", None)
        if role != UserRoleChoices.EXECUTIVE:
            return Response({"error": "PERMISSION_DENIED", "message": "Only executives can create locations."}, status=403)

        data = request.data.copy()
        assign_manager = data.pop("assignManager", None)

        serializer = LocationSerializer(data=data)
        if not serializer.is_valid():
            return Response({"error": "VALIDATION_ERROR", "details": serializer.errors}, status=400)
        location = serializer.save()

        if assign_manager:
            _assign_manager_to_location(assign_manager, location)

        return Response(LocationSerializer(location).data, status=201)


class LocationDetailView(APIView):
    """
    GET    /api/v1/locations/{id}/   — any staff role
    PATCH  /api/v1/locations/{id}/   — EXECUTIVE only
        Accepts optional assignManager (user_id) to assign a user to this location.
        Pass assignManager: null to unassign everyone from this location.
    DELETE /api/v1/locations/{id}/   — EXECUTIVE only
    """

    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def _get_location(self, pk):
        try:
            return Location.objects.get(pk=pk)
        except Location.DoesNotExist:
            return None

    def get(self, request, pk):
        location = self._get_location(pk)
        if not location:
            return Response({"error": "NOT_FOUND"}, status=404)
        return Response(LocationSerializer(location).data)

    def patch(self, request, pk):
        role = getattr(getattr(request.user, "profile", None), "role", None)
        if role != UserRoleChoices.EXECUTIVE:
            return Response({"error": "PERMISSION_DENIED", "message": "Only executives can edit locations."}, status=403)

        location = self._get_location(pk)
        if not location:
            return Response({"error": "NOT_FOUND"}, status=404)

        data = request.data.copy()
        assign_manager = data.pop("assignManager", None)

        serializer = LocationSerializer(location, data=data, partial=True)
        if not serializer.is_valid():
            return Response({"error": "VALIDATION_ERROR", "details": serializer.errors}, status=400)
        location = serializer.save()

        if "assignManager" in request.data:
            _assign_manager_to_location(assign_manager, location)

        return Response(LocationSerializer(location).data)

    def delete(self, request, pk):
        role = getattr(getattr(request.user, "profile", None), "role", None)
        if role != UserRoleChoices.EXECUTIVE:
            return Response({"error": "PERMISSION_DENIED", "message": "Only executives can delete locations."}, status=403)

        location = self._get_location(pk)
        if not location:
            return Response({"error": "NOT_FOUND"}, status=404)
        location.delete()
        return Response(status=204)


class StateProvinceListView(APIView):
    """
    GET  /api/v1/locations/states/           — list all states (any staff role); ?region= to filter
    POST /api/v1/locations/states/           — create (EXECUTIVE only)
    """

    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def get(self, request):
        qs = StateProvince.objects.select_related("region").all()
        region_id = request.query_params.get("region")
        if region_id:
            qs = qs.filter(region_id=region_id)
        serializer = StateProvinceSerializer(qs, many=True)
        return Response({"count": qs.count(), "results": serializer.data})

    def post(self, request):
        role = getattr(getattr(request.user, "profile", None), "role", None)
        if role != UserRoleChoices.EXECUTIVE:
            return Response({"error": "PERMISSION_DENIED", "message": "Only executives can create states/provinces."}, status=403)
        serializer = StateProvinceSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "VALIDATION_ERROR", "details": serializer.errors}, status=400)
        serializer.save()
        return Response(serializer.data, status=201)


class StateProvinceDetailView(APIView):
    """
    GET    /api/v1/locations/states/{id}/
    PATCH  /api/v1/locations/states/{id}/   — EXECUTIVE only
    DELETE /api/v1/locations/states/{id}/   — EXECUTIVE only
    """

    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def _get(self, pk):
        try:
            return StateProvince.objects.get(pk=pk)
        except StateProvince.DoesNotExist:
            return None

    def get(self, request, pk):
        obj = self._get(pk)
        if not obj:
            return Response({"error": "NOT_FOUND"}, status=404)
        return Response(StateProvinceSerializer(obj).data)

    def patch(self, request, pk):
        role = getattr(getattr(request.user, "profile", None), "role", None)
        if role != UserRoleChoices.EXECUTIVE:
            return Response({"error": "PERMISSION_DENIED"}, status=403)
        obj = self._get(pk)
        if not obj:
            return Response({"error": "NOT_FOUND"}, status=404)
        serializer = StateProvinceSerializer(obj, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"error": "VALIDATION_ERROR", "details": serializer.errors}, status=400)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        role = getattr(getattr(request.user, "profile", None), "role", None)
        if role != UserRoleChoices.EXECUTIVE:
            return Response({"error": "PERMISSION_DENIED"}, status=403)
        obj = self._get(pk)
        if not obj:
            return Response({"error": "NOT_FOUND"}, status=404)
        obj.delete()
        return Response(status=204)


def _assign_manager_to_location(user_id, location):
    """
    Set UserRole.store for the given user_id to location.
    Passing None clears the store assignment for all staff currently at this location.
    """
    if user_id is None:
        UserRole.objects.filter(store=location).update(store=None)
        return
    try:
        profile = UserRole.objects.get(user_id=user_id)
        profile.store = location
        profile.save(update_fields=["store"])
    except UserRole.DoesNotExist:
        pass
