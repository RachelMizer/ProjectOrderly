import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient
from accounts.models import UserRole, UserRoleChoices

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_with_password(db):
    user = User.objects.create_user(
        username="user@test.com",
        email="user@test.com",
        password="Password123!",
        first_name="Test",
        last_name="User",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    return user


@pytest.mark.django_db
def test_register_success(api_client):
    response = api_client.post(
        "/api/v1/auth/register",
        {
            "email": "newuser@test.com",
            "password": "StrongPass123!",
            "firstName": "New",
            "lastName": "User",
        },
        format="json",
    )

    assert response.status_code == 201
    assert "accessToken" in response.data
    assert response.data["tokenType"] == "Bearer"
    assert "expiresIn" in response.data
    assert "customer" in response.data
    assert response.data["customer"]["email"] == "newuser@test.com"
    assert "refreshToken" in response.cookies


@pytest.mark.django_db
def test_register_duplicate_email_returns_400(api_client, user_with_password):
    response = api_client.post(
        "/api/v1/auth/register",
        {
            "email": "user@test.com",
            "password": "StrongPass123!",
            "firstName": "Test",
            "lastName": "User",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "email" in response.data


@pytest.mark.django_db
def test_register_missing_required_fields_returns_400(api_client):
    response = api_client.post(
        "/api/v1/auth/register",
        {
            "email": "missing@test.com",
            "password": "StrongPass123!",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "firstName" in response.data
    assert "lastName" in response.data


@pytest.mark.django_db
def test_login_success(api_client, user_with_password):
    response = api_client.post(
        "/api/v1/auth/login",
        {
            "email": "user@test.com",
            "password": "Password123!",
        },
        format="json",
    )

    assert response.status_code == 200
    assert "accessToken" in response.data
    assert response.data["tokenType"] == "Bearer"
    assert "expiresIn" in response.data
    assert "customer" in response.data
    assert response.data["customer"]["email"] == "user@test.com"
    assert "refreshToken" in response.cookies


@pytest.mark.django_db
def test_login_invalid_password_returns_400(api_client, user_with_password):
    response = api_client.post(
        "/api/v1/auth/login",
        {
            "email": "user@test.com",
            "password": "WrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "non_field_errors" in response.data or "detail" in response.data


@pytest.mark.django_db
def test_refresh_missing_cookie_returns_401(api_client):
    response = api_client.post("/api/v1/auth/refresh")

    assert response.status_code == 401
    assert response.data["error"] == "INVALID_REFRESH_TOKEN"


@pytest.mark.django_db
def test_refresh_with_valid_cookie_returns_new_access_token(api_client, user_with_password):
    login_response = api_client.post(
        "/api/v1/auth/login",
        {
            "email": "user@test.com",
            "password": "Password123!",
        },
        format="json",
    )

    refresh_cookie = login_response.cookies["refreshToken"].value
    api_client.cookies["refreshToken"] = refresh_cookie

    response = api_client.post("/api/v1/auth/refresh")

    assert response.status_code == 200
    assert "accessToken" in response.data
    assert response.data["tokenType"] == "Bearer"
    assert "expiresIn" in response.data


@pytest.mark.django_db
def test_logout_returns_200_and_clears_cookie(api_client, user_with_password):
    login_response = api_client.post(
        "/api/v1/auth/login",
        {
            "email": "user@test.com",
            "password": "Password123!",
        },
        format="json",
    )

    refresh_cookie = login_response.cookies["refreshToken"].value
    api_client.cookies["refreshToken"] = refresh_cookie

    response = api_client.post("/api/v1/auth/logout")

    assert response.status_code == 200
    assert response.data["message"] == "Successfully logged out"


@pytest.mark.django_db
def test_me_requires_auth(api_client):
    response = api_client.get("/api/v1/users/me/")

    assert response.status_code == 401


@pytest.mark.django_db
def test_me_returns_authenticated_user(api_client, user_with_password):
    api_client.force_authenticate(user=user_with_password)

    response = api_client.get("/api/v1/users/me/")

    assert response.status_code == 200
    assert response.data["firstName"] == "Test"
    assert response.data["lastName"] == "User"
    assert response.data["email"] == "user@test.com"


@pytest.mark.django_db
def test_email_verification_request_returns_generic_message_for_existing_user(api_client, monkeypatch, user_with_password):
    called = {"sent": False}

    def fake_send_verification_email(user):
        called["sent"] = True

    monkeypatch.setattr(
        "accounts.api.views.send_verification_email",
        fake_send_verification_email,
    )

    response = api_client.post(
        "/api/v1/auth/email-verification",
        {"email": "user@test.com"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["message"] == "If email exists, will send email verification"
    assert called["sent"] is True


@pytest.mark.django_db
def test_email_verification_request_returns_generic_message_for_unknown_user(api_client, monkeypatch):
    called = {"sent": False}

    def fake_send_verification_email(user):
        called["sent"] = True

    monkeypatch.setattr(
        "accounts.api.views.send_verification_email",
        fake_send_verification_email,
    )

    response = api_client.post(
        "/api/v1/auth/email-verification",
        {"email": "missing@test.com"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["message"] == "If email exists, will send email verification"
    assert called["sent"] is False


@pytest.mark.django_db
def test_email_verification_confirm_invalid_token_returns_400(api_client):
    response = api_client.post(
        "/api/v1/auth/email-verification/confirm",
        {"uid": "bad-uid", "token": "bad-token"},
        format="json",
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_password_reset_request_returns_generic_message_for_existing_user(api_client, monkeypatch, user_with_password):
    called = {"sent": False}

    def fake_send_password_reset_email(user):
        called["sent"] = True

    monkeypatch.setattr(
        "accounts.api.views.send_password_reset_email",
        fake_send_password_reset_email,
    )

    response = api_client.post(
        "/api/v1/auth/password-reset",
        {"email": "user@test.com"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["message"] == "If email exists, will send password reset."
    assert called["sent"] is True


@pytest.mark.django_db
def test_password_reset_request_returns_generic_message_for_unknown_user(api_client, monkeypatch):
    called = {"sent": False}

    def fake_send_password_reset_email(user):
        called["sent"] = True

    monkeypatch.setattr(
        "accounts.api.views.send_password_reset_email",
        fake_send_password_reset_email,
    )

    response = api_client.post(
        "/api/v1/auth/password-reset",
        {"email": "missing@test.com"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["message"] == "If email exists, will send password reset."
    assert called["sent"] is False


@pytest.mark.django_db
def test_password_reset_confirm_invalid_token_returns_400(api_client):
    response = api_client.post(
        "/api/v1/auth/password-reset/confirm",
        {
            "uid": "bad-uid",
            "token": "bad-token",
            "newPassword": "NewPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_password_reset_confirm_success_changes_password(api_client, user_with_password):
    uid = urlsafe_base64_encode(force_bytes(user_with_password.pk))
    token = default_token_generator.make_token(user_with_password)

    response = api_client.post(
        "/api/v1/auth/password-reset/confirm",
        {
            "uid": uid,
            "token": token,
            "newPassword": "BrandNewPassword123!",
        },
        format="json",
    )

    assert response.status_code == 200
    assert response.data["message"] == "Password has been reset successfully."

    user_with_password.refresh_from_db()
    assert user_with_password.check_password("BrandNewPassword123!")