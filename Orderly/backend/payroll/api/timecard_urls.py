from django.urls import path
from .timecard_views import TimecardView, PunchCreateView, PunchDetailView

urlpatterns = [
    path("<int:user_id>/", TimecardView.as_view(), name="timecard"),
    path("<int:user_id>/punches/", PunchCreateView.as_view(), name="punch-create"),
    path("punches/<int:punch_id>/", PunchDetailView.as_view(), name="punch-detail"),
]
