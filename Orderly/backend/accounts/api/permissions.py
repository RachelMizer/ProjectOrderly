from rest_framework.permissions import BasePermission

from accounts.models import UserRoleChoices


class IsStoreManager(BasePermission):
    """
    Allows access only to authenticated users with STORE_MANAGER role.
    """

    message = "User does not have this permission."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        profile = getattr(user, "profile", None)
        if profile is None:
            return False

        return profile.role == UserRoleChoices.STORE_MANAGER


class IsExecutiveUser(BasePermission):
    """
    Allows access only to authenticated users with EXECUTIVE role.
    """

    message = "User does not have this permission."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        profile = getattr(user, "profile", None)
        if profile is None:
            return False

        return profile.role == UserRoleChoices.EXECUTIVE


class IsSupportUser(BasePermission):
    """
    Allows access only to authenticated users with SUPPORT role.
    """

    message = "User does not have this permission."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        profile = getattr(user, "profile", None)
        if profile is None:
            return False

        return profile.role == UserRoleChoices.SUPPORT


class IsStoreManagerOrAbove(BasePermission):
    """
    Allows access to authenticated users with STORE_MANAGER, EXECUTIVE, or SUPPORT role.
    """

    message = "User does not have this permission."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        profile = getattr(user, "profile", None)
        if profile is None:
            return False

        return profile.role in (
            UserRoleChoices.STORE_MANAGER,
            UserRoleChoices.EXECUTIVE,
            UserRoleChoices.SUPPORT,
        )