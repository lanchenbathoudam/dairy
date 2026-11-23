from django.db import models
from django.utils import timezone

class Cow(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active Milking'
        DRY = 'DRY', 'Dry Period'
        SICK = 'SICK', 'Sick / Vet Quarantine'
        INACTIVE = 'INACTIVE', 'Inactive / Sold'

    cow_code = models.CharField(
        max_length=32,
        unique=True,
        db_index=True,
        help_text="Permanent identification ear tag code (e.g. COW-001)",
    )
    display_name = models.CharField(
        max_length=100,
        help_text="Familiar barn name (e.g. Lakshmi, Gauri)",
    )
    breed = models.CharField(
        max_length=100,
        blank=True,
        default='Mixed',
        help_text="Breed specification (e.g. Holstein Friesian Cross, Jersey Cross, Sahiwal)",
    )
    joined_on = models.DateField(
        default=timezone.now,
        help_text="Date acquired or born on farm",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
        help_text="Current milking and health status",
    )
    notes = models.TextField(
        blank=True,
        default='',
        help_text="Behavioral, lactation, or medical notes",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['cow_code']
        verbose_name = 'Cow'
        verbose_name_plural = 'Cows'

    def __str__(self):
        return f"{self.cow_code} - {self.display_name} ({self.get_status_display()})"
