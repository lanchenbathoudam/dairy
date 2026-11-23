"""Views for Finance & Ledger APIs."""
from decimal import Decimal
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.db.models import Sum

from .models import Payment, FarmExpense
from .serializers import PaymentSerializer, FarmExpenseSerializer
from apps.supply.models import SupplyRecord
from apps.accounts.permissions import IsRecorderOrAdmin
from apps.audit.utils import log_audit_event

class PaymentFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='payment_date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='payment_date', lookup_expr='lte')

    class Meta:
        model = Payment
        fields = ['buyer', 'payment_date', 'method', 'date_from', 'date_to']


class PaymentViewSet(viewsets.ModelViewSet):
    """API for Buyer payment receipts and balance calculations."""
    queryset = Payment.objects.select_related('buyer').all().order_by('-payment_date', '-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [IsRecorderOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = PaymentFilter
    ordering_fields = ['payment_date', 'amount']

    def perform_create(self, serializer):
        payment = serializer.save()
        log_audit_event(
            self.request,
            entity="Payment",
            record_id=str(payment.id),
            action="CREATE",
            change_summary={
                "buyer": payment.buyer.name,
                "amount": str(payment.amount),
                "date": str(payment.payment_date),
                "method": payment.method
            }
        )

    @action(detail=False, methods=['get'], url_path='summary')
    def financial_summary(self, request):
        """
        Calculates total billed, total paid, and net outstanding balance across all wholesale supply.
        """
        buyer_id = request.query_params.get('buyer')
        supp_qs = SupplyRecord.objects.all()
        pay_qs = Payment.objects.all()

        if buyer_id:
            supp_qs = supp_qs.filter(buyer_id=buyer_id)
            pay_qs = pay_qs.filter(buyer_id=buyer_id)

        total_billed = supp_qs.aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0.00')
        total_paid = pay_qs.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
        outstanding = total_billed - total_paid

        return Response({
            "total_billed": f"{total_billed:.2f}",
            "total_paid": f"{total_paid:.2f}",
            "outstanding_balance": f"{outstanding:.2f}",
            "currency": "INR",
        })


class FarmExpenseViewSet(viewsets.ModelViewSet):
    """API for tracking operational farm expenses."""
    queryset = FarmExpense.objects.all().order_by('-expense_date', '-created_at')
    serializer_class = FarmExpenseSerializer
    permission_classes = [IsRecorderOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'expense_date']
