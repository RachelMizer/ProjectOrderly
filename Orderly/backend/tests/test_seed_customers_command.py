# backend/tests/test_seed_customers_command.py

import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command

from accounts.models import CustomerProfile, UserRole, UserRoleChoices

pytestmark = pytest.mark.django_db

User = get_user_model()


def _seeded_users():
    return User.objects.filter(customer_profile__isnull=False).order_by("username")


def test_seed_customers_creates_100_customers_with_profiles_roles_and_password():
    call_command("seed_customers")

    users = list(_seeded_users())
    assert len(users) == 100
    assert UserRole.objects.count() == 100
    assert CustomerProfile.objects.count() == 100

    usernames = [user.username for user in users]
    emails = [user.email for user in users]

    assert len(usernames) == len(set(usernames))
    assert len(emails) == len(set(emails))

    for user in users:
        assert user.check_password("Password123!")
        assert user.profile.role == UserRoleChoices.CUSTOMER

        profile = user.customer_profile
        assert profile.state == "NC"
        assert profile.city
        assert profile.street_address
        assert profile.zipcode
        assert profile.phone
        assert profile.zipcode.isdigit()
        assert len(profile.zipcode) == 5
        assert profile.phone.isdigit()
        assert 10 <= len(profile.phone) <= 15


def test_seed_customers_is_idempotent_without_clear():
    call_command("seed_customers")
    first_snapshot = list(
        _seeded_users().values_list(
            "username",
            "email",
            "first_name",
            "last_name",
            "customer_profile__street_address",
            "customer_profile__city",
            "customer_profile__state",
            "customer_profile__zipcode",
            "customer_profile__phone",
            "customer_profile__email_verified",
        )
    )

    call_command("seed_customers")
    second_snapshot = list(
        _seeded_users().values_list(
            "username",
            "email",
            "first_name",
            "last_name",
            "customer_profile__street_address",
            "customer_profile__city",
            "customer_profile__state",
            "customer_profile__zipcode",
            "customer_profile__phone",
            "customer_profile__email_verified",
        )
    )

    assert User.objects.filter(customer_profile__isnull=False).count() == 100
    assert UserRole.objects.count() == 100
    assert CustomerProfile.objects.count() == 100
    assert first_snapshot == second_snapshot


def test_seed_customers_clear_rebuilds_same_deterministic_dataset():
    call_command("seed_customers")
    first_snapshot = list(
        _seeded_users().values_list(
            "username",
            "email",
            "first_name",
            "last_name",
            "customer_profile__street_address",
            "customer_profile__city",
            "customer_profile__state",
            "customer_profile__zipcode",
            "customer_profile__phone",
            "customer_profile__email_verified",
        )
    )

    call_command("seed_customers", "--clear")
    second_snapshot = list(
        _seeded_users().values_list(
            "username",
            "email",
            "first_name",
            "last_name",
            "customer_profile__street_address",
            "customer_profile__city",
            "customer_profile__state",
            "customer_profile__zipcode",
            "customer_profile__phone",
            "customer_profile__email_verified",
        )
    )

    assert User.objects.filter(customer_profile__isnull=False).count() == 100
    assert UserRole.objects.count() == 100
    assert CustomerProfile.objects.count() == 100
    assert first_snapshot == second_snapshot