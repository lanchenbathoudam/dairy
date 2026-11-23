from django.urls import path
from .views import DailyAnalyticsView, CowRankingView, DashboardSummaryView

urlpatterns = [
    path('daily/', DailyAnalyticsView.as_view(), name='analytics_daily'),
    path('cow-ranking/', CowRankingView.as_view(), name='analytics_cow_ranking'),
    path('dashboard/', DashboardSummaryView.as_view(), name='analytics_dashboard'),
]
