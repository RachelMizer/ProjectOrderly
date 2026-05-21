from rest_framework.response import Response
from rest_framework.views import exception_handler
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None and response.status_code == status.HTTP_403_FORBIDDEN:

        # ðŸ” Default DRF message
        detail = response.data.get("detail", "")

        # ðŸ” Role-based permission (your IsStoreManager)
        if "permission" in str(detail).lower():
            return Response(
                {
                    "error": "INVALID_ROLE",
                    "message": "User does not have this permission.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ðŸ”’ Ownership / authorization failure
        return Response(
            {
                "error": "NOT_AUTHORIZED",
                "message": "user is not allowed to access this resource",
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    return response