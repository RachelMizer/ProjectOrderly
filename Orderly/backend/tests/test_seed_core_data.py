# tests/test_seed_core_data.py

import os
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command

from manage import main as manage_main


@pytest.mark.django_db
def test_seed_command_creates_admin_business_and_customer_users():
    User = get_user_model()

    call_command("seed_core_data", seed=42, customers=5, business=2)

    # admin
    admin = User.objects.get(username="admin")
    assert admin.email == "admin@example.com"
    assert admin.is_staff is True
    assert admin.is_superuser is True

    # business users
    for i in range(1, 3):
        user = User.objects.get(username=f"business{i}")
        assert user.email == f"business{i}@example.com"

    # customer users
    for i in range(1, 6):
        user = User.objects.get(username=f"customer{i}")
        assert user.email == f"customer{i}@example.com"


@pytest.mark.django_db
def test_seed_command_creates_customer_profiles_with_default_values():
    User = get_user_model()

    # adjust import if your project uses a different model name/path
    from accounts.models import CustomerProfile

    call_command("seed_core_data", seed=42, customers=5, business=2)

    for i in range(1, 6):
        user = User.objects.get(username=f"customer{i}")
        profile = CustomerProfile.objects.get(user=user)

        assert profile.street_address == "123 Main St"
        assert profile.city == "Raleigh"
        assert profile.state == "NC"
        assert profile.zipcode == "27601"
        assert profile.phone == "919-555-0101"


@pytest.mark.django_db
def test_seed_command_is_idempotent_for_users():
    User = get_user_model()

    call_command("seed_core_data", seed=42, customers=5, business=2)
    first_count = User.objects.count()

    call_command("seed_core_data", seed=42, customers=5, business=2)
    second_count = User.objects.count()

    assert first_count == second_count


def test_manage_main_sets_default_settings_module_and_executes_command_line():
    with patch("django.core.management.execute_from_command_line") as mock_execute:
        with patch("sys.argv", ["manage.py", "check"]):
            os.environ.pop("DJANGO_SETTINGS_MODULE", None)

            manage_main()

            assert os.environ["DJANGO_SETTINGS_MODULE"] == "orderly.settings"
            mock_execute.assert_called_once()