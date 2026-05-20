from django.urls import path


from .views import (
    RegisterView,
    EmailVerificationRequestView,
    EmailVerificationConfirmView,
    LoginView,
    RefreshView,
    LogoutView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    MeView,
    AdminUserListView,
    AdminUserDetailView,
    DeletedAccountListView,
    MyStatusView,
    TeamStatusView,
    HeartbeatView,
)

urlpatterns = [
    path("register", RegisterView.as_view(), name="register"),
    path("login", LoginView.as_view(), name="login"),
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
    path(
        "email-verification",
        EmailVerificationRequestView.as_view(),
        name="request-email-verification",
    ),
    path(
        "email-verification/confirm",
        EmailVerificationConfirmView.as_view(),
        name="confirm-email-verification",
    ),
    path("me/", MeView.as_view(), name="me"),
    path("admin-accounts/", AdminUserListView.as_view(), name="admin-accounts"),
    path("admin-accounts/<int:user_id>/", AdminUserDetailView.as_view(), name="admin-account-detail"),
    path("deleted-accounts/", DeletedAccountListView.as_view(), name="deleted-accounts"),
    path("my-status/", MyStatusView.as_view(), name="my-status"),
    path("team-status/", TeamStatusView.as_view(), name="team-status"),
    path("heartbeat/", HeartbeatView.as_view(), name="heartbeat"),
]
