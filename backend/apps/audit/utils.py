"""Audit logging utility."""
from apps.audit.models import AuditLog

def log_audit_event(request, entity: str, record_id: str, action: str, change_summary: dict):
    """Safely log an audit record."""
    user = request.user if getattr(request, 'user', None) and request.user.is_authenticated else None
    try:
        AuditLog.objects.create(
            user=user,
            entity_name=entity,
            record_id=str(record_id),
            action=action,
            change_summary=change_summary,
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("Failed to create audit log: %s", e)
