import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import CustomerProfile, UserRole, UserRoleChoices

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="customer@test.com",
        email="customer@test.com",
        password="Password123!",
        first_name="Test",
        last_name="Customer",
    )

    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)

    CustomerProfile.objects.create(
        user=user,
        street_address="123 Main St",
        city="Raleigh",
        state="NC",
        zipcode="27606",
        phone="9195551111",
    )

    return user


# -----------------------------
# AUTHORIZATION
# -----------------------------

@pytest.mark.django_db
def test_me_requires_authentication(api_client):
    response = api_client.get("/api/v1/users/me/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_patch_me_requires_authentication(api_client):
    response = api_client.patch(
        "/api/v1/users/me/",
        {"firstName": "New"},
        format="json",
    )
    assert response.status_code == 401


# -----------------------------
# GET PROFILE
# -----------------------------

@pytest.mark.django_db
def test_get_profile_returns_user_data(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.get("/api/v1/users/me/")

    assert response.status_code == 200
    assert response.data["firstName"] == "Test"
    assert response.data["lastName"] == "Customer"
    assert response.data["email"] == "customer@test.com"
    assert response.data["city"] == "Raleigh"
    assert response.data["state"] == "NC"


# -----------------------------
# UPDATE PROFILE
# -----------------------------

@pytest.mark.django_db
def test_patch_profile_updates_user_fields(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "firstName": "Updated",
            "lastName": "User",
        },
        format="json",
    )

    assert response.status_code == 200

    customer_user.refresh_from_db()

    assert customer_user.first_name == "Updated"
    assert customer_user.last_name == "User"


@pytest.mark.django_db
def test_patch_profile_updates_customer_profile(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "streetAddress": "456 Oak Ave",
            "city": "Durham",
            "state": "NC",
            "zipcode": "27701",
            "phone": "9195552222",
        },
        format="json",
    )

    assert response.status_code == 200

    profile = CustomerProfile.objects.get(user=customer_user)

    assert profile.street_address == "456 Oak Ave"
    assert profile.city == "Durham"
    assert profile.state == "NC"
    assert profile.zipcode == "27701"
    assert profile.phone == "9195552222"


# -----------------------------
# EMAIL CHANGE
# -----------------------------

@pytest.mark.django_db
def test_patch_email_updates_user_and_unverifies_email(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "email": "newemail@test.com",
        },
        format="json",
    )

    assert response.status_code == 200

    customer_user.refresh_from_db()
    profile = CustomerProfile.objects.get(user=customer_user)

    assert customer_user.email == "newemail@test.com"
    assert customer_user.username == "newemail@test.com"
    assert profile.email_verified is False


# -----------------------------
# EMAIL UNIQUENESS
# -----------------------------

@pytest.mark.django_db
def test_patch_email_rejects_duplicate(api_client, customer_user):
    other_user = User.objects.create_user(
        username="other@test.com",
        email="other@test.com",
        password="Password123!",
    )

    UserRole.objects.create(user=other_user, role=UserRoleChoices.CUSTOMER)
    CustomerProfile.objects.create(user=other_user)

    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {"email": "other@test.com"},
        format="json",
    )

    assert response.status_code == 400
    assert "email" in response.data

@pytest.mark.django_db
def test_patch_profile_rejects_invalid_phone_format(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "phone": "abc123",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "phone" in response.data

@pytest.mark.django_db
def test_patch_profile_rejects_invalid_state(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "state": "North Carolina"
        },
        format="json",
    )

    assert response.status_code == 400
    assert "state" in response.data

@pytest.mark.django_db
def test_patch_profile_rejects_invalid_zipcode(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "zipcode": "27"
        },
        format="json",
    )

    assert response.status_code == 400
    assert "zipcode" in response.data

@pytest.mark.django_db
def test_patch_profile_rejects_invalid_email_format(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "email": "not-an-email",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "email" in response.data


@pytest.mark.django_db
def test_patch_profile_rejects_duplicate_email_case_insensitive(api_client, customer_user):
    other_user = User.objects.create_user(
        username="other@test.com",
        email="Other@Test.com",
        password="Password123!",
    )
    UserRole.objects.create(user=other_user, role=UserRoleChoices.CUSTOMER)
    CustomerProfile.objects.create(user=other_user)

    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "email": "other@test.com",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "email" in response.data


@pytest.mark.django_db
def test_patch_profile_rejects_invalid_phone_format(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "phone": "abc123",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "phone" in response.data


@pytest.mark.django_db
def test_patch_profile_rejects_invalid_state_format(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "state": "North Carolina",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "state" in response.data


@pytest.mark.django_db
def test_patch_profile_normalizes_lowercase_state_to_uppercase(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "state": "nc",
        },
        format="json",
    )

    assert response.status_code == 200

    customer_user.refresh_from_db()
    assert customer_user.customer_profile.state == "NC"
    assert response.data["state"] == "NC"


@pytest.mark.django_db
def test_patch_profile_rejects_invalid_zipcode_format(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "zipcode": "27",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "zipcode" in response.data


@pytest.mark.django_db
def test_patch_profile_accepts_valid_five_digit_zipcode(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "zipcode": "27606",
        },
        format="json",
    )

    assert response.status_code == 200
    customer_user.refresh_from_db()
    assert customer_user.customer_profile.zipcode == "27606"


@pytest.mark.django_db
def test_patch_profile_accepts_valid_zipcode_plus_four(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "zipcode": "27606-1234",
        },
        format="json",
    )

    assert response.status_code == 200
    customer_user.refresh_from_db()
    assert customer_user.customer_profile.zipcode == "27606-1234"


@pytest.mark.django_db
def test_patch_profile_accepts_valid_state(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "state": "NC",
        },
        format="json",
    )

    assert response.status_code == 200
    customer_user.refresh_from_db()
    assert customer_user.customer_profile.state == "NC"


@pytest.mark.django_db
def test_patch_profile_accepts_valid_phone_digits_only(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "phone": "9195551212",
        },
        format="json",
    )

    assert response.status_code == 200
    customer_user.refresh_from_db()
    assert customer_user.customer_profile.phone == "9195551212"


@pytest.mark.django_db
def test_patch_profile_accepts_blank_optional_profile_fields(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "streetAddress": "",
            "city": "",
            "state": "",
            "zipcode": "",
            "phone": "",
        },
        format="json",
    )

    assert response.status_code == 200

    customer_user.refresh_from_db()
    profile = customer_user.customer_profile
    assert profile.street_address == ""
    assert profile.city == ""
    assert profile.state == ""
    assert profile.zipcode == ""
    assert profile.phone == ""


@pytest.mark.django_db
def test_patch_profile_only_updates_submitted_field(api_client, customer_user):
    original_last_name = customer_user.last_name
    original_street = customer_user.customer_profile.street_address
    original_zipcode = customer_user.customer_profile.zipcode

    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "city": "Charlotte",
        },
        format="json",
    )

    assert response.status_code == 200

    customer_user.refresh_from_db()
    profile = customer_user.customer_profile

    assert profile.city == "Charlotte"
    assert customer_user.last_name == original_last_name
    assert profile.street_address == original_street
    assert profile.zipcode == original_zipcode


@pytest.mark.django_db
def test_patch_profile_email_is_normalized_to_lowercase(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)

    response = api_client.patch(
        "/api/v1/users/me/",
        {
            "email": "NEWEMAIL@TEST.COM",
        },
        format="json",
    )

    assert response.status_code == 200

    customer_user.refresh_from_db()
    assert customer_user.email == "newemail@test.com"
    assert customer_user.username == "newemail@test.com"