from django.conf import settings
from django.db import models


class TicketStatus(models.TextChoices):
    UNASSIGNED = "UNASSIGNED", "Unassigned"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    IN_REVIEW = "IN_REVIEW", "In Review"
    CLOSED = "CLOSED", "Closed"


class TicketPriority(models.TextChoices):
    LOW = "LOW", "Low"
    MEDIUM = "MEDIUM", "Medium"
    HIGH = "HIGH", "High"
    URGENT = "URGENT", "Urgent"


class Ticket(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=TicketStatus.choices,
        default=TicketStatus.UNASSIGNED,
    )
    priority = models.CharField(
        max_length=10,
        choices=TicketPriority.choices,
        default=TicketPriority.MEDIUM,
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets",
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submitted_tickets",
    )
    guest_email = models.EmailField(blank=True, default="")
    attachment = models.FileField(upload_to="ticket_attachments/", null=True, blank=True)
    case_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"#{self.pk} {self.title} [{self.status}]"


class BacklogItemType(models.TextChoices):
    BUG = "BUG", "Bug"
    FEATURE = "FEATURE", "Feature Request"


class BacklogItemStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    DONE = "DONE", "Done"


class BacklogItem(models.Model):
    title = models.CharField(max_length=255)
    item_type = models.CharField(
        max_length=20,
        choices=BacklogItemType.choices,
        default=BacklogItemType.BUG,
    )
    status = models.CharField(
        max_length=20,
        choices=BacklogItemStatus.choices,
        default=BacklogItemStatus.PENDING,
    )
    priority = models.CharField(
        max_length=10,
        choices=TicketPriority.choices,
        default=TicketPriority.MEDIUM,
    )
    description = models.TextField(blank=True, default="")
    notes = models.TextField(blank=True, default="")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="backlog_items",
    )
    linked_tickets = models.ManyToManyField(
        "Ticket",
        blank=True,
        related_name="backlog_references",
    )
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.item_type}] {self.title}"


class TicketAssignmentHistory(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="assignment_history")
    assigned_from = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="assignments_from_history"
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="assignments_to_history"
    )
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="assignment_changes_made"
    )
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-changed_at"]


class TeamAnnouncement(models.Model):
    body = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="announcements"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Announcement by {self.created_by} at {self.created_at}"


class KnowledgeArticle(models.Model):
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, default="")
    body = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="knowledge_articles"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "title"]

    def __str__(self):
        return self.title


class TicketNote(models.Model):
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ticket_notes",
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Note on #{self.ticket_id} by {self.author}"
