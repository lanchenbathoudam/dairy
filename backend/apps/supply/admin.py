from django.contrib import admin
from .models import Buyer, MilkRate, SupplyRecord

@admin.register(Buyer)
class BuyerAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'phone', 'is_active']
    list_filter = ['is_active']

@admin.register(MilkRate)
class MilkRateAdmin(admin.ModelAdmin):
    list_display = ['rate_per_litre', 'effective_from', 'effective_to']
    ordering = ['-effective_from']

@admin.register(SupplyRecord)
class SupplyRecordAdmin(admin.ModelAdmin):
    list_display = ['supply_date', 'session', 'buyer', 'quantity_litres', 'rate_per_litre_applied', 'total_amount']
    list_filter = ['supply_date', 'session', 'buyer']
