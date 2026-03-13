import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from accounts.models import CustomerProfile, UserRole, UserRoleChoices

User = get_user_model()


@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        username="customer@test.com",
        email="customer@test.com",
        password="Password123!",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    return user


@pytest.fixture
def business_user(db):
    user = User.objects.create_user(
        username="business@test.com",
        email="business@test.com",
        password="Password123!",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.BUSINESS)
    return user


@pytest.mark.django_db
def test_customer_profile_requires_user():
    profile = CustomerProfile()

    with pytest.raises(ValidationError):
        profile.full_clean()


@pytest.mark.django_db
def test_customer_profile_requires_user_role(db):
    user = User.objects.create_user(
        username="norole@test.com",
        email="norole@test.com",
        password="Password123!",
    )
    profile = CustomerProfile(user=user)

    with pytest.raises(ValidationError):
        profile.full_clean()


@pytest.mark.django_db
def test_customer_profile_requires_customer_role(business_user):
    profile = CustomerProfile(user=business_user)

    with pytest.raises(ValidationError):
        profile.full_clean()


@pytest.mark.django_db
def test_customer_profile_accepts_customer_role(customer_user):
    profile = CustomerProfile(
        user=customer_user,
        state="NC",
        zipcode="27606",
        phone="+19195551212",
    )

    profile.full_clean()


@pytest.mark.django_db
def test_customer_profile_save_rejects_untrimmed_and_formatted_values(customer_user):
    profile = CustomerProfile(
        user=customer_user,
        state=" nc ",
        zipcode=" 27606 ",
        phone="(919) 555-1212",
    )

    with pytest.raises(ValidationError):
        profile.save()


@pytest.mark.django_db
def test_customer_profile_invalid_state_raises_error(customer_user):
    profile = CustomerProfile(user=customer_user, state="north carolina")

    with pytest.raises(ValidationError):
        profile.full_clean()


@pytest.mark.django_db
def test_customer_profile_invalid_zipcode_raises_error(customer_user):
    profile = CustomerProfile(user=customer_user, zipcode="abcde")

    with pytest.raises(ValidationError):
        profile.full_clean()


@pytest.mark.django_db
def test_customer_profile_invalid_phone_raises_error(customer_user):
    profile = CustomerProfile(user=customer_user, phone="abc-123")

    with pytest.raises(ValidationError):
        profile.full_clean()


@pytest.mark.django_db
def test_customer_profile_str(customer_user):
    profile = CustomerProfile.objects.create(user=customer_user)
    assert str(profile) == f"CustomerProfile for {customer_user.username}"