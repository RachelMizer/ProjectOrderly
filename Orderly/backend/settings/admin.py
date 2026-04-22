from django.contrib import admin

from settings.models import StoreSettings


@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    list_display = ("store_name", "tax_rate", "contact_email", "contact_phone", "updated_at")

    def has_add_permission(self, request):
        if StoreSettings.objects.exists():
            return False
        return super().has_add_permission(request)
