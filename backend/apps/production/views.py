"""Views for Milk Production & Session collection."""
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Avg, Count
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import MilkRecord, MilkCollection
from .serializers import (
    MilkRecordSerializer, MilkCollectionSerializer,
    BatchSessionSubmissionSerializer
)
from apps.cows.models import Cow
from apps.accounts.permissions import IsRecorderOrAdmin
from apps.audit.utils import log_audit_event

class MilkRecordFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='production_date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='production_date', lookup_expr='lte')
    cow_code = django_filters.CharFilter(field_name='cow__cow_code', lookup_expr='iexact')

    class Meta:
        model = MilkRecord
        fields = ['production_date', 'session', 'cow', 'date_from', 'date_to', 'cow_code']


class MilkRecordViewSet(viewsets.ModelViewSet):
    """
    CRUD API for individual milk yield records.
    Filters: production_date, session, cow, date_from, date_to, cow_code.
    """
    queryset = MilkRecord.objects.select_related('cow', 'entered_by').all().order_by('-production_date', '-session', 'cow__cow_code')
    serializer_class = MilkRecordSerializer
    permission_classes = [IsRecorderOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MilkRecordFilter
    search_fields = ['cow__cow_code', 'cow__display_name', 'notes']
    ordering_fields = ['production_date', 'session', 'quantity_litres', 'created_at']

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        rec = serializer.save(entered_by=user)
        log_audit_event(
            self.request,
            entity="MilkRecord",
            record_id=str(rec.id),
            action="CREATE",
            change_summary={"cow": rec.cow.cow_code, "date": str(rec.production_date), "session": rec.session, "litres": str(rec.quantity_litres)}
        )

    def perform_update(self, serializer):
        rec = serializer.save()
        log_audit_event(
            self.request,
            entity="MilkRecord",
            record_id=str(rec.id),
            action="UPDATE",
            change_summary={"cow": rec.cow.cow_code, "litres": str(rec.quantity_litres), "session": rec.session}
        )

    @action(detail=False, methods=['post'], url_path='batch-session')
    def batch_session(self, request):
        """
        Submits barn session entries for multiple cows atomically.
        Calculates session total on the server within a database transaction.
        """
        serializer = BatchSessionSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        prod_date = data['production_date']
        session_choice = data['session']
        notes = data.get('notes', '')
        entries = data['entries']

        with transaction.atomic():
            # Get or create MilkCollection session header
            collection, _ = MilkCollection.objects.get_or_create(
                collection_date=prod_date,
                session=session_choice,
                defaults={'notes': notes, 'status': 'COMPLETED'}
            )
            if notes:
                collection.notes = notes
                collection.save(update_fields=['notes'])

            total_session_litres = Decimal('0.00')
            created_or_updated_count = 0
            user = request.user if request.user.is_authenticated else None

            for item in entries:
                cow_id = item['cow_id']
                qty = item['quantity_litres']
                try:
                    cow = Cow.objects.get(id=cow_id)
                except Cow.DoesNotExist:
                    continue

                # Update or create record
                record, created = MilkRecord.objects.update_or_create(
                    cow=cow,
                    production_date=prod_date,
                    session=session_choice,
                    defaults={
                        'quantity_litres': qty,
                        'entered_by': user,
                    }
                )
                total_session_litres += qty
                created_or_updated_count += 1

            # Log audit event
            log_audit_event(
                request,
                entity="MilkCollection",
                record_id=str(collection.id),
                action="BATCH_SESSION_SUBMIT",
                change_summary={
                    "date": str(prod_date),
                    "session": session_choice,
                    "total_litres": str(total_session_litres),
                    "cow_count": created_or_updated_count
                }
            )

        return Response({
            "detail": f"Successfully recorded {session_choice} session for {created_or_updated_count} cows.",
            "collection_id": collection.id,
            "production_date": str(prod_date),
            "session": session_choice,
            "total_litres": f"{total_session_litres:.2f}",
            "cow_count": created_or_updated_count,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='summary/daily')
    def daily_summary(self, request):
        """
        Returns morning, evening and total production breakdown for a given date.
        """
        target_date_str = request.query_params.get('date')
        if target_date_str:
            try:
                target_date = timezone.datetime.strptime(target_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({"error": "Invalid date format. Expected YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            target_date = timezone.now().date()

        records = MilkRecord.objects.filter(production_date=target_date)
        morning_total = records.filter(session='MORNING').aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')
        evening_total = records.filter(session='EVENING').aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')
        total_litres = morning_total + evening_total

        total_active_cows = Cow.objects.filter(status='ACTIVE').count()
        producing_cows = records.values('cow').distinct().count()

        return Response({
            "date": str(target_date),
            "morning_litres": f"{morning_total:.2f}",
            "evening_litres": f"{evening_total:.2f}",
            "daily_total_litres": f"{total_litres:.2f}",
            "active_cows": total_active_cows,
            "producing_cows": producing_cows,
            "missing_entries": max(0, total_active_cows - producing_cows),
        })


class MilkCollectionViewSet(viewsets.ModelViewSet):
    """
    CRUD API for MilkCollection session summaries.
    """
    queryset = MilkCollection.objects.all().order_by('-collection_date', '-session')
    serializer_class = MilkCollectionSerializer
    permission_classes = [IsRecorderOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['collection_date', 'session', 'status']
