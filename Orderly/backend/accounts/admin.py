from django.contrib import admin
from .models import UserProfile, CustomerProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role")
    search_fields = ("user__username", "user__email")
    list_filter = ("role",)


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "city", "state", "zipcode", "phone")
    search_fields = ("user__username", "user__email", "city", "state", "zipcode")
    list_filter = ("state",)

