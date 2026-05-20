from rest_framework import serializers
from tickets.models import BacklogItem, KnowledgeArticle, TeamAnnouncement, Ticket, TicketAssignmentHistory, TicketNote


class TicketSerializer(serializers.ModelSerializer):
    assignedTo = serializers.SerializerMethodField()
    customerEmail = serializers.SerializerMethodField()
    customerName = serializers.SerializerMethodField()
    customerId = serializers.SerializerMethodField()
    attachmentUrl = serializers.SerializerMethodField()
    guestEmail = serializers.CharField(source="guest_email", read_only=True, allow_blank=True)
    caseNotes = serializers.CharField(source="case_notes", read_only=True, allow_blank=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "assignedTo",
            "customerEmail",
            "customerName",
            "customerId",
            "guestEmail",
            "caseNotes",
            "attachmentUrl",
            "createdAt",
            "updatedAt",
        ]

    def get_assignedTo(self, obj):
        if obj.assigned_to is None:
            return None
        return {
            "id": obj.assigned_to.pk,
            "username": obj.assigned_to.username,
            "firstName": obj.assigned_to.first_name,
            "lastName": obj.assigned_to.last_name,
        }

    def get_customerEmail(self, obj):
        if obj.customer:
            return obj.customer.email
        return obj.guest_email or None

    def get_customerName(self, obj):
        if obj.customer:
            full = " ".join(filter(None, [obj.customer.first_name, obj.customer.last_name]))
            return full or obj.customer.username
        return None

    def get_customerId(self, obj):
        return obj.customer_id

    def get_attachmentUrl(self, obj):
        if not obj.attachment:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.attachment.url)
        return obj.attachment.url


class BacklogItemSerializer(serializers.ModelSerializer):
    itemType = serializers.SerializerMethodField()
    createdBy = serializers.SerializerMethodField()
    linkedTickets = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    isArchived = serializers.BooleanField(source="is_archived", read_only=True)

    class Meta:
        model = BacklogItem
        fields = ["id", "title", "itemType", "status", "priority", "description", "notes", "linkedTickets", "createdBy", "isArchived", "createdAt", "updatedAt"]

    def get_itemType(self, obj):
        return obj.item_type

    def get_createdBy(self, obj):
        if not obj.created_by:
            return None
        full = " ".join(filter(None, [obj.created_by.first_name, obj.created_by.last_name]))
        return full or obj.created_by.username

    def get_linkedTickets(self, obj):
        return [{"id": t.pk, "title": t.title} for t in obj.linked_tickets.all()]


class TicketNoteSerializer(serializers.ModelSerializer):
    authorName = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = TicketNote
        fields = ["id", "body", "authorName", "createdAt", "updatedAt"]

    def get_authorName(self, obj):
        if not obj.author:
            return "Unknown"
        full = " ".join(filter(None, [obj.author.first_name, obj.author.last_name]))
        return full or obj.author.username


class TicketAssignmentHistorySerializer(serializers.ModelSerializer):
    assignedFrom = serializers.SerializerMethodField()
    assignedTo = serializers.SerializerMethodField()
    changedBy = serializers.SerializerMethodField()
    changedAt = serializers.DateTimeField(source="changed_at", read_only=True)

    class Meta:
        model = TicketAssignmentHistory
        fields = ["id", "assignedFrom", "assignedTo", "changedBy", "changedAt"]

    def _name(self, user):
        if not user:
            return None
        full = " ".join(filter(None, [user.first_name, user.last_name]))
        return full or user.username

    def get_assignedFrom(self, obj):
        return self._name(obj.assigned_from)

    def get_assignedTo(self, obj):
        return self._name(obj.assigned_to)

    def get_changedBy(self, obj):
        return self._name(obj.changed_by)


class TeamAnnouncementSerializer(serializers.ModelSerializer):
    createdBy = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = TeamAnnouncement
        fields = ["id", "body", "createdBy", "createdAt"]

    def get_createdBy(self, obj):
        if not obj.created_by:
            return "Unknown"
        full = " ".join(filter(None, [obj.created_by.first_name, obj.created_by.last_name]))
        return full or obj.created_by.username


class KnowledgeArticleSerializer(serializers.ModelSerializer):
    createdBy = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = KnowledgeArticle
        fields = ["id", "title", "category", "body", "createdBy", "createdAt", "updatedAt"]

    def get_createdBy(self, obj):
        if not obj.created_by:
            return None
        full = " ".join(filter(None, [obj.created_by.first_name, obj.created_by.last_name]))
        return full or obj.created_by.username
