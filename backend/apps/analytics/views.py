"""Analytical Aggregation APIs for DairyTrack."""
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Avg, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from apps.cows.models import Cow
from apps.production.models import MilkRecord
from apps.supply.models import SupplyRecord
from apps.finance.models import Payment

class DailyAnalyticsView(APIView):
    """
    GET /api/analytics/daily/?days=7
    Returns daily production totals, morning vs evening split over the last N days.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        days = int(request.query_params.get('days', 7))
        days = min(max(days, 1), 90)

        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days - 1)

        records = MilkRecord.objects.filter(
            production_date__gte=start_date,
            production_date__lte=end_date
        )

        daily_data = []
        curr = start_date
        while curr <= end_date:
            day_records = records.filter(production_date=curr)
            m_sum = day_records.filter(session='MORNING').aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')
            e_sum = day_records.filter(session='EVENING').aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')
            total = m_sum + e_sum

            daily_data.append({
                "date": curr.isoformat(),
                "day_name": curr.strftime('%a'),
                "morning_litres": str(m_sum),
                "evening_litres": str(e_sum),
                "total_litres": str(total),
            })
            curr += timedelta(days=1)

        return Response({
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days_count": len(daily_data),
            "series": daily_data,
        })


class CowRankingView(APIView):
    """
    GET /api/analytics/cow-ranking/?days=30
    Ranks cows by milk yield over the given time window.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)

        active_cows = Cow.objects.all()
        ranking = []

        for cow in active_cows:
            agg = MilkRecord.objects.filter(
                cow=cow,
                production_date__gte=start_date
            ).aggregate(
                total=Sum('quantity_litres'),
                avg=Avg('quantity_litres'),
                count=Count('id')
            )
            total = agg['total'] or Decimal('0.00')
            avg = agg['avg'] or Decimal('0.00')
            ranking.append({
                "cow_id": cow.id,
                "cow_code": cow.cow_code,
                "display_name": cow.display_name,
                "breed": cow.breed,
                "status": cow.status,
                "total_litres": str(total),
                "avg_per_session": f"{avg:.2f}",
                "recorded_sessions": agg['count'],
            })

        ranking.sort(key=lambda x: Decimal(x['total_litres']), reverse=True)
        for i, item in enumerate(ranking, start=1):
            item['rank'] = i

        return Response(ranking)


class DashboardSummaryView(APIView):
    """
    GET /api/analytics/dashboard/
    Single aggregate payload serving the main operational dashboard.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        seven_days_ago = today - timedelta(days=7)
        first_of_month = today.replace(day=1)

        # Cow inventory
        total_cows = Cow.objects.count()
        producing_cows = Cow.objects.filter(status='ACTIVE').count()
        dry_cows = Cow.objects.filter(status='DRY').count()
        sick_cows = Cow.objects.filter(status='SICK').count()

        # Production aggregations
        today_recs = MilkRecord.objects.filter(production_date=today)
        m_today = today_recs.filter(session='MORNING').aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')
        e_today = today_recs.filter(session='EVENING').aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')
        today_total = m_today + e_today

        yest_total = MilkRecord.objects.filter(production_date=yesterday).aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')

        week_total = MilkRecord.objects.filter(production_date__gte=seven_days_ago).aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')
        month_total = MilkRecord.objects.filter(production_date__gte=first_of_month).aggregate(Sum('quantity_litres'))['quantity_litres__sum'] or Decimal('0.00')

        # Financial balance
        total_billed = SupplyRecord.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0.00')
        total_paid = Payment.objects.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
        outstanding = total_billed - total_paid

        # Top cow over 7 days
        top_cow_data = None
        top_cow_record = (
            MilkRecord.objects.filter(production_date__gte=seven_days_ago)
            .values('cow__id', 'cow__cow_code', 'cow__display_name')
            .annotate(total=Sum('quantity_litres'))
            .order_by('-total')
            .first()
        )
        if top_cow_record:
            top_cow_data = {
                "cow_code": top_cow_record['cow__cow_code'],
                "display_name": top_cow_record['cow__display_name'],
                "weekly_litres": str(top_cow_record['total']),
            }

        return Response({
            "as_of_date": today.isoformat(),
            "production": {
                "today_morning_litres": str(m_today),
                "today_evening_litres": str(e_today),
                "today_total_litres": str(today_total),
                "yesterday_total_litres": str(yest_total),
                "week_total_litres": str(week_total),
                "month_total_litres": str(month_total),
            },
            "herd": {
                "total_cows": total_cows,
                "producing_cows": producing_cows,
                "dry_cows": dry_cows,
                "sick_cows": sick_cows,
            },
            "finance": {
                "total_billed": str(total_billed),
                "total_paid": str(total_paid),
                "outstanding_balance": str(outstanding),
            },
            "top_cow": top_cow_data,
        })
