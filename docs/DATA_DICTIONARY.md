# Database Data Dictionary
## DAIRYTRACK: Dairy Farm Production & Management System

---

## 1. Table: `accounts_user`
Stores application user accounts and role assignments.

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | No | Auto | Primary Key | Unique user record identifier |
| `username` | `VARCHAR(150)` | No | — | Unique, Indexed | Login username |
| `email` | `VARCHAR(254)` | Yes | — | — | User email address |
| `password` | `VARCHAR(128)` | No | — | — | Salted argon2/pbkdf2 hash |
| `role` | `VARCHAR(20)` | No | `'RECORDER'` | `'ADMIN'`, `'RECORDER'`, `'VIEWER'` | Role for RBAC authorization |
| `first_name` | `VARCHAR(150)` | Yes | `''` | — | Given name |
| `last_name` | `VARCHAR(150)` | Yes | `''` | — | Family name |
| `is_active` | `BOOLEAN` | No | `TRUE` | — | Account enabled flag |
| `is_staff` | `BOOLEAN` | No | `FALSE` | — | Django admin access |
| `date_joined` | `TIMESTAMPTZ` | No | `NOW()` | — | Account creation timestamp |

---

## 2. Table: `cows_cow`
Stores the permanent identity and operational status of each cow on the farm.

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | No | Auto | Primary Key | Unique cow record identifier |
| `cow_code` | `VARCHAR(32)` | No | — | Unique, Indexed | Permanent physical ear tag / code |
| `display_name` | `VARCHAR(100)` | No | — | — | Familiar cow name (e.g. Lakshmi) |
| `breed` | `VARCHAR(100)` | Yes | `'Mixed'` | — | Cow breed (Jersey, HF, etc.) |
| `joined_on` | `DATE` | No | `CURRENT_DATE` | — | Date acquired or born on farm |
| `status` | `VARCHAR(20)` | No | `'ACTIVE'` | `'ACTIVE'`, `'DRY'`, `'SICK'`, `'INACTIVE'` | Current milking status |
| `notes` | `TEXT` | Yes | `''` | — | Veterinary or behavioral notes |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Registration timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Last profile update timestamp |

---

## 3. Table: `production_milkcollection`
Represents the morning or evening collection session container.

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | No | Auto | Primary Key | Collection session identifier |
| `collection_date` | `DATE` | No | — | Index | Calendar date of milking |
| `session` | `VARCHAR(10)` | No | — | `'MORNING'`, `'EVENING'` | Milking session of the day |
| `recorded_at` | `TIMESTAMPTZ` | No | `NOW()` | — | When session data was entered |
| `status` | `VARCHAR(20)` | No | `'COMPLETED'` | `'OPEN'`, `'COMPLETED'`, `'LOCKED'` | Session submission state |
| `notes` | `TEXT` | Yes | `''` | — | Session-level observations |

**Composite Unique Index:** `(collection_date, session)`

---

## 4. Table: `production_milkrecord`
Stores individual yield for a single cow during a specific milking session.

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | No | Auto | Primary Key | Unique record identifier |
| `cow_id` | `BIGINT` | No | — | FK $\rightarrow$ `cows_cow(id)` ON DELETE PROTECT | Producing cow reference |
| `collection_id` | `BIGINT` | Yes | `NULL` | FK $\rightarrow$ `production_milkcollection(id)` | Parent collection session |
| `production_date` | `DATE` | No | — | Index | Date of milking |
| `session` | `VARCHAR(10)` | No | — | `'MORNING'`, `'EVENING'` | Morning or Evening session |
| `quantity_litres` | `NUMERIC(6, 2)` | No | — | `CHECK(quantity_litres >= 0.00)` | Milk quantity in litres (exact decimal) |
| `entered_by_id` | `BIGINT` | Yes | `NULL` | FK $\rightarrow$ `accounts_user(id)` ON DELETE SET NULL | Staff member who entered record |
| `notes` | `VARCHAR(255)` | Yes | `''` | — | Specific observation on this yield |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Last modification timestamp |

**Composite Unique Constraint:** `(cow_id, production_date, session)`  
*Enforces: One morning and one evening entry per cow per date maximum.*

---

## 5. Table: `supply_buyer`
Profiles the primary wholesale dairy or cooperative collecting the farm's milk.

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | No | Auto | Primary Key | Unique buyer identifier |
| `name` | `VARCHAR(200)` | No | — | Unique | Buyer or cooperative name |
| `contact_person`| `VARCHAR(150)` | Yes | `''` | — | Dispatch/accounts contact name |
| `phone` | `VARCHAR(30)` | Yes | `''` | — | Telephone number |
| `email` | `VARCHAR(254)` | Yes | `''` | — | Contact email |
| `address` | `TEXT` | Yes | `''` | — | Collection center / depot address |
| `is_active` | `BOOLEAN` | No | `TRUE` | — | Active commercial relationship |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Account creation timestamp |

---

## 6. Table: `supply_milkrate`
Stores effective pricing per litre across historical periods.

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | No | Auto | Primary Key | Rate record identifier |
| `rate_per_litre`| `NUMERIC(7, 2)` | No | — | `CHECK(rate_per_litre > 0.00)` | Agreed price per litre (₹ / $) |
| `effective_from`| `DATE` | No | — | Index | Starting date for this rate |
| `effective_to` | `DATE` | Yes | `NULL` | — | Ending date (`NULL` = active rate) |
| `notes` | `VARCHAR(255)` | Yes | `''` | — | Agreement or contract notes |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Creation timestamp |

---

## 7. Table: `supply_supplyrecord`
Stores actual milk handed over to the wholesale buyer.

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | No | Auto | Primary Key | Supply record identifier |
| `buyer_id` | `BIGINT` | No | — | FK $\rightarrow$ `supply_buyer(id)` ON DELETE PROTECT | Buyer receiving the supply |
| `rate_id` | `BIGINT` | Yes | `NULL` | FK $\rightarrow$ `supply_milkrate(id)` | Reference to pricing rule |
| `supply_date` | `DATE` | No | — | Index | Date of dispatch |
| `session` | `VARCHAR(15)` | No | `'FULL_DAY'` | `'MORNING'`, `'EVENING'`, `'FULL_DAY'` | Collection session |
| `quantity_litres`| `NUMERIC(6, 2)`| No | — | `CHECK(quantity_litres >= 0.00)` | Litres handed over to buyer |
| `rate_per_litre_applied`| `NUMERIC(7, 2)`| No | — | Frozen rate at dispatch | Rate locked in at record creation |
| `total_amount` | `NUMERIC(10, 2)`| No | — | `quantity_litres * rate_applied` | Value of milk supplied |
| `notes` | `TEXT` | Yes | `''` | — | Receipt or tanker reference |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Creation timestamp |

---

## 8. Table: `finance_payment`
Stores payments received from wholesale buyer.

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | No | Auto | Primary Key | Payment transaction identifier |
| `buyer_id` | `BIGINT` | No | — | FK $\rightarrow$ `supply_buyer(id)` ON DELETE PROTECT | Remitting buyer |
| `payment_date` | `DATE` | No | — | Index | Date payment cleared |
| `amount` | `NUMERIC(10, 2)`| No | — | `CHECK(amount > 0.00)` | Monetary sum received |
| `method` | `VARCHAR(20)` | No | `'BANK_TRANSFER'` | `'CASH'`, `'UPI'`, `'BANK_TRANSFER'`, `'CHEQUE'` | Payment channel |
| `reference_no` | `VARCHAR(100)` | Yes | `''` | — | Transaction or cheque reference |
| `notes` | `TEXT` | Yes | `''` | — | Ledger notes |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Creation timestamp |

---

## 9. Table: `finance_farmexpense`
Tracks recurring farm operational costs (feed, veterinary, medicine).

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | No | Auto | Primary Key | Expense record identifier |
| `expense_date` | `DATE` | No | — | Index | Date incurred |
| `category` | `VARCHAR(30)` | No | `'FEED'` | `'FEED'`, `'VETERINARY'`, `'MEDICINE'`, `'EQUIPMENT'`, `'LABOR'`, `'OTHER'` | Expense classification |
| `amount` | `NUMERIC(10, 2)`| No | — | `CHECK(amount > 0.00)` | Cost incurred |
| `description` | `VARCHAR(255)` | No | — | — | Details of purchase |
| `entered_by_id`| `BIGINT` | Yes | `NULL` | FK $\rightarrow$ `accounts_user(id)` | Recording staff member |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | — | Creation timestamp |

---

## 10. Table: `audit_auditlog`
Immutable historical log of all critical record creations, updates, and deletes.

| Column Name | Data Type | Nullable | Default | Constraints / References | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | No | Auto | Primary Key | Audit log identifier |
| `user_id` | `BIGINT` | Yes | `NULL` | FK $\rightarrow$ `accounts_user(id)` ON DELETE SET NULL | Acting user |
| `entity_name` | `VARCHAR(50)` | No | — | Index | Affected entity (e.g. `'MilkRecord'`) |
| `record_id` | `VARCHAR(50)` | No | — | Index | Primary key of modified record |
| `action` | `VARCHAR(20)` | No | — | `'CREATE'`, `'UPDATE'`, `'DELETE'`, `'STATUS_CHANGE'` | Operation performed |
| `change_summary`| `JSONB` | No | `'{}'` | — | Previous vs new values diff |
| `ip_address` | `INET` / `VARCHAR(45)` | Yes | `NULL` | — | Client IP address |
| `timestamp` | `TIMESTAMPTZ` | No | `NOW()` | Index | Exact timestamp of event |
