from django.urls import path
from .views import (
    ShiftListCreateView,
    ShiftDetailView,
    ScheduleMonthView,
    ShiftAssignmentCreateView,
    ShiftAssignmentDeleteView,
)

urlpatterns = [
    path("shifts/", ShiftListCreateView.as_view(), name="shift-list-create"),
    path("shifts/<int:shift_id>/", ShiftDetailView.as_view(), name="shift-detail"),
    path("month/", ScheduleMonthView.as_view(), name="schedule-month"),
    path("assignments/", ShiftAssignmentCreateView.as_view(), name="shift-assignment-create"),
    path("assignments/<int:assignment_id>/", ShiftAssignmentDeleteView.as_view(), name="shift-assignment-delete"),
]
