"""
Phase 3: Database Integrity Tests
Validates: Decimal precision, UniqueConstraint enforcement, model relationships.
Run with: python manage.py test
"""
from decimal import Decimal
from django.test import TestCase
from django.db import IntegrityError
from django.utils import timezone
from apps.cows.models import Cow
from apps.production.models import MilkCollection, MilkRecord, MilkingSession
from apps.supply.models import Buyer, MilkRate, SupplyRecord
from apps.finance.models import Payment


class DecimalPrecisionTest(TestCase):
    """PHASE 3 — ADR-002: No binary floating-point arithmetic."""

    def setUp(self):
        self.cow = Cow.objects.create(
            cow_code='TEST-001',
            display_name='Precision Test Cow',
            breed='Jersey Cross',
            joined_on=timezone.now().date(),
            status=Cow.Status.ACTIVE,
        )

    def test_milk_record_exact_decimal(self):
        """Quantity 12.75 L must come back exactly as Decimal('12.75') — no floating-point drift."""
        record = MilkRecord.objects.create(
            cow=self.cow,
            production_date=timezone.now().date(),
            session=MilkingSession.MORNING,
            quantity_litres=Decimal('12.75'),
        )
        fetched = MilkRecord.objects.get(pk=record.pk)
        self.assertEqual(fetched.quantity_litres, Decimal('12.75'))

    def test_rate_decimal_precision(self):
        """Rate 42.50 ₹/L must round-trip exactly."""
        rate = MilkRate.objects.create(
            rate_per_litre=Decimal('42.50'),
            effective_from=timezone.now().date(),
        )
        fetched = MilkRate.objects.get(pk=rate.pk)
        self.assertEqual(fetched.rate_per_litre, Decimal('42.50'))

    def test_payment_decimal_precision(self):
        """Payment ₹25000.00 must come back exactly."""
        buyer = Buyer.objects.create(name='Test Cooperative Union')
        payment = Payment.objects.create(
            buyer=buyer,
            payment_date=timezone.now().date(),
            amount=Decimal('25000.00'),
            method=Payment.Method.BANK_TRANSFER,
        )
        fetched = Payment.objects.get(pk=payment.pk)
        self.assertEqual(fetched.amount, Decimal('25000.00'))


class UniquenessConstraintTest(TestCase):
    """PHASE 3 — ADR-003: Double-milking prevention via database constraint."""

    def setUp(self):
        self.cow = Cow.objects.create(
            cow_code='TEST-002',
            display_name='Uniqueness Test Cow',
            breed='HF Cross',
            joined_on=timezone.now().date(),
            status=Cow.Status.ACTIVE,
        )
        self.today = timezone.now().date()

    def test_duplicate_morning_session_raises_integrity_error(self):
        """Submitting MORNING session twice for same cow on same date must FAIL at database level."""
        MilkRecord.objects.create(
            cow=self.cow,
            production_date=self.today,
            session=MilkingSession.MORNING,
            quantity_litres=Decimal('10.00'),
        )
        with self.assertRaises(IntegrityError):
            MilkRecord.objects.create(
                cow=self.cow,
                production_date=self.today,
                session=MilkingSession.MORNING,
                quantity_litres=Decimal('12.00'),
            )

    def test_morning_and_evening_coexist_for_same_cow(self):
        """One MORNING and one EVENING record for same cow and date must BOTH succeed."""
        m = MilkRecord.objects.create(
            cow=self.cow,
            production_date=self.today,
            session=MilkingSession.MORNING,
            quantity_litres=Decimal('11.50'),
        )
        e = MilkRecord.objects.create(
            cow=self.cow,
            production_date=self.today,
            session=MilkingSession.EVENING,
            quantity_litres=Decimal('9.75'),
        )
        self.assertEqual(MilkRecord.objects.filter(cow=self.cow, production_date=self.today).count(), 2)

    def test_collection_session_uniqueness(self):
        """Two MilkCollection sessions with same date and session should raise IntegrityError."""
        MilkCollection.objects.create(collection_date=self.today, session=MilkingSession.MORNING)
        with self.assertRaises(IntegrityError):
            MilkCollection.objects.create(collection_date=self.today, session=MilkingSession.MORNING)

    def test_cow_code_uniqueness(self):
        """Two cows with the same cow_code must raise IntegrityError."""
        with self.assertRaises(IntegrityError):
            Cow.objects.create(
                cow_code='TEST-002',  # Same as setUp cow
                display_name='Duplicate Code Cow',
                breed='Sahiwal',
                joined_on=self.today,
                status=Cow.Status.ACTIVE,
            )


class FrozenRateTest(TestCase):
    """PHASE 3 — ADR-005: Rate preserved at supply dispatch time."""

    def test_supply_record_freezes_rate_on_creation(self):
        """SupplyRecord stores the rate and computed total at dispatch moment,
        independent of any future MilkRate table updates."""
        buyer = Buyer.objects.create(name='Frozen Rate Cooperative')
        rate = MilkRate.objects.create(
            rate_per_litre=Decimal('40.00'),
            effective_from=timezone.now().date(),
        )
        supply = SupplyRecord.objects.create(
            buyer=buyer,
            rate=rate,
            supply_date=timezone.now().date(),
            session=SupplyRecord.Session.FULL_DAY,
            quantity_litres=Decimal('100.00'),
            rate_per_litre_applied=rate.rate_per_litre,
            total_amount=Decimal('100.00') * rate.rate_per_litre,
        )

        # Now update the live rate — supply record must remain unchanged
        rate.rate_per_litre = Decimal('45.00')
        rate.save()

        refetched = SupplyRecord.objects.get(pk=supply.pk)
        self.assertEqual(refetched.rate_per_litre_applied, Decimal('40.00'))
        self.assertEqual(refetched.total_amount, Decimal('4000.00'))
