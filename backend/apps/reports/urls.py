from django.urls import path
from .views import ProductionCSVExportView, SupplyCSVExportView, PeriodicSummaryReportView

urlpatterns = [
    path('production/csv/', ProductionCSVExportView.as_view(), name='reports_production_csv'),
    path('supply/csv/', SupplyCSVExportView.as_view(), name='reports_supply_csv'),
    path('summary/', PeriodicSummaryReportView.as_view(), name='reports_summary'),
]
