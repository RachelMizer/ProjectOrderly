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
        user = self.instance # Prevents possible NoneType issue
        
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

        UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER) # Changed to match API contract and default role assignment
        CustomerProfile.objects.create(user=user)

        return user


class LoginSerializer(serializers.Serializer):
    """
    Validates login credentials by autenticating the user with email+password and rejecting invallid credentials or disabled accounts.
    On success it returns the authenticated User, assigns the default CUSTOMER role, and creates the CustomerProfile.

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
    
class MeSerializer(serializers.Serializer):
    firstName = serializers.CharField(source="first_name", required=False)
    lastName = serializers.CharField(source="last_name", required=False)
    email = serializers.EmailField(required=False)
    streetAddress = serializers.CharField(
        source="customer_profile.street_address",
        required=False,
        allow_blank=True,
    )
    city = serializers.CharField(
        source="customer_profile.city",
        required=False,
        allow_blank=True,
    )
    state = serializers.CharField(
        source="customer_profile.state",
        required=False,
        allow_blank=True,
    )
    zipcode = serializers.CharField(
        source="customer_profile.zipcode",
        required=False,
        allow_blank=True,
    )
    phone = serializers.CharField(
        source="customer_profile.phone",
        required=False,
        allow_blank=True,
    )

    def validate_email(self, value):
        email = value.strip().lower()
        user = self.instance
        if User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Email is already registered.")
        return email

    def validate_state(self, value):
        value = value.strip().upper()

        if value == "":
            return value

        if len(value) != 2 or not value.isalpha():
            raise serializers.ValidationError(
                "State must be a 2-letter uppercase code (e.g., NC)."
            )

        return value

    def validate_zipcode(self, value):
        value = value.strip()

        if value == "":
            return value

        import re
        if not re.fullmatch(r"\d{5}(-\d{4})?", value):
            raise serializers.ValidationError(
                "Enter a valid ZIP code (e.g., 12345 or 12345-6789)."
            )

        return value

    def validate_phone(self, value):
        value = value.strip()

        if value == "":
            return value

        import re
        if not re.fullmatch(r"^\+?1?\d{10,15}$", value):
            raise serializers.ValidationError(
                "Enter a valid phone number (10–15 digits, optional +country code)."
            )

        return value
    
    # Adding better validation for state, zipcode, and phone to ensure data integrity and provide clearer error messages for users.
    def to_representation(self, user):
        profile = getattr(user, "customer_profile", None)

        return {
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email,
            "streetAddress": profile.street_address if profile else "",
            "city": profile.city if profile else "",
            "state": profile.state if profile else "",
            "zipcode": profile.zipcode if profile else "",
            "phone": profile.phone if profile else "",
        }

    def update(self, user, validated_data):
        profile_data = validated_data.pop("customer_profile", {})

        if "first_name" in validated_data:
            user.first_name = validated_data["first_name"]

        if "last_name" in validated_data:
            user.last_name = validated_data["last_name"]

        if "email" in validated_data:
            new_email = validated_data["email"]
            if new_email != user.email:
                user.email = new_email
                user.username = new_email
                user.customer_profile.email_verified = False

        user.save()

        profile = user.customer_profile

        if "street_address" in profile_data:
            profile.street_address = profile_data["street_address"]

        if "city" in profile_data:
            profile.city = profile_data["city"]

        if "state" in profile_data:
            profile.state = profile_data["state"]

        if "zipcode" in profile_data:
            profile.zipcode = profile_data["zipcode"]

        if "phone" in profile_data:
            profile.phone = profile_data["phone"]

        try:
            profile.save()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)

        return user