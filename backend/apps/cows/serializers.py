"""Serializers for Cows app."""
from rest_framework import serializers
from .models import Cow
from apps.production.models import MilkRecord
from django.db.models import Avg
from django.utils import timezone

class CowSerializer(serializers.ModelSerializer):
    days_in_herd = serializers.SerializerMethodField()
    last_production_litres = serializers.SerializerMethodField()
    weekly_avg_litres = serializers.SerializerMethodField()

    class Meta:
        model = Cow
        fields = [
            'id', 'cow_code', 'display_name', 'breed', 'status',
            'joined_on', 'notes', 'created_at', 'updated_at',
            'days_in_herd', 'last_production_litres', 'weekly_avg_litres',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'days_in_herd', 'last_production_litres', 'weekly_avg_litres']

    def get_days_in_herd(self, obj):
        if not obj.joined_on:
            return 0
        delta = timezone.now().date() - obj.joined_on
        return max(0, delta.days)

    def get_last_production_litres(self, obj):
        last_rec = MilkRecord.objects.filter(cow=obj).order_by('-production_date', '-session').first()
        return str(last_rec.quantity_litres) if last_rec else "0.00"

    def get_weekly_avg_litres(self, obj):
        seven_days_ago = timezone.now().date() - timezone.timedelta(days=7)
        avg = MilkRecord.objects.filter(cow=obj, production_date__gte=seven_days_ago).aggregate(Avg('quantity_litres'))['quantity_litres__avg']
        return f"{avg:.2f}" if avg is not None else "0.00"
