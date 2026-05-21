import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from settings.models import StoreSettings
from accounts.models import UserRoleChoices

User = get_user_model()
ProfileModel = User.profile.related.related_model


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def business_user(db):
    user = User.objects.create_user(
        username="businessuser",
        email="business@test.com",
        password="testpass123",
    )
    ProfileModel.objects.create(
        user=user,
        role=UserRoleChoices.STORE_MANAGER,
    )
    return user


@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="customeruser",
        email="customer@test.com",
        password="testpass123",
    )
    ProfileModel.objects.create(
        user=user,
        role=UserRoleChoices.CUSTOMER,
    )
    return user


@pytest.fixture
def auth_client(api_client, business_user):
    api_client.force_authenticate(user=business_user)
    return api_client


@pytest.fixture
def customer_client(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)
    return api_client


@pytest.mark.django_db
def test_get_settings_creates_default_if_not_exists(auth_client):
    url = reverse("store-settings")

    assert StoreSettings.objects.count() == 0

    response = auth_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert StoreSettings.objects.count() == 1
    assert response.data["taxRate"] == "0.00"
    assert response.data["contactEmail"] == ""
    assert response.data["contactPhone"] == ""
    assert response.data["storeName"] == ""


@pytest.mark.django_db
def test_get_settings_returns_existing(auth_client):
    StoreSettings.objects.create(
        tax_rate=Decimal("7.25"),
        contact_email="test@test.com",
        contact_phone="9195551234",
        store_name="Test Store",
    )

    url = reverse("store-settings")
    response = auth_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["taxRate"] == "7.25"
    assert response.data["contactEmail"] == "test@test.com"
    assert response.data["contactPhone"] == "9195551234"
    assert response.data["storeName"] == "Test Store"


@pytest.mark.django_db
def test_patch_updates_settings(auth_client):
    settings_obj = StoreSettings.objects.create()

    url = reverse("store-settings")
    payload = {
        "taxRate": "8.50",
        "storeName": "New Store",
    }

    response = auth_client.patch(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK

    settings_obj.refresh_from_db()
    assert settings_obj.tax_rate == Decimal("8.50")
    assert settings_obj.store_name == "New Store"


@pytest.mark.django_db
def test_patch_partial_update_only_changes_provided_fields(auth_client):
    settings_obj = StoreSettings.objects.create(
        tax_rate=Decimal("5.00"),
        store_name="Old Name",
    )

    url = reverse("store-settings")
    response = auth_client.patch(url, {"taxRate": "6.00"}, format="json")

    assert response.status_code == status.HTTP_200_OK

    settings_obj.refresh_from_db()
    assert settings_obj.tax_rate == Decimal("6.00")
    assert settings_obj.store_name == "Old Name"


@pytest.mark.django_db
def test_patch_persists_changes(auth_client):
    StoreSettings.objects.create()

    url = reverse("store-settings")
    patch_response = auth_client.patch(url, {"storeName": "Persisted"}, format="json")
    assert patch_response.status_code == status.HTTP_200_OK

    get_response = auth_client.get(url)
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.data["storeName"] == "Persisted"


@pytest.mark.django_db
def test_customer_user_can_read_settings(customer_client):
    url = reverse("store-settings")

    response = customer_client.get(url)

    # GET is intentionally public (AllowAny) so the storefront can read
    # store name, colours, etc. without requiring authentication.
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_unauthenticated_user_can_read_settings(api_client):
    url = reverse("store-settings")

    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_patch_invalid_tax_rate_fails(auth_client):
    StoreSettings.objects.create()

    url = reverse("store-settings")
    response = auth_client.patch(url, {"taxRate": "-5.00"}, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "taxRate" in response.data


@pytest.mark.django_db
def test_only_one_settings_instance_allowed():
    StoreSettings.objects.create()

    with pytest.raises(ValueError):
        StoreSettings.objects.create()