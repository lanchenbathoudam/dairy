from decimal import Decimal
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = 'CASH', 'Cash in Hand'
        UPI = 'UPI', 'UPI / Mobile Payment'
        BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer (NEFT/RTGS/IMPS)'
        CHEQUE = 'CHEQUE', 'Bank Cheque'

    buyer = models.ForeignKey(
        'supply.Buyer',
        on_delete=models.PROTECT,
        related_name='payments',
        help_text="Buyer making the payment",
    )
    payment_date = models.DateField(
        db_index=True,
        help_text="Date payment was received",
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Exact amount received in local currency (no floating point arithmetic)",
    )
    method = models.CharField(
        max_length=20,
        choices=Method.choices,
        default=Method.BANK_TRANSFER,
    )
    reference_no = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="Transaction / cheque reference number",
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-payment_date']
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'

    def __str__(self):
        return f"{self.payment_date}: ₹{self.amount} from {self.buyer.name} via {self.get_method_display()}"


class FarmExpense(models.Model):
    class Category(models.TextChoices):
        FEED = 'FEED', 'Feed & Fodder'
        VETERINARY = 'VETERINARY', 'Veterinary / Medical'
        MEDICINE = 'MEDICINE', 'Medicine & Supplements'
        EQUIPMENT = 'EQUIPMENT', 'Equipment & Maintenance'
        LABOR = 'LABOR', 'Labor / Staff Wages'
        OTHER = 'OTHER', 'Other / Miscellaneous'

    expense_date = models.DateField(
        db_index=True,
        help_text="Date expense was incurred",
    )
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.FEED,
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Exact expense amount in local currency (exact decimal)",
    )
    description = models.CharField(
        max_length=255,
        help_text="Detailed description of the farm expense",
    )
    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entered_expenses',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-expense_date']
        verbose_name = 'Farm Expense'
        verbose_name_plural = 'Farm Expenses'

    def __str__(self):
        return f"{self.expense_date} [{self.get_category_display()}]: ₹{self.amount} - {self.description[:40]}"
