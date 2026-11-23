"""Serializers for Finance & Payments."""
from decimal import Decimal
from rest_framework import serializers
from .models import Payment, FarmExpense

class PaymentSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'buyer', 'buyer_name', 'payment_date',
            'amount', 'method', 'reference_no',
            'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Payment amount must be greater than zero.")
        return value


class FarmExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmExpense
        fields = [
            'id', 'expense_date', 'category', 'amount',
            'description', 'entered_by', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
