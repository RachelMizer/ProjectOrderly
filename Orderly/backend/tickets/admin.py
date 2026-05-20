from django.contrib import admin
from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "status", "priority", "assigned_to", "created_at")
    list_filter = ("status", "priority")
    search_fields = ("title", "description", "guest_email")
    autocomplete_fields = ("assigned_to", "customer")
