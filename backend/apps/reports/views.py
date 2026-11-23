"""Report generation and CSV exports for DairyTrack."""
import csv
from decimal import Decimal
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from apps.production.models import MilkRecord
from apps.supply.models import SupplyRecord
from apps.finance.models import Payment

class ProductionCSVExportView(APIView):
    """
    GET /api/reports/production/csv/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
    Generates downloadable CSV of milk production records.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        qs = MilkRecord.objects.select_related('cow', 'entered_by').all().order_by('production_date', 'session', 'cow__cow_code')
        if date_from:
            qs = qs.filter(production_date__gte=date_from)
        if date_to:
            qs = qs.filter(production_date__lte=date_to)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="dairytrack_production_{timezone.now().date()}.csv"'

        writer = csv.writer(response)
        writer.writerow(['Record ID', 'Production Date', 'Session', 'Cow Code', 'Cow Name', 'Quantity (Litres)', 'Recorded By', 'Recorded At'])

        for r in qs:
            writer.writerow([
                r.id,
                r.production_date.isoformat(),
                r.session,
                r.cow.cow_code,
                r.cow.display_name,
                str(r.quantity_litres),
                r.entered_by.username if r.entered_by else 'Barn Staff',
                r.created_at.isoformat(),
            ])

        return response


class SupplyCSVExportView(APIView):
    """
    GET /api/reports/supply/csv/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
    Generates downloadable CSV of wholesale dispatches.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        qs = SupplyRecord.objects.select_related('buyer', 'rate').all().order_by('supply_date', 'session')
        if date_from:
            qs = qs.filter(supply_date__gte=date_from)
        if date_to:
            qs = qs.filter(supply_date__lte=date_to)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="dairytrack_supply_{timezone.now().date()}.csv"'

        writer = csv.writer(response)
        writer.writerow(['Supply ID', 'Date', 'Session', 'Buyer Name', 'Quantity (Litres)', 'Rate Applied (INR/L)', 'Total Billed (INR)', 'Recorded At'])

        for s in qs:
            writer.writerow([
                s.id,
                s.supply_date.isoformat(),
                s.session,
                s.buyer.name,
                str(s.quantity_litres),
                str(s.rate_per_litre_applied),
                str(s.total_amount),
                s.created_at.isoformat(),
            ])

        return response


class PeriodicSummaryReportView(APIView):
    """
    GET /api/reports/summary/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
    Returns comprehensive summary metrics for printing or formal reporting.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_from = request.query_params.get('date_from') or (timezone.now().date() - timezone.timedelta(days=30)).isoformat()
        date_to = request.query_params.get('date_to') or timezone.now().date().isoformat()

        prod_qs = MilkRecord.objects.filter(production_date__gte=date_from, production_date__lte=date_to)
        supp_qs = SupplyRecord.objects.filter(supply_date__gte=date_from, supply_date__lte=date_to)
        pay_qs = Payment.objects.filter(payment_date__gte=date_from, payment_date__lte=date_to)

        total_produced = prod_qs.aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')
        total_supplied = supp_qs.aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')
        total_billed = supp_qs.aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0.00')
        total_paid = pay_qs.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')

        return Response({
            "period": {"date_from": date_from, "date_to": date_to},
            "production": {
                "total_produced_litres": str(total_produced),
                "recorded_entries": prod_qs.count(),
            },
            "wholesale": {
                "total_supplied_litres": str(total_supplied),
                "retained_litres": str(max(Decimal('0.00'), total_produced - total_supplied)),
                "total_billed_inr": str(total_billed),
                "total_received_inr": str(total_paid),
                "period_net_receivable_inr": str(total_billed - total_paid),
            }
        })
