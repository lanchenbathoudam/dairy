"""Views for Supply & Buyer APIs."""
from decimal import Decimal
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.db.models import Sum

from .models import Buyer, MilkRate, SupplyRecord
from .serializers import BuyerSerializer, MilkRateSerializer, SupplyRecordSerializer
from apps.accounts.permissions import IsRecorderOrAdmin, IsAdminRole
from apps.production.models import MilkRecord
from apps.audit.utils import log_audit_event

class SupplyRecordFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='supply_date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='supply_date', lookup_expr='lte')

    class Meta:
        model = SupplyRecord
        fields = ['buyer', 'supply_date', 'session', 'date_from', 'date_to']


class BuyerViewSet(viewsets.ModelViewSet):
    """CRUD API for wholesale buyer accounts."""
    queryset = Buyer.objects.all().order_by('-is_active', 'name')
    serializer_class = BuyerSerializer
    permission_classes = [IsRecorderOrAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'phone']


class MilkRateViewSet(viewsets.ModelViewSet):
    """API for pricing rates per litre."""
    queryset = MilkRate.objects.all().order_by('-effective_from')
    serializer_class = MilkRateSerializer

    def get_permissions(self):
        # Changing pricing rate requires ADMIN
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [IsAdminRole()]
        return [IsRecorderOrAdmin()]

    @action(detail=False, methods=['get'], url_path='current')
    def current_rate(self, request):
        """Returns the currently active rate."""
        rate = self.queryset.first()
        if not rate:
            return Response({"rate_per_litre": "42.00", "notes": "Default fallback rate"})
        return Response(self.get_serializer(rate).data)


class SupplyRecordViewSet(viewsets.ModelViewSet):
    """API for milk dispatches to wholesale buyer."""
    queryset = SupplyRecord.objects.select_related('buyer', 'rate').all().order_by('-supply_date', '-session')
    serializer_class = SupplyRecordSerializer
    permission_classes = [IsRecorderOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = SupplyRecordFilter
    ordering_fields = ['supply_date', 'quantity_litres', 'total_amount']

    def perform_create(self, serializer):
        rec = serializer.save()
        log_audit_event(
            self.request,
            entity="SupplyRecord",
            record_id=str(rec.id),
            action="CREATE",
            change_summary={
                "buyer": rec.buyer.name,
                "date": str(rec.supply_date),
                "litres": str(rec.quantity_litres),
                "rate": str(rec.rate_per_litre_applied),
                "amount": str(rec.total_amount)
            }
        )

    @action(detail=False, methods=['get'], url_path='reconciliation')
    def reconciliation(self, request):
        """
        Reconciles produced milk vs supplied milk for a given date or date range.
        Shows produced litres, supplied litres, and variance (household/waste).
        """
        date_str = request.query_params.get('date')
        date_from_str = request.query_params.get('date_from')
        date_to_str = request.query_params.get('date_to')

        prod_qs = MilkRecord.objects.all()
        supp_qs = SupplyRecord.objects.all()

        if date_str:
            prod_qs = prod_qs.filter(production_date=date_str)
            supp_qs = supp_qs.filter(supply_date=date_str)
        elif date_from_str and date_to_str:
            prod_qs = prod_qs.filter(production_date__gte=date_from_str, production_date__lte=date_to_str)
            supp_qs = supp_qs.filter(supply_date__gte=date_from_str, supply_date__lte=date_to_str)

        produced_litres = prod_qs.aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')
        supplied_litres = supp_qs.aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')
        retained_litres = max(Decimal('0.00'), produced_litres - supplied_litres)

        return Response({
            "filter_applied": {"date": date_str, "date_from": date_from_str, "date_to": date_to_str},
            "produced_litres": str(produced_litres),
            "supplied_litres": str(supplied_litres),
            "retained_litres": str(retained_litres),
            "reconciliation_status": "BALANCED" if produced_litres >= supplied_litres else "OVER_SUPPLY_WARNING"
        })
