from django.urls import path


from .views import (
    RegisterView,
    VerifyEmailView,
    ResendVerificationView,
    LoginView,
    RefreshView,
    LogoutView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    MeView,
)

urlpatterns = [
    path("register", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh", RefreshView.as_view(), name="token_refresh"),
    path("logout", LogoutView.as_view(), name="logout"),
    path(
        "password-reset",
        PasswordResetRequestView.as_view(),
        name="password_reset_request",
    ),
    path(
        "password-reset/confirm",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path("verify-email/", VerifyEmailView.as_view(), name="verify_email"),
    path(
        "resend-verification/",
        ResendVerificationView.as_view(),
        name="resend_verification",
    ),
    path("me/", MeView.as_view(), name="me"),
]
