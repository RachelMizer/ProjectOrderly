from django.urls import path
from .views import (
    AllTicketsView, MyTicketsView, NewTicketsView, AssignedTicketsView,
    TicketDetailView, SupportAgentsView,
    FeatureRequestView,
    TicketNoteListView, TicketNoteDetailView,
    TicketAssignmentHistoryView,
    BacklogItemListView, BacklogItemDetailView,
    TeamAnnouncementListView, TeamAnnouncementDetailView,
    KnowledgeArticleListView, KnowledgeArticleDetailView,
)

urlpatterns = [
    path("tickets/", AllTicketsView.as_view()),
    path("tickets/new/", NewTicketsView.as_view()),
    path("tickets/assigned/", AssignedTicketsView.as_view()),
    path("tickets/<int:ticket_id>/", TicketDetailView.as_view()),
    path("tickets/<int:ticket_id>/notes/", TicketNoteListView.as_view()),
    path("tickets/<int:ticket_id>/notes/<int:note_id>/", TicketNoteDetailView.as_view()),
    path("tickets/<int:ticket_id>/assignments/", TicketAssignmentHistoryView.as_view()),
    path("feature-request/", FeatureRequestView.as_view()),
    path("my-tickets/", MyTicketsView.as_view()),
    path("agents/", SupportAgentsView.as_view()),
    path("backlog/", BacklogItemListView.as_view()),
    path("backlog/<int:item_id>/", BacklogItemDetailView.as_view()),
    path("announcements/", TeamAnnouncementListView.as_view()),
    path("announcements/<int:pk>/", TeamAnnouncementDetailView.as_view()),
    path("knowledge/", KnowledgeArticleListView.as_view()),
    path("knowledge/<int:pk>/", KnowledgeArticleDetailView.as_view()),
]
