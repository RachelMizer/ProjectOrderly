from django.contrib import admin
from django.contrib.auth import get_user_model

from .models import CustomerProfile, UserRole, UserRoleChoices


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "role")
    search_fields = ("user__username", "user__email")
    list_filter = ("role",)
    autocomplete_fields = ("user",)


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "city", "state", "zipcode", "phone", "email_verified")
    search_fields = ("user__username", "user__email", "city", "state", "zipcode")
    list_filter = ("state", "email_verified")
    autocomplete_fields = ("user",)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        # Restrict dropdown to users that have a UserRole of CUSTOMER
        if db_field.name == "user":
            User = get_user_model()
            kwargs["queryset"] = User.objects.filter(profile__role=UserRoleChoices.CUSTOMER)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)