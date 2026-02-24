from django.contrib import admin
from .models import UserProfile, CustomerProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role")
    list_select_related = ("user",)
    search_fields = ("user__username", "user__email")
    list_filter = ("role",)


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "city", "state", "zipcode", "phone")
    list_select_related = ("user",)
    search_fields = ("user__username", "user__email", "city", "state", "zipcode", "phone")
    list_filter = ("state",)