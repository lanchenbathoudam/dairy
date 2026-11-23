"""Phase 4 API Unit Tests: Authentication, Role Permissions, CRUD, Batch Session & Financials."""
from decimal import Decimal
from datetime import date, timedelta
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User
from apps.cows.models import Cow
from apps.production.models import MilkRecord, MilkCollection
from apps.supply.models import Buyer, MilkRate, SupplyRecord
from apps.finance.models import Payment
from apps.audit.models import AuditLog

class Phase4APITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create 3 users with distinct roles
        self.admin_user = User.objects.create_user(
            username='admin_boss',
            password='Password123!',
            email='admin@dairytrack.local',
            first_name='Admin',
            last_name='Boss',
            role='ADMIN',
        )
        self.recorder_user = User.objects.create_user(
            username='recorder_joe',
            password='Password123!',
            email='recorder@dairytrack.local',
            first_name='Joe',
            last_name='Milker',
            role='RECORDER',
        )
        self.viewer_user = User.objects.create_user(
            username='viewer_guest',
            password='Password123!',
            email='viewer@dairytrack.local',
            first_name='Guest',
            last_name='Viewer',
            role='VIEWER',
        )

        # Base active cows
        self.cow1 = Cow.objects.create(cow_code='COW-001', display_name='Ganga', breed='Gir', status='ACTIVE')
        self.cow2 = Cow.objects.create(cow_code='COW-002', display_name='Yamuna', breed='Sahiwal', status='ACTIVE')
        self.cow3 = Cow.objects.create(cow_code='COW-003', display_name='Saraswati', breed='Red Sindhi', status='DRY')

        # Wholesale Buyer & Pricing Rate
        self.buyer = Buyer.objects.create(name='Amul Cooperative Center', phone='+91 98765 43210')
        self.rate = MilkRate.objects.create(rate_per_litre=Decimal('42.50'), effective_from=date(2026, 1, 1))

    # --- 1. Authentication & JWT ---
    def test_login_returns_tokens_and_user_profile(self):
        url = reverse('token_obtain_pair')
        resp = self.client.post(url, {'username': 'admin_boss', 'password': 'Password123!'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)
        self.assertEqual(resp.data['user']['role'], 'ADMIN')
        self.assertEqual(resp.data['user']['username'], 'admin_boss')

    def test_auth_me_endpoint_returns_current_user(self):
        self.client.force_authenticate(user=self.recorder_user)
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['username'], 'recorder_joe')
        self.assertEqual(resp.data['role'], 'RECORDER')

    # --- 2. Role-Based Permissions ---
    def test_viewer_role_cannot_create_cow(self):
        self.client.force_authenticate(user=self.viewer_user)
        resp = self.client.post('/api/cows/', {
            'cow_code': 'COW-099',
            'display_name': 'Unauthorized Cow',
            'status': 'ACTIVE'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_recorder_role_can_create_cow(self):
        self.client.force_authenticate(user=self.recorder_user)
        resp = self.client.post('/api/cows/', {
            'cow_code': 'COW-004',
            'display_name': 'Nandi',
            'breed': 'Gir',
            'status': 'ACTIVE'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Cow.objects.filter(cow_code='COW-004').exists())

    def test_only_admin_can_view_audit_logs(self):
        # Viewer denied
        self.client.force_authenticate(user=self.viewer_user)
        resp = self.client.get('/api/audit/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        # Recorder denied
        self.client.force_authenticate(user=self.recorder_user)
        resp = self.client.get('/api/audit/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        # Admin allowed
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.get('/api/audit/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    # --- 3. Cow Profile & History ---
    def test_cow_list_and_status_filtering(self):
        self.client.force_authenticate(user=self.viewer_user)
        resp = self.client.get('/api/cows/?status=DRY')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data.get('results', resp.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['cow_code'], 'COW-003')

    # --- 4. Atomic Batch Milk Session Submission ---
    def test_atomic_batch_session_submission(self):
        self.client.force_authenticate(user=self.recorder_user)
        today_str = date.today().isoformat()
        payload = {
            "production_date": today_str,
            "session": "MORNING",
            "notes": "Healthy morning session",
            "entries": [
                {"cow_id": self.cow1.id, "quantity_litres": "12.75"},
                {"cow_id": self.cow2.id, "quantity_litres": "11.25"},
            ]
        }
        resp = self.client.post('/api/production/records/batch-session/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['total_litres'], '24.00')
        self.assertEqual(resp.data['cow_count'], 2)

        # Verify MilkCollection was created
        self.assertTrue(MilkCollection.objects.filter(collection_date=date.today(), session='MORNING').exists())
        # Verify MilkRecords exist in DB
        self.assertEqual(MilkRecord.objects.filter(production_date=date.today(), session='MORNING').count(), 2)

    def test_batch_session_validation_rejects_negative_or_extreme_values(self):
        self.client.force_authenticate(user=self.recorder_user)
        payload = {
            "production_date": date.today().isoformat(),
            "session": "EVENING",
            "entries": [
                {"cow_id": self.cow1.id, "quantity_litres": "-5.00"}
            ]
        }
        resp = self.client.post('/api/production/records/batch-session/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # --- 5. Daily Summary Calculation ---
    def test_production_daily_summary(self):
        self.client.force_authenticate(user=self.viewer_user)
        t = date(2026, 11, 23)
        MilkRecord.objects.create(cow=self.cow1, production_date=t, session='MORNING', quantity_litres=Decimal('10.00'))
        MilkRecord.objects.create(cow=self.cow2, production_date=t, session='MORNING', quantity_litres=Decimal('12.00'))
        MilkRecord.objects.create(cow=self.cow1, production_date=t, session='EVENING', quantity_litres=Decimal('8.50'))

        resp = self.client.get(f'/api/production/records/summary/daily/?date={t.isoformat()}')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['morning_litres'], '22.00')
        self.assertEqual(resp.data['evening_litres'], '8.50')
        self.assertEqual(resp.data['daily_total_litres'], '30.50')

    # --- 6. Supply Dispatch with Frozen Wholesale Rate ---
    def test_supply_dispatch_locks_rate_and_computes_amount(self):
        self.client.force_authenticate(user=self.recorder_user)
        resp = self.client.post('/api/supply/records/', {
            'buyer': self.buyer.id,
            'supply_date': date.today().isoformat(),
            'session': 'FULL_DAY',
            'quantity_litres': '100.00'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        # 100.00 L * ₹42.50 = ₹4250.00
        self.assertEqual(resp.data['rate_per_litre_applied'], '42.50')
        self.assertEqual(resp.data['total_amount'], '4250.00')

    # --- 7. Finance & Outstanding Balance Summary ---
    def test_financial_ledger_and_reconciliation(self):
        self.client.force_authenticate(user=self.admin_user)
        # Supply 200 L @ 42.50 = 8500.00
        SupplyRecord.objects.create(
            buyer=self.buyer,
            supply_date=date.today(),
            session='FULL_DAY',
            quantity_litres=Decimal('200.00'),
            rate_per_litre_applied=Decimal('42.50'),
            total_amount=Decimal('8500.00')
        )
        # Payment received = 5000.00
        Payment.objects.create(
            buyer=self.buyer,
            payment_date=date.today(),
            amount=Decimal('5000.00'),
            method='UPI',
            reference_no='UPI-999888'
        )

        resp = self.client.get('/api/finance/payments/summary/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['total_billed'], '8500.00')
        self.assertEqual(resp.data['total_paid'], '5000.00')
        self.assertEqual(resp.data['outstanding_balance'], '3500.00')

    # --- 8. Analytics Dashboard & Reports CSV ---
    def test_analytics_dashboard_aggregate(self):
        resp = self.client.get('/api/analytics/dashboard/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('production', resp.data)
        self.assertIn('herd', resp.data)
        self.assertIn('finance', resp.data)

    def test_reports_csv_export(self):
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.get('/api/reports/production/csv/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp['Content-Type'], 'text/csv')
        self.assertIn('Record ID,Production Date,Session', resp.content.decode())
