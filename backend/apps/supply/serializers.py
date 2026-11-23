"""Serializers for Supply & Wholesale Buyer app."""
from decimal import Decimal
from django.db.models import Q
from rest_framework import serializers
from .models import Buyer, MilkRate, SupplyRecord

class BuyerSerializer(serializers.ModelSerializer):
    total_supplied_litres = serializers.SerializerMethodField()
    total_billed_amount = serializers.SerializerMethodField()

    class Meta:
        model = Buyer
        fields = ['id', 'name', 'phone', 'address', 'is_active', 'created_at', 'total_supplied_litres', 'total_billed_amount']
        read_only_fields = ['id', 'created_at', 'total_supplied_litres', 'total_billed_amount']

    def get_total_supplied_litres(self, obj):
        from django.db.models import Sum
        total = SupplyRecord.objects.filter(buyer=obj).aggregate(Sum('quantity_litres'))['quantity_litres__sum']
        return str(total or '0.00')

    def get_total_billed_amount(self, obj):
        from django.db.models import Sum
        total = SupplyRecord.objects.filter(buyer=obj).aggregate(Sum('total_amount'))['total_amount__sum']
        return str(total or '0.00')


class MilkRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MilkRate
        fields = ['id', 'rate_per_litre', 'effective_from', 'effective_to', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_rate_per_litre(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Rate per litre must be greater than zero.")
        return value


class SupplyRecordSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.name', read_only=True)

    class Meta:
        model = SupplyRecord
        fields = [
            'id', 'buyer', 'buyer_name', 'supply_date', 'session',
            'quantity_litres', 'rate', 'rate_per_litre_applied',
            'total_amount', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'rate', 'rate_per_litre_applied', 'total_amount']

    def create(self, validated_data):
        supply_date = validated_data.get('supply_date')
        qty = validated_data.get('quantity_litres')

        rate_obj = MilkRate.objects.filter(
            Q(effective_to__isnull=True) | Q(effective_to__gte=supply_date),
            effective_from__lte=supply_date,
        ).order_by('-effective_from').first()

        if not rate_obj:
            rate_obj = MilkRate.objects.order_by('-effective_from').first()

        rate_val = rate_obj.rate_per_litre if rate_obj else Decimal('42.00')
        validated_data['rate'] = rate_obj
        validated_data['rate_per_litre_applied'] = rate_val
        validated_data['total_amount'] = (qty * rate_val).quantize(Decimal('0.01'))

        return super().create(validated_data)
