"""
URL configuration for orderly project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    # Catalog API public endpoints
    path("api/v1/", include("catalog.api.urls")),
    # Catalog API admin endpoints (business users only)
    path("api/v1/admin/", include("catalog.api.admin_urls")),
    # Supplier admin endpoints (business users only, RBAC protected)
    path("api/v1/admin/", include("suppliers.api.admin_urls")),
    # Inventory admin endpoints (business users only, RBAC protected)
    path("api/v1/admin/", include("inventory.api.admin_urls")),
    # Auth API
    path("api/v1/auth/", include("accounts.api.urls")),
    # User profile API
    path("api/v1/users/", include("accounts.api.urls")),
    # Orders API
    path("api/v1/orders/", include("orders.urls")),
    # Sales Reporting API
    path("api/v1/reports/", include("reporting.api.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
