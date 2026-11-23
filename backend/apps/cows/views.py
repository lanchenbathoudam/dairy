"""Views for Cows management."""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Cow
from .serializers import CowSerializer
from apps.accounts.permissions import IsRecorderOrAdmin
from apps.production.models import MilkRecord
from apps.audit.utils import log_audit_event

class CowViewSet(viewsets.ModelViewSet):
    """
    CRUD API for cow profiles.
    Supports filtering by status, search by code/name, ordering.
    """
    queryset = Cow.objects.all().order_by('cow_code')
    serializer_class = CowSerializer
    permission_classes = [IsRecorderOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'breed']
    search_fields = ['cow_code', 'display_name', 'breed']
    ordering_fields = ['cow_code', 'joined_on', 'status', 'created_at']

    def perform_create(self, serializer):
        cow = serializer.save()
        log_audit_event(
            self.request,
            entity="Cow",
            record_id=str(cow.id),
            action="CREATE",
            change_summary={"cow_code": cow.cow_code, "status": cow.status}
        )

    def perform_update(self, serializer):
        cow = serializer.save()
        log_audit_event(
            self.request,
            entity="Cow",
            record_id=str(cow.id),
            action="UPDATE",
            change_summary={"cow_code": cow.cow_code, "status": cow.status}
        )

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Returns recent milk yield records for this cow."""
        cow = self.get_object()
        records = MilkRecord.objects.filter(cow=cow).order_by('-production_date', '-session')[:30]
        data = [
            {
                "id": r.id,
                "production_date": r.production_date.isoformat(),
                "session": r.session,
                "quantity_litres": str(r.quantity_litres),
                "recorded_at": r.created_at.isoformat(),
            }
            for r in records
        ]
        return Response(data)

    @action(detail=False, methods=['get'])
    def active_producing(self, request):
        """Returns list of active milking cows for quick session entry."""
        active_cows = self.queryset.filter(status='ACTIVE')
        serializer = self.get_serializer(active_cows, many=True)
        return Response(serializer.data)
