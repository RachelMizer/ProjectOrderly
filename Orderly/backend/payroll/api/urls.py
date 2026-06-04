from django.urls import path
from .views import PayPeriodListCreateView, PayPeriodDetailView

urlpatterns = [
    path("", PayPeriodListCreateView.as_view(), name="pay-period-list"),
    path("<int:pk>/", PayPeriodDetailView.as_view(), name="pay-period-detail"),
]
