from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import IsAuthenticated

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from django.contrib.auth import get_user_model
from accounts.api.permissions import IsSupportUser
from accounts.models import UserRoleChoices, DeletedAccount

from .serializers import (
    RegisterSerializer,
    AdminUserSerializer,
    CustomerAdminSerializer,
    DeletedAccountSerializer,
    EmailVerificationRequestSerializer,
    EmailVerificationConfirmSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    LoginSerializer,
    MeSerializer,
)

User = get_user_model()

access_expires = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
refresh_age = int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())


def send_verification_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verify_link = f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"

    email = EmailMessage(
        subject="Verify your email",
        body=f"Verify your email by clicking: {verify_link}",
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@orderly.local"),
        to=[user.email],
    )
    email.content_subtype = "plain"
    email.send()

    # For DEV/Testing purposes only:
    # Print the verification link in the console.
    # In production, this should be sent as an email to the user.
    if settings.DEBUG:
        print(f"\n[DEV] Email Verification Link: {verify_link}\n")


def send_password_reset_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

    email = EmailMessage(
        subject="Password reset",
        body=f"Reset your password using: {reset_link}",
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@orderly.local"),
        to=[user.email],
    )
    email.content_subtype = "plain"
    email.send()

    # For DEV/Testing purposes only:
    # Print the reset link in the console.
    # In production, this should be sent as an email to the user.
    if settings.DEBUG:
        print(f"\n[DEV] Password Reset Link: {reset_link}\n")


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
                    "role": getattr(getattr(user, "profile", None), "role", None),
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

        ur = getattr(user, "profile", None)
        if ur:
            ur.status = "ONLINE"
            ur.last_seen_at = timezone.now()
            ur.save(update_fields=["status", "last_seen_at"])

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
                    "role": getattr(getattr(user, "profile", None), "role", None),
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
            path="/api/v1/auth/",
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
        if request.user.is_authenticated:
            ur = getattr(request.user, "profile", None)
            if ur:
                ur.status = "OFFLINE"
                ur.last_seen_at = None
                ur.save(update_fields=["status", "last_seen_at"])

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


class EmailVerificationRequestView(APIView):
    def post(self, request):
        serializer = EmailVerificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.get_user()

        if user:
            try:
                send_verification_email(user)
            except Exception:
                pass

        return Response({"message": "If email exists, will send email verification"})


class EmailVerificationConfirmView(APIView):
    def post(self, request):
        serializer = EmailVerificationConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "email verified"})


class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.get_user()

        if user:
            try:
                send_password_reset_email(user)
            except Exception:
                pass

        return Response({"message": "If email exists, will send password reset."})


class PasswordResetConfirmView(APIView):
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Password has been reset successfully."})


class AdminUserListView(APIView):
    """
    GET  /api/v1/users/admin-accounts/?role=SUPPORT  — list users by role (default: all non-customer)
    POST /api/v1/users/admin-accounts/               — create a new account
    """
    permission_classes = [IsAuthenticated, IsSupportUser]

    def get(self, request):
        role_filter = request.query_params.get("role")
        if role_filter:
            users = User.objects.filter(profile__role=role_filter).order_by("first_name", "last_name", "username")
            if role_filter == UserRoleChoices.CUSTOMER:
                data = [CustomerAdminSerializer(u).data for u in users]
            else:
                data = [AdminUserSerializer(u).data for u in users]
        else:
            admin_roles = [UserRoleChoices.BUSINESS, UserRoleChoices.EXECUTIVE, UserRoleChoices.SUPPORT]
            users = User.objects.filter(profile__role__in=admin_roles).order_by("first_name", "last_name", "username")
            data = [AdminUserSerializer(u).data for u in users]
        return Response({"count": len(data), "results": data})

    def post(self, request):
        if not request.data.get("password", "").strip():
            return Response({"error": "VALIDATION_ERROR", "message": "Password is required."}, status=400)
        if request.data.get("role") == UserRoleChoices.CUSTOMER:
            serializer = CustomerAdminSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            return Response(CustomerAdminSerializer(user).data, status=201)
        serializer = AdminUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(AdminUserSerializer(user).data, status=201)


class AdminUserDetailView(APIView):
    """
    GET    /api/v1/users/admin-accounts/{id}/  — get account details
    PATCH  /api/v1/users/admin-accounts/{id}/  — update name, email, role, password, or contact info
    DELETE /api/v1/users/admin-accounts/{id}/  — hard-delete account
    """
    permission_classes = [IsAuthenticated, IsSupportUser]

    def _get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def _serializer_for(self, user, **kwargs):
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == UserRoleChoices.CUSTOMER:
            return CustomerAdminSerializer(user, **kwargs)
        return AdminUserSerializer(user, **kwargs)

    def get(self, request, user_id):
        user = self._get_user(user_id)
        if user is None:
            return Response({"error": "NOT_FOUND", "message": "User not found."}, status=404)
        return Response(self._serializer_for(user).data)

    def patch(self, request, user_id):
        user = self._get_user(user_id)
        if user is None:
            return Response({"error": "NOT_FOUND", "message": "User not found."}, status=404)
        if "isActive" in request.data:
            if user.pk == request.user.pk:
                return Response({"error": "FORBIDDEN", "message": "You cannot deactivate your own account."}, status=403)
            user.is_active = bool(request.data["isActive"])
            user.save()
            return Response(self._serializer_for(user).data)
        serializer = self._serializer_for(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(self._serializer_for(user).data)

    def delete(self, request, user_id):
        user = self._get_user(user_id)
        if user is None:
            return Response({"error": "NOT_FOUND", "message": "User not found."}, status=404)
        if user.pk == request.user.pk:
            return Response({"error": "FORBIDDEN", "message": "You cannot delete your own account."}, status=403)

        role = getattr(getattr(user, "profile", None), "role", "")
        deleter = request.user
        deleter_name = " ".join(filter(None, [deleter.first_name, deleter.last_name])) or deleter.email

        DeletedAccount.objects.create(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            role=role,
            deleted_by=deleter,
            deleted_by_name=deleter_name,
        )

        user.delete()
        return Response(status=204)


class DeletedAccountListView(APIView):
    """
    GET /api/v1/users/deleted-accounts/  — list all deleted account records
    """
    permission_classes = [IsAuthenticated, IsSupportUser]

    def get(self, request):
        records = DeletedAccount.objects.all()
        data = [DeletedAccountSerializer(r).data for r in records]
        return Response({"count": len(data), "results": data})


class MyStatusView(APIView):
    """
    GET  /api/v1/users/my-status/  — get own status
    PATCH /api/v1/users/my-status/ — update own status (ONLINE / BUSY / AWAY only)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, "profile", None)
        return Response({"status": getattr(profile, "status", "ONLINE")})

    def patch(self, request):
        new_status = (request.data.get("status") or "").upper()
        allowed = {"ONLINE", "BUSY", "AWAY"}
        if new_status not in allowed:
            return Response(
                {"error": "INVALID_STATUS", "message": f"Status must be one of: {', '.join(sorted(allowed))}"},
                status=400,
            )
        profile = getattr(request.user, "profile", None)
        if profile:
            profile.status = new_status
            profile.save(update_fields=["status"])
        return Response({"status": new_status})


HEARTBEAT_TIMEOUT = timedelta(minutes=5)


class HeartbeatView(APIView):
    """
    POST /api/v1/users/heartbeat/  — refresh last_seen_at for the authenticated user
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = getattr(request.user, "profile", None)
        if profile:
            profile.last_seen_at = timezone.now()
            profile.save(update_fields=["last_seen_at"])
        return Response({"ok": True})


class TeamStatusView(APIView):
    """
    GET /api/v1/users/team-status/  — list all active SUPPORT users with their status.
    A user is considered OFFLINE if their last heartbeat is older than HEARTBEAT_TIMEOUT.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cutoff = timezone.now() - HEARTBEAT_TIMEOUT
        users = (
            User.objects
            .filter(profile__role=UserRoleChoices.SUPPORT, is_active=True)
            .select_related("profile")
            .order_by("first_name", "last_name")
        )
        members = []
        for u in users:
            profile = getattr(u, "profile", None)
            name = " ".join(filter(None, [u.first_name, u.last_name])) or u.email
            last_seen = getattr(profile, "last_seen_at", None)
            if last_seen is None or last_seen < cutoff:
                effective_status = "OFFLINE"
            else:
                effective_status = getattr(profile, "status", "OFFLINE")
            members.append({
                "id": u.pk,
                "name": name,
                "status": effective_status,
            })
        return Response({"members": members})


class MeView(APIView):
    """
    GET /api/v1/users/me
    PATCH /api/v1/users/me

    Returns and updates the authenticated customer's profile.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        old_email = request.user.email

        serializer = MeSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if user.email != old_email:
            try:
                send_verification_email(user)
            except Exception:
                pass

        return Response(MeSerializer(user).data, status=status.HTTP_200_OK)
