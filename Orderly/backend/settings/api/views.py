from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from settings.models import StoreSettings
from settings.api.serializers import StoreSettingsSerializer
from accounts.api.permissions import IsBusinessUser


class StoreSettingsView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated(), IsBusinessUser()]

    @staticmethod
    def get_object():
        settings_obj = StoreSettings.objects.first()
        if not settings_obj:
            settings_obj = StoreSettings.objects.create()
        return settings_obj

    def get(self, request):
        settings_obj = self.get_object()
        serializer = StoreSettingsSerializer(settings_obj, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        settings_obj = self.get_object()
        serializer = StoreSettingsSerializer(
            settings_obj,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)