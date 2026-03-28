from rest_framework.exceptions import APIException

class NotAuthorizedException(APIException):
    status_code = 403
    default_code = "not_authorized"

    def __init__(self, message="You do not have permission to access this order."):
        self.detail = {
            "error": "NOT_AUTHORIZED",
            "message": message,
        }