"""Serializers for Production app."""
from decimal import Decimal
from rest_framework import serializers
from .models import MilkRecord, MilkCollection
from apps.cows.models import Cow

class MilkRecordSerializer(serializers.ModelSerializer):
    cow_code = serializers.CharField(source='cow.cow_code', read_only=True)
    cow_name = serializers.CharField(source='cow.display_name', read_only=True)
    cow_breed = serializers.CharField(source='cow.breed', read_only=True)

    class Meta:
        model = MilkRecord
        fields = [
            'id', 'cow', 'cow_code', 'cow_name', 'cow_breed',
            'production_date', 'session', 'quantity_litres',
            'notes', 'entered_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_quantity_litres(self, value):
        if value < Decimal('0.00'):
            raise serializers.ValidationError("Milk quantity cannot be negative.")
        if value > Decimal('45.00'):
            raise serializers.ValidationError("Quantity exceeds realistic single-session limit (max 45.00 L).")
        return value


class MilkCollectionSerializer(serializers.ModelSerializer):
    total_litres = serializers.SerializerMethodField()
    recorded_cows_count = serializers.SerializerMethodField()

    class Meta:
        model = MilkCollection
        fields = [
            'id', 'collection_date', 'session', 'recorded_at',
            'notes', 'status', 'total_litres', 'recorded_cows_count'
        ]
        read_only_fields = ['id', 'recorded_at', 'total_litres', 'recorded_cows_count']

    def get_total_litres(self, obj):
        from django.db.models import Sum
        total = MilkRecord.objects.filter(
            production_date=obj.collection_date,
            session=obj.session
        ).aggregate(Sum('quantity_litres'))['quantity_litres__sum']
        return str(total or '0.00')

    def get_recorded_cows_count(self, obj):
        return MilkRecord.objects.filter(
            production_date=obj.collection_date,
            session=obj.session
        ).count()


class BatchSessionEntrySerializer(serializers.Serializer):
    cow_id = serializers.IntegerField()
    quantity_litres = serializers.DecimalField(max_digits=6, decimal_places=2, min_value=Decimal('0.00'), max_value=Decimal('45.00'))


class BatchSessionSubmissionSerializer(serializers.Serializer):
    production_date = serializers.DateField()
    session = serializers.ChoiceField(choices=['MORNING', 'EVENING'])
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    entries = BatchSessionEntrySerializer(many=True)
