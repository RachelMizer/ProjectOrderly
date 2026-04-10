from rest_framework.permissions import BasePermission

from accounts.models import UserRoleChoices


class IsBusinessUser(BasePermission):
    """
    Allows access only to authenticated users with BUSINESS role.
    """

    message = "User does not have this permission."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        profile = getattr(user, "profile", None)
        if profile is None:
            return False

        return profile.role == UserRoleChoices.BUSINESS