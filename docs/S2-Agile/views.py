from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from .serializers import LoginSerializer


class LoginView(APIView):
    authentication_classes = []  # no auth required to log in
    permission_classes = []      # open endpoint

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)

        data = {
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": getattr(user, "email", ""),
            },
        }
        return Response(data, status=status.HTTP_200_OK)
