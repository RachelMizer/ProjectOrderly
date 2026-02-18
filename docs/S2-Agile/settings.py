INSTALLED_APPS = [
    # ...
    "rest_framework",
    "rest_framework.authtoken",
    "users",  # your app
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
}
