from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BuyerViewSet, MilkRateViewSet, SupplyRecordViewSet

router = DefaultRouter()
router.register(r'buyers', BuyerViewSet, basename='buyer')
router.register(r'rates', MilkRateViewSet, basename='milk-rate')
router.register(r'records', SupplyRecordViewSet, basename='supply-record')

urlpatterns = [
    path('', include(router.urls)),
]
