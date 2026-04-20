from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from settings.models import StoreSettings
from settings.api.serializers import StoreSettingsSerializer
from accounts.api.permissions import IsBusinessUser


class StoreSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessUser]

    @staticmethod
    def get_object():
        settings_obj = StoreSettings.objects.first()
        if not settings_obj:
            settings_obj = StoreSettings.objects.create()
        return settings_obj

    def get(self, request):
        settings_obj = self.get_object()
        serializer = StoreSettingsSerializer(settings_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        settings_obj = self.get_object()
        serializer = StoreSettingsSerializer(
            settings_obj,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)