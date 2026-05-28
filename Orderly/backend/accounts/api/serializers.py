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

from accounts.models import UserRoleChoices, CustomerProfile, UserRole, DeletedAccount

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
    Validates login credentials by authenticating the user with email+password and rejecting invalid credentials or disabled accounts.
    On success it returns the authenticated User, assigns the default CUSTOMER role, and creates the CustomerProfile.

    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attributes):
        email = attributes.get("email", "").strip().lower()
        password = attributes.get("password")

        try:
            user_obj = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Email or password is incorrect")

        user = authenticate(username=user_obj.username, password=password)

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

    def validate_newPassword(self, value):
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
    
ADMIN_ROLE_CHOICES = [
    (UserRoleChoices.STORE_MANAGER, "Store Manager"),
    (UserRoleChoices.EMPLOYEE, "Employee"),
    (UserRoleChoices.EXECUTIVE, "Executive"),
    (UserRoleChoices.SUPPORT, "Support"),
]


class AdminUserSerializer(serializers.Serializer):
    firstName = serializers.CharField(source="first_name")
    lastName  = serializers.CharField(source="last_name")
    email     = serializers.EmailField()
    role      = serializers.ChoiceField(choices=ADMIN_ROLE_CHOICES)
    password  = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=8)
    city      = serializers.CharField(required=False, allow_blank=True, default="")
    state     = serializers.CharField(required=False, allow_blank=True, default="")
    storeId   = serializers.IntegerField(required=False, allow_null=True)

    def validate_email(self, value):
        email = value.strip().lower()
        qs = User.objects.filter(email__iexact=email)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Email is already registered.")
        return email

    def validate_password(self, value):
        if value:
            try:
                password_validation.validate_password(value)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value

    def to_representation(self, user):
        profile = getattr(user, "profile", None)
        role = getattr(profile, "role", None)
        pw_changed = getattr(profile, "password_changed_at", None)
        store = getattr(profile, "store", None)
        return {
            "id": user.pk,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email,
            "role": role,
            "isActive": user.is_active,
            "passwordChangedAt": pw_changed.isoformat() if pw_changed else None,
            "dateJoined": user.date_joined.isoformat() if user.date_joined else None,
            "city":  getattr(profile, "city",  "") or "",
            "state": getattr(profile, "state", "") or "",
            "store": store.pk if store else None,
            "storeName": str(store) if store else None,
        }

    def create(self, validated_data):
        role = validated_data["role"]
        password = validated_data["password"]
        email = validated_data["email"]
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        UserRole.objects.create(user=user, role=role, password_changed_at=timezone.now())
        return user

    def update(self, user, validated_data):
        from locations.models import Location

        role = validated_data.pop("role", None)
        password = validated_data.pop("password", None)
        store_id = validated_data.pop("storeId", "MISSING")

        if "first_name" in validated_data:
            user.first_name = validated_data["first_name"]
        if "last_name" in validated_data:
            user.last_name = validated_data["last_name"]
        if "email" in validated_data:
            new_email = validated_data["email"]
            user.email = new_email
            user.username = new_email
        if password:
            user.set_password(password)
        user.save()

        profile = getattr(user, "profile", None)
        if profile:
            if role:
                profile.role = role
            if password:
                profile.password_changed_at = timezone.now()
            if "city" in validated_data:
                profile.city = validated_data["city"]
            if "state" in validated_data:
                profile.state = validated_data["state"].strip().upper()
            if store_id != "MISSING":
                if store_id is None:
                    profile.store = None
                else:
                    try:
                        profile.store = Location.objects.get(pk=store_id)
                    except Location.DoesNotExist:
                        pass
            profile_dirty = role or password or "city" in validated_data or "state" in validated_data or store_id != "MISSING"
            if profile_dirty:
                profile.save()
        elif role:
            UserRole.objects.create(user=user, role=role, password_changed_at=timezone.now() if password else None)

        return user


class CustomerAdminSerializer(serializers.Serializer):
    firstName     = serializers.CharField(source="first_name")
    lastName      = serializers.CharField(source="last_name")
    email         = serializers.EmailField()
    password      = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=8)
    phone         = serializers.CharField(required=False, allow_blank=True, default="")
    streetAddress = serializers.CharField(required=False, allow_blank=True, default="")
    city          = serializers.CharField(required=False, allow_blank=True, default="")
    state         = serializers.CharField(required=False, allow_blank=True, default="")
    zipcode       = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_email(self, value):
        email = value.strip().lower()
        qs = User.objects.filter(email__iexact=email)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Email is already registered.")
        return email

    def validate_password(self, value):
        if value:
            try:
                password_validation.validate_password(value)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value

    def validate_state(self, value):
        value = value.strip().upper()
        if value and (len(value) != 2 or not value.isalpha()):
            raise serializers.ValidationError("State must be a 2-letter code (e.g., NC).")
        return value

    def validate_zipcode(self, value):
        import re
        value = value.strip()
        if value and not re.fullmatch(r"\d{5}(-\d{4})?", value):
            raise serializers.ValidationError("Enter a valid ZIP code (e.g., 12345 or 12345-6789).")
        return value

    def validate_phone(self, value):
        import re
        value = value.strip()
        if not value:
            return value
        normalized = re.sub(r"[^\d+]", "", value)
        if not re.fullmatch(r"\+?1?\d{10,15}", normalized):
            raise serializers.ValidationError("Enter a valid phone number (10–15 digits).")
        return normalized

    def to_representation(self, user):
        cp = getattr(user, "customer_profile", None)
        ur = getattr(user, "profile", None)
        pw_changed = getattr(ur, "password_changed_at", None)
        return {
            "id": user.pk,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email,
            "role": "CUSTOMER",
            "isActive": user.is_active,
            "passwordChangedAt": pw_changed.isoformat() if pw_changed else None,
            "dateJoined": user.date_joined.isoformat() if user.date_joined else None,
            "phone": cp.phone if cp else "",
            "streetAddress": cp.street_address if cp else "",
            "city": cp.city if cp else "",
            "state": cp.state if cp else "",
            "zipcode": cp.zipcode if cp else "",
            "emailVerified": cp.email_verified if cp else False,
        }

    def create(self, validated_data):
        email    = validated_data["email"]
        password = validated_data["password"]
        user = User.objects.create_user(
            username=email, email=email, password=password,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER, password_changed_at=timezone.now())
        CustomerProfile.objects.create(user=user)
        profile_updates = {}
        for key, db_col in [("phone","phone"),("city","city"),("state","state"),
                             ("zipcode","zipcode"),("streetAddress","street_address")]:
            val = validated_data.get(key, "")
            if val:
                profile_updates[db_col] = val
        if profile_updates:
            CustomerProfile.objects.filter(user=user).update(**profile_updates)
        return user

    def update(self, user, validated_data):
        password = validated_data.pop("password", None)
        if "first_name" in validated_data:
            user.first_name = validated_data["first_name"]
        if "last_name" in validated_data:
            user.last_name = validated_data["last_name"]
        if "email" in validated_data:
            new_email = validated_data["email"]
            user.email = new_email
            user.username = new_email
        if password:
            user.set_password(password)
        user.save()

        ur = getattr(user, "profile", None)
        if ur and password:
            ur.password_changed_at = timezone.now()
            ur.save()

        profile_updates = {}
        for key, db_col in [("phone","phone"),("city","city"),("state","state"),
                             ("zipcode","zipcode"),("streetAddress","street_address")]:
            if key in validated_data:
                profile_updates[db_col] = validated_data[key]
        if profile_updates:
            CustomerProfile.objects.filter(user=user).update(**profile_updates)
        return user


class DeletedAccountSerializer(serializers.ModelSerializer):
    firstName     = serializers.CharField(source="first_name")
    lastName      = serializers.CharField(source="last_name")
    deletedAt     = serializers.DateTimeField(source="deleted_at")
    deletedByName = serializers.CharField(source="deleted_by_name")

    class Meta:
        model  = DeletedAccount
        fields = ["id", "firstName", "lastName", "email", "role", "deletedAt", "deletedByName"]


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
        normalized = re.sub(r"[\s\-(). ]+", "", value)
        if not re.fullmatch(r"\+?1?\d{10,15}$", normalized):
            raise serializers.ValidationError(
                "Enter a valid phone number (10–15 digits, optional +country code)."
            )

        return normalized
    
    # Adding better validation for state, zipcode, and phone to ensure data integrity and provide clearer error messages for users.
    def to_representation(self, user):
        user_role = getattr(getattr(user, "profile", None), "role", None)
        is_customer = user_role == UserRoleChoices.CUSTOMER
        profile = getattr(user, "customer_profile", None) if is_customer else None

        user_profile = getattr(user, "profile", None)
        store = getattr(user_profile, "store", None)

        data = {
            "id": user.pk,
            "username": user.username,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email,
            "role": user_role,
            "store": store.pk if store else None,
            "storeName": str(store) if store else None,
        }

        if is_customer:
            data.update({
                "streetAddress": profile.street_address if profile else "",
                "city": profile.city if profile else "",
                "state": profile.state if profile else "",
                "zipcode": profile.zipcode if profile else "",
                "phone": profile.phone if profile else "",
            })

        return data

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