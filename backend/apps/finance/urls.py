from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, FarmExpenseViewSet

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'expenses', FarmExpenseViewSet, basename='farm-expense')

urlpatterns = [
    path('', include(router.urls)),
]
