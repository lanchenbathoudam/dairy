from decimal import Decimal
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

class MilkingSession(models.TextChoices):
    MORNING = 'MORNING', 'Morning Session'
    EVENING = 'EVENING', 'Evening Session'

class MilkCollection(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open for Entry'
        COMPLETED = 'COMPLETED', 'Completed & Verified'
        LOCKED = 'LOCKED', 'Locked / Audited'

    collection_date = models.DateField(
        default=timezone.now,
        db_index=True,
        help_text="Calendar date of milking session",
    )
    session = models.CharField(
        max_length=10,
        choices=MilkingSession.choices,
        help_text="Morning or Evening session",
    )
    recorded_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when session was initiated",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.COMPLETED,
    )
    notes = models.TextField(
        blank=True,
        default='',
        help_text="Session-level weather or barn conditions",
    )

    class Meta:
        ordering = ['-collection_date', 'session']
        constraints = [
            models.UniqueConstraint(
                fields=['collection_date', 'session'],
                name='unique_collection_date_session',
            ),
        ]
        verbose_name = 'Milk Collection Session'
        verbose_name_plural = 'Milk Collection Sessions'

    def __str__(self):
        return f"{self.collection_date} ({self.get_session_display()}) - {self.get_status_display()}"


class MilkRecord(models.Model):
    cow = models.ForeignKey(
        'cows.Cow',
        on_delete=models.PROTECT,
        related_name='milk_records',
        help_text="The individual cow yielding milk",
    )
    collection = models.ForeignKey(
        MilkCollection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='records',
        help_text="Parent collection session",
    )
    production_date = models.DateField(
        default=timezone.now,
        db_index=True,
        help_text="Date of milking",
    )
    session = models.CharField(
        max_length=10,
        choices=MilkingSession.choices,
        help_text="Morning or Evening session",
    )
    quantity_litres = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Exact milk volume in litres (no floating point errors)",
    )
    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entered_milk_records',
    )
    notes = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Individual observations (e.g. calf nursed, teat check)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-production_date', 'session', 'cow__cow_code']
        constraints = [
            models.UniqueConstraint(
                fields=['cow', 'production_date', 'session'],
                name='unique_cow_production_date_session',
            ),
        ]
        verbose_name = 'Milk Record'
        verbose_name_plural = 'Milk Records'

    def __str__(self):
        return f"{self.production_date} [{self.session}] {self.cow.cow_code}: {self.quantity_litres} L"
