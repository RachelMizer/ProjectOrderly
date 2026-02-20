from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.conf import settings
from rest_framework.permissions import IsAuthenticated

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    RegisterSerializer,
    VerifyEmailSerializer,
    ResendVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    VerifiedTokenObtainPairSerializer,
)


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
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        send_verification_email(user)
        return Response(
            {"message": "Registration successful. Verification email sent."},
            status=status.HTTP_201_CREATED,
        )


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

        return Response({"message": "If an account exists, a verification email has been sent."})


class LoginView(TokenObtainPairView):
    serializer_class = VerifiedTokenObtainPairSerializer


class LogoutView(APIView):
    def post(self, request):
        # JWT is stateless; frontend clears tokens.
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetRequestView(APIView):
    def post(self, request):
        ser = PasswordResetRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.get_user()

        if user:
            send_password_reset_email(user)

        return Response({"message": "If an account exists, a password reset email has been sent."})


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

