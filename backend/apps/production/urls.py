from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MilkRecordViewSet, MilkCollectionViewSet

router = DefaultRouter()
router.register(r'records', MilkRecordViewSet, basename='milk-record')
router.register(r'collections', MilkCollectionViewSet, basename='milk-collection')

urlpatterns = [
    path('', include(router.urls)),
]
