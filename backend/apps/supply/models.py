from decimal import Decimal
from django.core.validators import MinValueValidator
from django.db import models

class Buyer(models.Model):
    name = models.CharField(
        max_length=200,
        unique=True,
        help_text="Wholesale buyer or cooperative name",
    )
    contact_person = models.CharField(max_length=150, blank=True, default='')
    phone = models.CharField(max_length=30, blank=True, default='')
    email = models.EmailField(max_length=254, blank=True, default='')
    address = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Buyer'
        verbose_name_plural = 'Buyers'

    def __str__(self):
        return self.name


class MilkRate(models.Model):
    rate_per_litre = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Agreed price per litre in local currency (Rupees), must be exact decimal",
    )
    effective_from = models.DateField(
        db_index=True,
        help_text="Date from which this rate applies",
    )
    effective_to = models.DateField(
        null=True,
        blank=True,
        help_text="Date until which this rate applies (NULL = currently active rate)",
    )
    notes = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Contract agreement details or seasonal pricing notes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_from']
        verbose_name = 'Milk Rate'
        verbose_name_plural = 'Milk Rates'

    def __str__(self):
        return f"₹{self.rate_per_litre}/L from {self.effective_from}"


class SupplyRecord(models.Model):
    class Session(models.TextChoices):
        MORNING = 'MORNING', 'Morning Tanker'
        EVENING = 'EVENING', 'Evening Tanker'
        FULL_DAY = 'FULL_DAY', 'Full Day Combined'

    buyer = models.ForeignKey(
        Buyer,
        on_delete=models.PROTECT,
        related_name='supply_records',
    )
    rate = models.ForeignKey(
        MilkRate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supply_records',
    )
    supply_date = models.DateField(
        db_index=True,
        help_text="Date milk was handed over to buyer",
    )
    session = models.CharField(
        max_length=15,
        choices=Session.choices,
        default=Session.FULL_DAY,
    )
    quantity_litres = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Exact volume dispatched to buyer in litres",
    )
    # Rate is frozen at dispatch time — retroactive rate changes must NOT affect past records
    rate_per_litre_applied = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Rate locked at the moment of supply dispatch (immutable)",
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Computed: quantity_litres x rate_per_litre_applied (exact decimal arithmetic)",
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-supply_date']
        verbose_name = 'Supply Record'
        verbose_name_plural = 'Supply Records'

    def __str__(self):
        return f"{self.supply_date} [{self.session}]: {self.quantity_litres} L → {self.buyer.name}"
