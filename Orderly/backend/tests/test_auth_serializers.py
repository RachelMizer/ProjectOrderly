import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from accounts.api.serializers import (
    RegisterSerializer,
    LoginSerializer,
    EmailVerificationRequestSerializer,
    EmailVerificationConfirmSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from accounts.models import UserRole, UserRoleChoices, CustomerProfile

User = get_user_model()


@pytest.fixture
def auth_user(db):
    user = User.objects.create_user(
        username="user@test.com",
        email="user@test.com",
        password="Password123!",
        first_name="Test",
        last_name="User",
        is_active=True,
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    CustomerProfile.objects.create(user=user)
    return user


@pytest.fixture
def inactive_user(db):
    user = User.objects.create_user(
        username="inactive@test.com",
        email="inactive@test.com",
        password="Password123!",
        first_name="Inactive",
        last_name="User",
        is_active=False,
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    return user


@pytest.mark.django_db
def test_register_serializer_valid_data_creates_user():
    serializer = RegisterSerializer(
        data={
            "email": "newuser@test.com",
            "password": "StrongPass123!",
            "firstName": "New",
            "lastName": "User",
        }
    )

    assert serializer.is_valid(), serializer.errors
    user = serializer.save()

    assert user.email == "newuser@test.com"
    assert UserRole.objects.filter(user=user, role=UserRoleChoices.CUSTOMER).exists()
    assert CustomerProfile.objects.filter(user=user).exists()


@pytest.mark.django_db
def test_register_serializer_rejects_duplicate_email(auth_user):
    serializer = RegisterSerializer(
        data={
            "email": "user@test.com",
            "password": "StrongPass123!",
            "firstName": "Test",
            "lastName": "User",
        }
    )

    assert not serializer.is_valid()
    assert "email" in serializer.errors


@pytest.mark.django_db
def test_register_serializer_normalizes_email():
    serializer = RegisterSerializer(
        data={
            "email": "  NEWUSER@TEST.COM ",
            "password": "StrongPass123!",
            "firstName": "New",
            "lastName": "User",
        }
    )

    assert serializer.is_valid(), serializer.errors
    user = serializer.save()
    assert user.email == "newuser@test.com"
    assert user.username == "newuser@test.com"


@pytest.mark.django_db
def test_register_serializer_rejects_weak_password():
    serializer = RegisterSerializer(
        data={
            "email": "weak@test.com",
            "password": "123",
            "firstName": "Weak",
            "lastName": "Password",
        }
    )

    assert not serializer.is_valid()
    assert "password" in serializer.errors


@pytest.mark.django_db
def test_login_serializer_valid_credentials(auth_user):
    serializer = LoginSerializer(
        data={"email": "user@test.com", "password": "Password123!"}
    )

    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data["user"] == auth_user


@pytest.mark.django_db
def test_login_serializer_invalid_credentials(auth_user):
    serializer = LoginSerializer(
        data={"email": "user@test.com", "password": "WrongPassword123!"}
    )

    assert not serializer.is_valid()
    assert "non_field_errors" in serializer.errors


@pytest.mark.django_db
def test_login_serializer_rejects_inactive_user(inactive_user):
    serializer = LoginSerializer(
        data={"email": "inactive@test.com", "password": "Password123!"}
    )

    assert not serializer.is_valid()
    assert "non_field_errors" in serializer.errors


@pytest.mark.django_db
def test_email_verification_request_get_user_returns_active_user(auth_user):
    serializer = EmailVerificationRequestSerializer(data={"email": "user@test.com"})
    assert serializer.is_valid(), serializer.errors

    user = serializer.get_user()
    assert user == auth_user


@pytest.mark.django_db
def test_email_verification_request_get_user_ignores_inactive_user(inactive_user):
    serializer = EmailVerificationRequestSerializer(data={"email": "inactive@test.com"})
    assert serializer.is_valid(), serializer.errors

    user = serializer.get_user()
    assert user is None


@pytest.mark.django_db
def test_email_verification_confirm_serializer_invalid_uid_or_token():
    serializer = EmailVerificationConfirmSerializer(
        data={"uid": "bad-uid", "token": "bad-token"}
    )

    assert not serializer.is_valid()


@pytest.mark.django_db
def test_email_verification_confirm_save_marks_email_verified(auth_user):
    uid = urlsafe_base64_encode(force_bytes(auth_user.pk))
    token = default_token_generator.make_token(auth_user)

    serializer = EmailVerificationConfirmSerializer(
        data={"uid": uid, "token": token}
    )

    assert serializer.is_valid(), serializer.errors
    serializer.save()

    auth_user.customer_profile.refresh_from_db()
    assert auth_user.customer_profile.email_verified is True


@pytest.mark.django_db
def test_password_reset_request_get_user_returns_active_user(auth_user):
    serializer = PasswordResetRequestSerializer(data={"email": "user@test.com"})
    assert serializer.is_valid(), serializer.errors

    user = serializer.get_user()
    assert user == auth_user


@pytest.mark.django_db
def test_password_reset_request_get_user_ignores_inactive_user(inactive_user):
    serializer = PasswordResetRequestSerializer(data={"email": "inactive@test.com"})
    assert serializer.is_valid(), serializer.errors

    user = serializer.get_user()
    assert user is None


@pytest.mark.django_db
def test_password_reset_confirm_invalid_token(auth_user):
    uid = urlsafe_base64_encode(force_bytes(auth_user.pk))

    serializer = PasswordResetConfirmSerializer(
        data={
            "uid": uid,
            "token": "bad-token",
            "newPassword": "BrandNewPassword123!",
        }
    )

    assert not serializer.is_valid()


@pytest.mark.django_db
def test_password_reset_confirm_rejects_weak_password(auth_user):
    uid = urlsafe_base64_encode(force_bytes(auth_user.pk))
    token = default_token_generator.make_token(auth_user)

    serializer = PasswordResetConfirmSerializer(
        data={
            "uid": uid,
            "token": token,
            "newPassword": "123",
        }
    )

    assert not serializer.is_valid()
    assert "newPassword" in serializer.errors


@pytest.mark.django_db
def test_password_reset_confirm_save_updates_password_and_blacklists_tokens(auth_user):
    from rest_framework_simplejwt.tokens import RefreshToken

    refresh = RefreshToken.for_user(auth_user)

    uid = urlsafe_base64_encode(force_bytes(auth_user.pk))
    token = default_token_generator.make_token(auth_user)

    serializer = PasswordResetConfirmSerializer(
        data={
            "uid": uid,
            "token": token,
            "newPassword": "BrandNewPassword123!",
        }
    )

    assert serializer.is_valid(), serializer.errors
    serializer.save()

    auth_user.refresh_from_db()
    assert auth_user.check_password("BrandNewPassword123!")
    assert OutstandingToken.objects.filter(user=auth_user).exists()
    assert BlacklistedToken.objects.exists()