from django.urls import path
from .admin_views import AdminSupplierListCreateView, AdminSupplierDetailView

urlpatterns = [
    path("suppliers", AdminSupplierListCreateView.as_view(), name="admin_suppliers"),
    path(
        "suppliers/<int:supplierId>",
        AdminSupplierDetailView.as_view(),
        name="admin_supplier_detail",
    ),
]