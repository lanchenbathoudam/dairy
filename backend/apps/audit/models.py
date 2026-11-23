from django.conf import settings
from django.db import models

class AuditLog(models.Model):
    class Action(models.TextChoices):
        CREATE = 'CREATE', 'Record Created'
        UPDATE = 'UPDATE', 'Record Updated'
        DELETE = 'DELETE', 'Record Deleted'
        STATUS_CHANGE = 'STATUS_CHANGE', 'Status Changed'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_entries',
        help_text="User who triggered the mutation",
    )
    entity_name = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Entity model name (e.g. 'Cow', 'MilkRecord', 'SupplyRecord')",
    )
    record_id = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Primary key of the affected record",
    )
    action = models.CharField(
        max_length=20,
        choices=Action.choices,
        db_index=True,
    )
    change_summary = models.JSONField(
        default=dict,
        help_text="JSON diff of previous vs new field values for this mutation",
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Client IP address at the time of the action",
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Exact timestamp of the mutation event",
    )

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Audit Log Entry'
        verbose_name_plural = 'Audit Log Entries'

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {self.entity_name} #{self.record_id} → {self.get_action_display()}"
