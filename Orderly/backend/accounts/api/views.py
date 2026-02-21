from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.conf import settings
from rest_framework.permissions import IsAuthenticated

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    RegisterSerializer,
    VerifyEmailSerializer,
    ResendVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    LoginSerializer,
)

access_expires = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
refresh_age = int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())


def send_verification_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verify_link = f"http://localhost:3000/verify-email?uid={uid}&token={token}"

    send_mail(
        subject="Verify your email",
        message=f"Verify your email by clicking: {verify_link}",
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@orderly.local"),
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_password_reset_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_link = f"http://localhost:3000/reset-password?uid={uid}&token={token}"

    send_mail(
        subject="Password reset",
        message=f"Reset your password using: {reset_link}",
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@orderly.local"),
        recipient_list=[user.email],
        fail_silently=False,
    )


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response(
            {
                "accessToken": access_token,
                "expiresIn": access_expires,
                "tokenType": "Bearer",
                "customer": {
                    "id": user.pk,
                    "email": user.email,
                    "role": user.role.role_choice,
                },
            },
            status=status.HTTP_201_CREATED,
        )

        # set refresh token as http cookie
        response.set_cookie(
            key="refreshToken",
            value=str(refresh),
            httponly=True,
            secure=False,  # sets send over https only to false for development
            samesite="Lax",
            path="/api/v1/auth/",
            max_age=refresh_age,
        )

        return response


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response(
            {
                "accessToken": access_token,
                "expiresIn": access_expires,
                "tokenType": "Bearer",
                "customer": {
                    "id": user.pk,
                    "email": user.email,
                    "role": user.role.role_choice,
                },
            },
            status=status.HTTP_200_OK,
        )

        response.set_cookie(
            key="refreshToken",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/api/v1/auth",
            max_age=refresh_age,
        )

        return response


class RefreshView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refreshToken")

        if not refresh_token:
            return Response(
                {
                    "error": "INVALID_REFRESH_TOKEN",
                    "message": "Refresh token is invalid or expired",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            return Response(
                {
                    "accessToken": access_token,
                    "expiresIn": access_expires,
                    "tokenType": "Bearer",
                },
                status=status.HTTP_200_OK,
            )

        except TokenError:
            return Response(
                {
                    "error": "INVALID_REFRESH_TOKEN",
                    "message": "Refresh token is invalid or expired",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refreshToken")

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass  # Token already invalid.

        response = Response(
            {"message": "Successfully logged out"},
            status=status.HTTP_200_OK,
        )

        response.delete_cookie(key="refreshToken", path="/api/v1/auth/", samesite="Lax")

        return response


class VerifyEmailView(APIView):
    def post(self, request):
        ser = VerifyEmailSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response({"message": "Email verified successfully."})


class ResendVerificationView(APIView):
    def post(self, request):
        ser = ResendVerificationSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.get_user()

        # avoid enumeration: always return same message
        if user and not user.is_active:
            send_verification_email(user)

        return Response(
            {"message": "If an account exists, a verification email has been sent."}
        )


class PasswordResetRequestView(APIView):
    def post(self, request):
        ser = PasswordResetRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.get_user()

        if user:
            send_password_reset_email(user)

        return Response(
            {"message": "If an account exists, a password reset email has been sent."}
        )


class PasswordResetConfirmView(APIView):
    def post(self, request):
        ser = PasswordResetConfirmSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response({"message": "Password has been reset successfully."})


class MeView(APIView):
    """
    Returns authenticated user's basic profile information.
    Used by frontend to determine user identity and role.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, "profile", None)
        role = getattr(profile, "role", None)
        return Response(
            {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "role": role,
            }
        )
