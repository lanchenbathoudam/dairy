from django.contrib import admin
from .models import Payment, FarmExpense

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['payment_date', 'buyer', 'amount', 'method', 'reference_no']
    list_filter = ['payment_date', 'method', 'buyer']

@admin.register(FarmExpense)
class FarmExpenseAdmin(admin.ModelAdmin):
    list_display = ['expense_date', 'category', 'amount', 'description']
    list_filter = ['expense_date', 'category']
