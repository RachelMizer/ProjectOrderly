from django.contrib.auth import get_user_model, password_validation, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers
from rest_framework_simplejwt.token_blacklist.models import (
    OutstandingToken,
    BlacklistedToken,
)

from accounts.models import UserRoleChoices, CustomerProfile, UserRole

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    """
    Validates and creates a new user account from email/password + first/last name (camelCase mapped to Django’s snake_case), enforcing unique email and Django password rules.
    On success it creates the User, assigns the default CUSTOMER role, and creates the CustomerProfile.

    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8, required=True)

    # API Contract and standard convention is camelcase, source= converts to snakecase for  python convention.
    firstName = serializers.CharField(source="first_name", required=True)
    lastName = serializers.CharField(source="last_name", required=True)

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Email is already registered.")
        return email

    def validate_password(self, value: str) -> str:
        try:
            password_validation.validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        first_name = validated_data["first_name"]
        last_name = validated_data["last_name"]

        # Default Django User needs username; use email as username
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        UserRole.objects.create(user=user, role_choice=UserRoleChoices.CUSTOMER)
        CustomerProfile.objects.create(user=user)

        return user


class LoginSerializer(serializers.Serializer):
    """
    Validates login credentials by autenticating the user with email+password and rejecting invallid credentials or disabled accounts.
    On success it returns the authenticated User.

    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attributes):
        email = attributes.get("email", "").strip().lower()
        password = attributes.get("password")

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Email or password is incorrect")

        if not user.is_active:
            raise serializers.ValidationError("This account has been disabled")

        attributes["user"] = user
        return attributes


class EmailVerificationRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def get_user(self):
        email = self.validated_data["email"]
        return User.objects.filter(email__iexact=email, is_active=True).first()


class EmailVerificationConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

    def validate(self, attributes):
        try:
            uid = force_str(urlsafe_base64_decode(attributes["uid"]))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError(
                {"error": "INVALID_TOKEN", "message": "Token is invalid or expired."}
            )

        if not default_token_generator.check_token(user, attributes["token"]):
            raise serializers.ValidationError(
                {"error": "INVALID_TOKEN", "message": "Token is invalid or expired."}
            )

        attributes["user"] = user
        return attributes

    def save(self):
        user = self.validated_data["user"]

        if hasattr(user, "customer_profile"):
            customer = user.customer_profile

            if not customer.email_verified:
                customer.email_verified = True
                customer.save(update_fields=["email_verified"])

        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Normalizes an email address and provides a helper method to retrieve the associated user for password reset.
    It's seaprated from the resend-verification to keep credential recovery logic distinct from account verfication.

    """

    email = serializers.EmailField()

    def validate_email(self, value):
        self._email = value.strip().lower()
        return self._email

    def get_user(self):
        email = self.validated_data["email"]
        return User.objects.filter(email__iexact=email, is_active=True).first()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Validates a reset uid+token and validtes the new password, ensuring it meets Django's password rules.
    On success it resets the user's password. Rejects invalid/expired tokens or invalid passwords.

    """

    uid = serializers.CharField()
    token = serializers.CharField()
    newPassword = serializers.CharField(
        source="new_password", write_only=True, min_length=8
    )

    def validate_new_password(self, value):
        try:
            password_validation.validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attributes):
        try:
            uid = force_str(urlsafe_base64_decode(attributes["uid"]))
            user = User.objects.get(pk=uid)
        except Exception:
            raise serializers.ValidationError({"detail": "Invalid reset link."})

        if not default_token_generator.check_token(user, attributes["token"]):
            raise serializers.ValidationError({"detail": "Invalid or expired token."})

        attributes["user"] = user
        return attributes

    def save(self, **kwargs):
        user = self.validated_data["user"]

        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])

        # blacklist oustanding refresh tokens
        tokens = OutstandingToken.objects.filter(user=user)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)

        return user
