from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'entity_name', 'record_id', 'action', 'user', 'ip_address']
    list_filter = ['action', 'entity_name', 'timestamp']
    search_fields = ['entity_name', 'record_id']
    readonly_fields = ['timestamp', 'entity_name', 'record_id', 'action', 'change_summary', 'user', 'ip_address']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
