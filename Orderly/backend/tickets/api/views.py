from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.api.permissions import IsBusinessOrExecutive, IsSupportUser
from accounts.models import UserRoleChoices
from tickets.models import BacklogItem, BacklogItemStatus, BacklogItemType, KnowledgeArticle, TeamAnnouncement, Ticket, TicketAssignmentHistory, TicketNote, TicketPriority, TicketStatus
from .serializers import BacklogItemSerializer, KnowledgeArticleSerializer, TeamAnnouncementSerializer, TicketAssignmentHistorySerializer, TicketNoteSerializer, TicketSerializer

User = get_user_model()


class AllTicketsView(APIView):
    """
    GET /api/v1/support/tickets/
    Returns all tickets, ordered by creation date descending.
    Supports ?status= and ?priority= query params for filtering.
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def get(self, request):
        qs = Ticket.objects.all().order_by("-created_at")
        status = request.query_params.get("status")
        priority = request.query_params.get("priority")
        if status:
            qs = qs.filter(status=status.upper())
        if priority:
            qs = qs.filter(priority=priority.upper())
        serializer = TicketSerializer(qs, many=True, context={"request": request})
        return Response({"count": qs.count(), "results": serializer.data})

    def post(self, request):
        title = request.data.get("title", "").strip()
        description = request.data.get("description", "").strip()
        attachment = request.FILES.get("attachment")

        if not title:
            return Response({"error": "VALIDATION_ERROR", "message": "Subject is required."}, status=400)
        if not description:
            return Response({"error": "VALIDATION_ERROR", "message": "Details are required."}, status=400)

        ticket = Ticket.objects.create(
            title=title,
            description=description,
            status=TicketStatus.NEW,
            customer=request.user,
            attachment=attachment,
        )
        serializer = TicketSerializer(ticket, context={"request": request})
        return Response(serializer.data, status=201)


class SupportAgentsView(APIView):
    """
    GET /api/v1/support/agents/
    Returns all users with the SUPPORT role.
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def get(self, request):
        agents = User.objects.filter(profile__role=UserRoleChoices.SUPPORT).order_by("first_name", "username")
        data = [
            {
                "id": u.pk,
                "username": u.username,
                "firstName": u.first_name,
                "lastName": u.last_name,
            }
            for u in agents
        ]
        return Response(data)


class MyTicketsView(APIView):
    """
    GET /api/v1/support/my-tickets/
    Returns tickets submitted by the requesting user, newest first.
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def get(self, request):
        tickets = Ticket.objects.filter(customer=request.user).order_by("-created_at")
        serializer = TicketSerializer(tickets, many=True, context={"request": request})
        return Response({"count": tickets.count(), "results": serializer.data})


class NewTicketsView(APIView):
    """
    GET /api/v1/support/tickets/new/
    Returns all tickets with status NEW, ordered by creation date descending.
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def get(self, request):
        tickets = Ticket.objects.filter(status=TicketStatus.NEW)
        serializer = TicketSerializer(tickets, many=True, context={"request": request})
        return Response({"count": tickets.count(), "results": serializer.data})


class AssignedTicketsView(APIView):
    """
    GET /api/v1/support/tickets/assigned/
    Returns tickets assigned to the requesting user.
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def get(self, request):
        tickets = Ticket.objects.filter(assigned_to=request.user)
        serializer = TicketSerializer(tickets, many=True, context={"request": request})
        return Response({"count": tickets.count(), "results": serializer.data})


class TicketDetailView(APIView):
    """
    GET  /api/v1/support/tickets/{id}/
    PATCH /api/v1/support/tickets/{id}/  — update status, priority, or assignment
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def _get_ticket(self, ticket_id):
        try:
            return Ticket.objects.get(pk=ticket_id)
        except Ticket.DoesNotExist:
            return None

    def get(self, request, ticket_id):
        ticket = self._get_ticket(ticket_id)
        if ticket is None:
            return Response({"error": "NOT_FOUND", "message": "Ticket not found."}, status=404)
        serializer = TicketSerializer(ticket, context={"request": request})
        return Response(serializer.data)

    def patch(self, request, ticket_id):
        ticket = self._get_ticket(ticket_id)
        if ticket is None:
            return Response({"error": "NOT_FOUND", "message": "Ticket not found."}, status=404)

        status_val = request.data.get("status")
        priority_val = request.data.get("priority")

        if status_val is not None:
            if status_val not in TicketStatus.values:
                return Response({"error": "VALIDATION_ERROR", "message": "Invalid status."}, status=400)
            ticket.status = status_val

        if priority_val is not None:
            if priority_val not in TicketPriority.values:
                return Response({"error": "VALIDATION_ERROR", "message": "Invalid priority."}, status=400)
            ticket.priority = priority_val

        assignment_changed = False
        old_assigned_to = ticket.assigned_to
        if "assignedToId" in request.data:
            assigned_id = request.data["assignedToId"]
            if assigned_id is None:
                new_assigned_to = None
            else:
                try:
                    new_assigned_to = User.objects.get(pk=assigned_id)
                except User.DoesNotExist:
                    return Response({"error": "VALIDATION_ERROR", "message": "User not found."}, status=400)
            if (new_assigned_to and new_assigned_to != old_assigned_to) or (not new_assigned_to and old_assigned_to):
                ticket.assigned_to = new_assigned_to
                assignment_changed = True

        if "caseNotes" in request.data:
            ticket.case_notes = request.data["caseNotes"]

        ticket.save()

        if assignment_changed:
            TicketAssignmentHistory.objects.create(
                ticket=ticket,
                assigned_from=old_assigned_to,
                assigned_to=ticket.assigned_to,
                changed_by=request.user,
            )
        serializer = TicketSerializer(ticket, context={"request": request})
        return Response(serializer.data)


class FeatureRequestView(APIView):
    """
    POST /api/v1/support/feature-request/
    Creates a FEATURE type BacklogItem on behalf of the requesting user.
    Accessible to BUSINESS, EXECUTIVE, and SUPPORT roles.
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def post(self, request):
        title = request.data.get("title", "").strip()
        description = request.data.get("description", "").strip()
        priority = request.data.get("priority", "MEDIUM")

        if not title:
            return Response({"error": "VALIDATION_ERROR", "message": "Title is required."}, status=400)
        if not description:
            return Response({"error": "VALIDATION_ERROR", "message": "Description is required."}, status=400)
        if priority not in TicketPriority.values:
            return Response({"error": "VALIDATION_ERROR", "message": "Invalid priority."}, status=400)

        item = BacklogItem.objects.create(
            title=title,
            item_type=BacklogItemType.FEATURE,
            priority=priority,
            description=description,
            created_by=request.user,
        )
        return Response(BacklogItemSerializer(item).data, status=201)


class TicketNoteListView(APIView):
    """
    GET  /api/v1/support/tickets/{id}/notes/  — list all notes for a ticket
    POST /api/v1/support/tickets/{id}/notes/  — add a note (author = requesting user)
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def _get_ticket(self, ticket_id):
        try:
            return Ticket.objects.get(pk=ticket_id)
        except Ticket.DoesNotExist:
            return None

    def get(self, request, ticket_id):
        ticket = self._get_ticket(ticket_id)
        if ticket is None:
            return Response({"error": "NOT_FOUND", "message": "Ticket not found."}, status=404)
        notes = ticket.notes.all()
        return Response({"count": notes.count(), "results": TicketNoteSerializer(notes, many=True).data})

    def post(self, request, ticket_id):
        ticket = self._get_ticket(ticket_id)
        if ticket is None:
            return Response({"error": "NOT_FOUND", "message": "Ticket not found."}, status=404)
        body = request.data.get("body", "").strip()
        if not body:
            return Response({"error": "VALIDATION_ERROR", "message": "Note cannot be empty."}, status=400)
        note = TicketNote.objects.create(ticket=ticket, author=request.user, body=body)
        return Response(TicketNoteSerializer(note).data, status=201)


class TicketNoteDetailView(APIView):
    """
    PATCH  /api/v1/support/tickets/{id}/notes/{note_id}/  — edit note body
    DELETE /api/v1/support/tickets/{id}/notes/{note_id}/  — delete note
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def _get_note(self, ticket_id, note_id):
        try:
            return TicketNote.objects.get(pk=note_id, ticket_id=ticket_id)
        except TicketNote.DoesNotExist:
            return None

    def patch(self, request, ticket_id, note_id):
        note = self._get_note(ticket_id, note_id)
        if note is None:
            return Response({"error": "NOT_FOUND", "message": "Note not found."}, status=404)
        body = request.data.get("body", "").strip()
        if not body:
            return Response({"error": "VALIDATION_ERROR", "message": "Note cannot be empty."}, status=400)
        note.body = body
        note.save()
        return Response(TicketNoteSerializer(note).data)

    def delete(self, request, ticket_id, note_id):
        note = self._get_note(ticket_id, note_id)
        if note is None:
            return Response({"error": "NOT_FOUND", "message": "Note not found."}, status=404)
        note.delete()
        return Response(status=204)


class BacklogItemListView(APIView):
    """
    GET  /api/v1/support/backlog/   — list all items; ?type= and ?status= filters
    POST /api/v1/support/backlog/   — create a new item
    """
    permission_classes = [IsAuthenticated, IsSupportUser]

    def get(self, request):
        qs = BacklogItem.objects.filter(is_archived=False)
        type_filter = request.query_params.get("type")
        status_filter = request.query_params.get("status")
        if type_filter:
            qs = qs.filter(item_type=type_filter.upper())
        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        serializer = BacklogItemSerializer(qs, many=True)
        return Response({"count": qs.count(), "results": serializer.data})

    def post(self, request):
        title = request.data.get("title", "").strip()
        item_type = request.data.get("itemType", "BUG")
        priority = request.data.get("priority", "MEDIUM")
        description = request.data.get("description", "").strip()

        if not title:
            return Response({"error": "VALIDATION_ERROR", "message": "Title is required."}, status=400)
        if item_type not in BacklogItemType.values:
            return Response({"error": "VALIDATION_ERROR", "message": "Invalid type."}, status=400)
        if priority not in TicketPriority.values:
            return Response({"error": "VALIDATION_ERROR", "message": "Invalid priority."}, status=400)

        item = BacklogItem.objects.create(
            title=title,
            item_type=item_type,
            priority=priority,
            description=description,
            created_by=request.user,
        )
        return Response(BacklogItemSerializer(item).data, status=201)


class BacklogItemDetailView(APIView):
    """
    PATCH /api/v1/support/backlog/{id}/  — update title, description, status, priority, or notes
    DELETE /api/v1/support/backlog/{id}/ — remove an item
    """
    permission_classes = [IsAuthenticated, IsSupportUser]

    def _get_item(self, item_id):
        try:
            return BacklogItem.objects.get(pk=item_id)
        except BacklogItem.DoesNotExist:
            return None

    def get(self, request, item_id):
        item = self._get_item(item_id)
        if item is None:
            return Response({"error": "NOT_FOUND", "message": "Item not found."}, status=404)
        return Response(BacklogItemSerializer(item).data)

    def patch(self, request, item_id):
        item = self._get_item(item_id)
        if item is None:
            return Response({"error": "NOT_FOUND", "message": "Item not found."}, status=404)

        if "title" in request.data:
            item.title = request.data["title"].strip()
        if "description" in request.data:
            item.description = request.data["description"]
        if "notes" in request.data:
            item.notes = request.data["notes"]
        if "status" in request.data:
            if request.data["status"] not in BacklogItemStatus.values:
                return Response({"error": "VALIDATION_ERROR", "message": "Invalid status."}, status=400)
            item.status = request.data["status"]
        if "priority" in request.data:
            if request.data["priority"] not in TicketPriority.values:
                return Response({"error": "VALIDATION_ERROR", "message": "Invalid priority."}, status=400)
            item.priority = request.data["priority"]
        if "itemType" in request.data:
            if request.data["itemType"] not in BacklogItemType.values:
                return Response({"error": "VALIDATION_ERROR", "message": "Invalid type."}, status=400)
            item.item_type = request.data["itemType"]

        if "isArchived" in request.data:
            item.is_archived = bool(request.data["isArchived"])

        item.save()

        if "addTicketId" in request.data:
            try:
                ticket = Ticket.objects.get(pk=request.data["addTicketId"])
                item.linked_tickets.add(ticket)
            except Ticket.DoesNotExist:
                return Response({"error": "VALIDATION_ERROR", "message": f"Ticket #{request.data['addTicketId']} not found."}, status=400)

        if "removeTicketId" in request.data:
            try:
                ticket = Ticket.objects.get(pk=request.data["removeTicketId"])
                item.linked_tickets.remove(ticket)
            except Ticket.DoesNotExist:
                pass

        return Response(BacklogItemSerializer(item).data)

    def delete(self, request, item_id):
        item = self._get_item(item_id)
        if item is None:
            return Response({"error": "NOT_FOUND", "message": "Item not found."}, status=404)
        item.delete()
        return Response(status=204)


class TicketAssignmentHistoryView(APIView):
    """
    GET /api/v1/support/tickets/{id}/assignments/
    Returns the reassignment history for a ticket, newest first.
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def get(self, request, ticket_id):
        try:
            ticket = Ticket.objects.get(pk=ticket_id)
        except Ticket.DoesNotExist:
            return Response({"error": "NOT_FOUND", "message": "Ticket not found."}, status=404)
        history = ticket.assignment_history.all()
        return Response({"results": TicketAssignmentHistorySerializer(history, many=True).data})


class TeamAnnouncementListView(APIView):
    """
    GET  /api/v1/support/announcements/  — list active announcements
    POST /api/v1/support/announcements/  — create a new announcement
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def get(self, request):
        announcements = TeamAnnouncement.objects.filter(is_active=True)
        return Response({"results": TeamAnnouncementSerializer(announcements, many=True).data})

    def post(self, request):
        body = request.data.get("body", "").strip()
        if not body:
            return Response({"error": "VALIDATION_ERROR", "message": "Announcement body is required."}, status=400)
        announcement = TeamAnnouncement.objects.create(body=body, created_by=request.user)
        return Response(TeamAnnouncementSerializer(announcement).data, status=201)


class TeamAnnouncementDetailView(APIView):
    """
    DELETE /api/v1/support/announcements/{pk}/  — dismiss/remove an announcement
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def delete(self, request, pk):
        try:
            announcement = TeamAnnouncement.objects.get(pk=pk)
        except TeamAnnouncement.DoesNotExist:
            return Response({"error": "NOT_FOUND", "message": "Announcement not found."}, status=404)
        announcement.delete()
        return Response(status=204)


class KnowledgeArticleListView(APIView):
    """
    GET  /api/v1/support/knowledge/  — list all articles; ?category= filter
    POST /api/v1/support/knowledge/  — create a new article
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def get(self, request):
        qs = KnowledgeArticle.objects.all()
        category = request.query_params.get("category")
        if category:
            qs = qs.filter(category__iexact=category)
        return Response({"results": KnowledgeArticleSerializer(qs, many=True).data})

    def post(self, request):
        title = request.data.get("title", "").strip()
        body = request.data.get("body", "").strip()
        category = request.data.get("category", "").strip()
        if not title:
            return Response({"error": "VALIDATION_ERROR", "message": "Title is required."}, status=400)
        if not body:
            return Response({"error": "VALIDATION_ERROR", "message": "Body is required."}, status=400)
        article = KnowledgeArticle.objects.create(
            title=title, body=body, category=category, created_by=request.user
        )
        return Response(KnowledgeArticleSerializer(article).data, status=201)


class KnowledgeArticleDetailView(APIView):
    """
    GET    /api/v1/support/knowledge/{pk}/  — retrieve an article
    PATCH  /api/v1/support/knowledge/{pk}/  — update title, body, or category
    DELETE /api/v1/support/knowledge/{pk}/  — delete an article
    """
    permission_classes = [IsAuthenticated, IsBusinessOrExecutive]

    def _get_article(self, pk):
        try:
            return KnowledgeArticle.objects.get(pk=pk)
        except KnowledgeArticle.DoesNotExist:
            return None

    def get(self, request, pk):
        article = self._get_article(pk)
        if article is None:
            return Response({"error": "NOT_FOUND", "message": "Article not found."}, status=404)
        return Response(KnowledgeArticleSerializer(article).data)

    def patch(self, request, pk):
        article = self._get_article(pk)
        if article is None:
            return Response({"error": "NOT_FOUND", "message": "Article not found."}, status=404)
        if "title" in request.data:
            article.title = request.data["title"].strip()
        if "body" in request.data:
            article.body = request.data["body"]
        if "category" in request.data:
            article.category = request.data["category"].strip()
        article.save()
        return Response(KnowledgeArticleSerializer(article).data)

    def delete(self, request, pk):
        article = self._get_article(pk)
        if article is None:
            return Response({"error": "NOT_FOUND", "message": "Article not found."}, status=404)
        article.delete()
        return Response(status=204)
