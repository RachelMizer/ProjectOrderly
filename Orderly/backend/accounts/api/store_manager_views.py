from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.api.permissions import IsStoreManager
from accounts.models import UserRole, UserRoleChoices


class StoreManagerEmployeesView(APIView):
    permission_classes = [IsAuthenticated, IsStoreManager]

    def get(self, request):
        profile = getattr(request.user, "profile", None)
        if not profile or not profile.store_id:
            return Response({"detail": "No store assigned to your account."}, status=400)

        roles = (
            UserRole.objects.filter(store=profile.store, role=UserRoleChoices.EMPLOYEE)
            .select_related("user")
            .order_by("user__last_name", "user__first_name")
        )

        results = [
            {
                "id": ur.user.pk,
                "firstName": ur.user.first_name,
                "lastName": ur.user.last_name,
                "email": ur.user.email,
                "username": ur.user.username,
                "isActive": ur.user.is_active,
                "dateJoined": ur.user.date_joined,
                "status": ur.status,
            }
            for ur in roles
        ]

        return Response({
            "results": results,
            "count": len(results),
            "storeName": str(profile.store),
        })
