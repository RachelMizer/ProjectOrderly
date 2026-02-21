from django.contrib import admin
from .models import UserRole, CustomerProfile


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ("user", "role_choice")
    search_fields = ("user__username", "user__email")
    list_filter = ("role_choice",)


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "city", "state", "zipcode", "phone")
    search_fields = ("user__username", "user__email", "city", "state", "zipcode")
    list_filter = ("state",)
