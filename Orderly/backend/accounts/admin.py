from django.contrib import admin
from .models import CustomerProfile, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "role")
    search_fields = ("user__username", "user__email")
    list_filter = ("role",)


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "state", "zipcode", "phone", "email_verified")
    search_fields = ("user__username", "user__email", "phone", "zipcode")
    # no raw_id_fields -> dropdown remains