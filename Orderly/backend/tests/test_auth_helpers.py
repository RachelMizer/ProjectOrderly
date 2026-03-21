import pytest
from django.contrib.auth import get_user_model
from django.core import mail

from accounts.api.views import send_verification_email, send_password_reset_email

User = get_user_model()


@pytest.mark.django_db
def test_send_verification_email_sends_message():
    user = User.objects.create_user(
        username="verify@test.com",
        email="verify@test.com",
        password="Password123!",
    )

    send_verification_email(user)

    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "Verify your email"
    assert "verify-email?uid=" in mail.outbox[0].body
    assert mail.outbox[0].to == ["verify@test.com"]


@pytest.mark.django_db
def test_send_password_reset_email_sends_message():
    user = User.objects.create_user(
        username="reset@test.com",
        email="reset@test.com",
        password="Password123!",
    )

    send_password_reset_email(user)

    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "Password reset"
    assert "reset-password?uid=" in mail.outbox[0].body
    assert mail.outbox[0].to == ["reset@test.com"]