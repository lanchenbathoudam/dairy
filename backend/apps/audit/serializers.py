"""Serializers for Audit app."""
from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True, default='SYSTEM')

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'username', 'entity_name', 'record_id', 'action', 'timestamp', 'change_summary']
        read_only_fields = fields
