"""URL configuration for DairyTrack backend (Phase 4)."""
from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """DairyTrack REST API index."""
    return Response({
        "system": "DairyTrack Dairy Farm Production & Management System",
        "version": "1.0.0-phase4",
        "endpoints": {
            "auth": {
                "login": "/api/auth/login/",
                "refresh": "/api/auth/refresh/",
                "logout": "/api/auth/logout/",
                "me": "/api/auth/me/",
            },
            "cows": "/api/cows/",
            "production": {
                "records": "/api/production/records/",
                "collections": "/api/production/collections/",
                "batch_session": "/api/production/records/batch-session/",
                "daily_summary": "/api/production/records/summary/daily/",
            },
            "supply": {
                "buyers": "/api/supply/buyers/",
                "rates": "/api/supply/rates/",
                "records": "/api/supply/records/",
                "reconciliation": "/api/supply/records/reconciliation/",
            },
            "finance": {
                "payments": "/api/finance/payments/",
                "summary": "/api/finance/payments/summary/",
                "expenses": "/api/finance/expenses/",
            },
            "analytics": {
                "dashboard": "/api/analytics/dashboard/",
                "daily": "/api/analytics/daily/",
                "cow_ranking": "/api/analytics/cow-ranking/",
            },
            "reports": {
                "production_csv": "/api/reports/production/csv/",
                "supply_csv": "/api/reports/supply/csv/",
                "summary": "/api/reports/summary/",
            },
            "audit": "/api/audit/",
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api_root'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/cows/', include('apps.cows.urls')),
    path('api/production/', include('apps.production.urls')),
    path('api/supply/', include('apps.supply.urls')),
    path('api/finance/', include('apps.finance.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/audit/', include('apps.audit.urls')),
]
