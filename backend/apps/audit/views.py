"""Views for Audit Log retrieval."""
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.accounts.permissions import IsAdminRole

class AuditLogListView(generics.ListAPIView):
    """
    GET /api/audit/
    Lists immutable audit log entries. Admin role only.
    """
    queryset = AuditLog.objects.select_related('user').all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['entity_name', 'action', 'user']
    search_fields = ['record_id', 'change_summary']
