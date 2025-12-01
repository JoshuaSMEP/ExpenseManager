# Glass Expense App - Database Schema

## Overview
This document outlines the MySQL database schema for the Glass Expense Management application. The schema supports expense tracking, approval workflows, credit card statement integration, and reimbursement processing.

---

## Module 1: Users & Authentication

### Table: `users`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| email | VARCHAR | 255 | NO | Unique email address |
| password_hash | VARCHAR | 255 | YES | Hashed password (null for SSO users) |
| full_name | VARCHAR | 100 | NO | User's full name |
| department | VARCHAR | 100 | YES | Department name |
| role | ENUM | - | NO | 'employee', 'manager', 'finance', 'admin' |
| manager_id | CHAR | 36 | YES | FK to users.id (reporting manager) |
| profile_photo_url | VARCHAR | 500 | YES | URL to profile photo |
| is_active | TINYINT | 1 | NO | Active status (default: 1) |
| is_onboarded | TINYINT | 1 | NO | Onboarding completed (default: 0) |
| created_at | DATETIME | - | NO | Record creation timestamp |
| updated_at | DATETIME | - | NO | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`email`)
- INDEX (`manager_id`)
- INDEX (`department`)
- INDEX (`role`)

---

### Table: `user_sessions`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| user_id | CHAR | 36 | NO | FK to users.id |
| token | VARCHAR | 500 | NO | Session/JWT token |
| expires_at | DATETIME | - | NO | Token expiration |
| ip_address | VARCHAR | 45 | YES | Client IP address |
| user_agent | VARCHAR | 500 | YES | Browser user agent |
| created_at | DATETIME | - | NO | Session creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`user_id`)
- INDEX (`token`)
- INDEX (`expires_at`)

---

### Table: `magic_links`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| user_id | CHAR | 36 | NO | FK to users.id |
| token | VARCHAR | 255 | NO | Unique magic link token |
| expires_at | DATETIME | - | NO | Link expiration (15 min) |
| used_at | DATETIME | - | YES | When link was used |
| created_at | DATETIME | - | NO | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`token`)
- INDEX (`user_id`)
- INDEX (`expires_at`)

---

## Module 2: Expenses

### Table: `expenses`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| user_id | CHAR | 36 | NO | FK to users.id (submitter) |
| amount | DECIMAL | 10,2 | NO | Expense amount |
| currency | CHAR | 3 | NO | ISO currency code (default: 'USD') |
| merchant_name | VARCHAR | 255 | NO | Merchant/vendor name |
| expense_date | DATE | - | NO | Date of expense |
| category | ENUM | - | NO | Expense category (see below) |
| subcategory | VARCHAR | 100 | YES | Optional subcategory |
| description | TEXT | - | YES | Expense description/notes |
| receipt_image_url | VARCHAR | 500 | YES | URL to receipt image |
| receipt_thumbnail_url | VARCHAR | 500 | YES | URL to receipt thumbnail |
| status | ENUM | - | NO | Expense status (see below) |
| gl_code | VARCHAR | 20 | YES | General ledger code |
| cost_center | VARCHAR | 50 | YES | Cost center code |
| project_code | VARCHAR | 50 | YES | Project/job code |
| billable | TINYINT | 1 | NO | Is billable to client (default: 0) |
| reimbursable | TINYINT | 1 | NO | Is reimbursable (default: 1) |
| mileage | DECIMAL | 8,2 | YES | Miles driven (for mileage expenses) |
| mileage_rate | DECIMAL | 4,3 | YES | Rate per mile |
| submitted_at | DATETIME | - | YES | When submitted for approval |
| approved_at | DATETIME | - | YES | When approved |
| approved_by | CHAR | 36 | YES | FK to users.id (approver) |
| rejected_at | DATETIME | - | YES | When rejected |
| rejected_by | CHAR | 36 | YES | FK to users.id (rejector) |
| rejection_reason | TEXT | - | YES | Reason for rejection |
| paid_at | DATETIME | - | YES | When reimbursed |
| exported_at | DATETIME | - | YES | When exported to accounting |
| export_batch_id | CHAR | 36 | YES | FK to export_batches.id |
| credit_card_transaction_id | CHAR | 36 | YES | FK to credit_card_transactions.id |
| created_at | DATETIME | - | NO | Record creation timestamp |
| updated_at | DATETIME | - | NO | Last update timestamp |

**Category ENUM Values:**
- 'meals'
- 'travel'
- 'transportation'
- 'lodging'
- 'supplies'
- 'entertainment'
- 'communication'
- 'software'
- 'equipment'
- 'training'
- 'mileage'
- 'other'

**Status ENUM Values:**
- 'draft'
- 'submitted'
- 'approved'
- 'rejected'
- 'paid'
- 'exported'

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`user_id`)
- INDEX (`status`)
- INDEX (`expense_date`)
- INDEX (`category`)
- INDEX (`approved_by`)
- INDEX (`credit_card_transaction_id`)
- INDEX (`export_batch_id`)
- INDEX (`created_at`)

---

### Table: `expense_receipts`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| expense_id | CHAR | 36 | NO | FK to expenses.id |
| file_name | VARCHAR | 255 | NO | Original file name |
| file_type | VARCHAR | 50 | NO | MIME type |
| file_size | INT | - | NO | File size in bytes |
| file_url | VARCHAR | 500 | NO | URL to file |
| thumbnail_url | VARCHAR | 500 | YES | URL to thumbnail |
| ocr_processed | TINYINT | 1 | NO | OCR processing complete |
| ocr_data | JSON | - | YES | Extracted OCR data |
| created_at | DATETIME | - | NO | Upload timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`expense_id`)

---

### Table: `expense_policy_violations`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| expense_id | CHAR | 36 | NO | FK to expenses.id |
| policy_rule_id | CHAR | 36 | YES | FK to policy_rules.id |
| violation_type | VARCHAR | 100 | NO | Type of violation |
| violation_message | TEXT | NO | YES | Human-readable message |
| severity | ENUM | - | NO | 'warning', 'error', 'block' |
| acknowledged | TINYINT | 1 | NO | User acknowledged (default: 0) |
| acknowledged_at | DATETIME | - | YES | When acknowledged |
| created_at | DATETIME | - | NO | Detection timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`expense_id`)
- INDEX (`policy_rule_id`)
- INDEX (`severity`)

---

### Table: `expense_comments`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| expense_id | CHAR | 36 | NO | FK to expenses.id |
| user_id | CHAR | 36 | NO | FK to users.id (commenter) |
| comment | TEXT | - | NO | Comment text |
| is_internal | TINYINT | 1 | NO | Internal note (default: 0) |
| created_at | DATETIME | - | NO | Comment timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`expense_id`)
- INDEX (`user_id`)
- INDEX (`created_at`)

---

### Table: `expense_history`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| expense_id | CHAR | 36 | NO | FK to expenses.id |
| user_id | CHAR | 36 | NO | FK to users.id (actor) |
| action | VARCHAR | 50 | NO | Action taken |
| old_value | JSON | - | YES | Previous values |
| new_value | JSON | - | YES | New values |
| ip_address | VARCHAR | 45 | YES | Client IP |
| created_at | DATETIME | - | NO | Action timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`expense_id`)
- INDEX (`user_id`)
- INDEX (`action`)
- INDEX (`created_at`)

---

## Module 3: Expense Reports (Grouped Expenses)

### Table: `expense_reports`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| user_id | CHAR | 36 | NO | FK to users.id (submitter) |
| report_number | VARCHAR | 20 | NO | Auto-generated report number |
| title | VARCHAR | 255 | NO | Report title |
| description | TEXT | - | YES | Report description |
| purpose | VARCHAR | 255 | YES | Business purpose |
| start_date | DATE | - | YES | Trip/period start date |
| end_date | DATE | - | YES | Trip/period end date |
| total_amount | DECIMAL | 12,2 | NO | Sum of all expenses |
| currency | CHAR | 3 | NO | Primary currency |
| status | ENUM | - | NO | Report status |
| submitted_at | DATETIME | - | YES | Submission timestamp |
| approved_at | DATETIME | - | YES | Approval timestamp |
| approved_by | CHAR | 36 | YES | FK to users.id |
| rejected_at | DATETIME | - | YES | Rejection timestamp |
| rejected_by | CHAR | 36 | YES | FK to users.id |
| rejection_reason | TEXT | - | YES | Rejection reason |
| paid_at | DATETIME | - | YES | Payment timestamp |
| created_at | DATETIME | - | NO | Creation timestamp |
| updated_at | DATETIME | - | NO | Update timestamp |

**Status ENUM Values:**
- 'draft'
- 'submitted'
- 'approved'
- 'rejected'
- 'paid'
- 'exported'

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`report_number`)
- INDEX (`user_id`)
- INDEX (`status`)
- INDEX (`submitted_at`)

---

### Table: `expense_report_items`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| expense_report_id | CHAR | 36 | NO | FK to expense_reports.id |
| expense_id | CHAR | 36 | NO | FK to expenses.id |
| display_order | INT | - | NO | Order in report |
| created_at | DATETIME | - | NO | Added timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`expense_report_id`, `expense_id`)
- INDEX (`expense_id`)

---

## Module 4: Credit Card Integration

### Table: `credit_cards`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| user_id | CHAR | 36 | NO | FK to users.id (cardholder) |
| card_name | VARCHAR | 100 | NO | Card nickname |
| card_type | ENUM | - | NO | 'corporate', 'personal' |
| card_brand | VARCHAR | 50 | YES | Visa, Mastercard, Amex, etc. |
| last_four | CHAR | 4 | NO | Last 4 digits |
| expiry_month | TINYINT | - | YES | Expiration month |
| expiry_year | SMALLINT | - | YES | Expiration year |
| is_active | TINYINT | 1 | NO | Card active status |
| created_at | DATETIME | - | NO | Creation timestamp |
| updated_at | DATETIME | - | NO | Update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`user_id`)
- INDEX (`last_four`)
- INDEX (`is_active`)

---

### Table: `credit_card_statements`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| credit_card_id | CHAR | 36 | NO | FK to credit_cards.id |
| statement_date | DATE | - | NO | Statement closing date |
| statement_period_start | DATE | - | NO | Period start date |
| statement_period_end | DATE | - | NO | Period end date |
| total_amount | DECIMAL | 12,2 | NO | Statement total |
| currency | CHAR | 3 | NO | Currency code |
| file_url | VARCHAR | 500 | YES | PDF statement URL |
| import_source | VARCHAR | 50 | YES | 'manual', 'plaid', 'csv', 'ofx' |
| imported_at | DATETIME | - | NO | Import timestamp |
| created_at | DATETIME | - | NO | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`credit_card_id`)
- INDEX (`statement_date`)
- UNIQUE INDEX (`credit_card_id`, `statement_date`)

---

### Table: `credit_card_transactions`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| credit_card_id | CHAR | 36 | NO | FK to credit_cards.id |
| statement_id | CHAR | 36 | YES | FK to credit_card_statements.id |
| transaction_date | DATE | - | NO | Transaction date |
| post_date | DATE | - | YES | Post/settlement date |
| merchant_name | VARCHAR | 255 | NO | Merchant name (raw) |
| merchant_name_clean | VARCHAR | 255 | YES | Cleaned merchant name |
| merchant_category_code | VARCHAR | 10 | YES | MCC code |
| merchant_category | VARCHAR | 100 | YES | Category description |
| amount | DECIMAL | 10,2 | NO | Transaction amount |
| currency | CHAR | 3 | NO | Currency code |
| is_credit | TINYINT | 1 | NO | Is credit/refund (default: 0) |
| reference_number | VARCHAR | 50 | YES | Transaction reference |
| description | TEXT | - | YES | Additional description |
| expense_id | CHAR | 36 | YES | FK to expenses.id (matched) |
| match_status | ENUM | - | NO | Matching status |
| match_confidence | DECIMAL | 3,2 | YES | Match confidence (0.00-1.00) |
| matched_at | DATETIME | - | YES | When matched |
| matched_by | CHAR | 36 | YES | FK to users.id (manual match) |
| is_personal | TINYINT | 1 | NO | Marked as personal (default: 0) |
| is_ignored | TINYINT | 1 | NO | Ignore this transaction |
| external_id | VARCHAR | 100 | YES | ID from import source |
| created_at | DATETIME | - | NO | Creation timestamp |
| updated_at | DATETIME | - | NO | Update timestamp |

**Match Status ENUM Values:**
- 'unmatched'
- 'auto_matched'
- 'manual_matched'
- 'no_receipt_needed'
- 'personal'
- 'ignored'

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`credit_card_id`)
- INDEX (`statement_id`)
- INDEX (`transaction_date`)
- INDEX (`expense_id`)
- INDEX (`match_status`)
- INDEX (`merchant_name`)
- UNIQUE INDEX (`external_id`) - WHERE external_id IS NOT NULL

---

### Table: `transaction_match_suggestions`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| credit_card_transaction_id | CHAR | 36 | NO | FK to credit_card_transactions.id |
| expense_id | CHAR | 36 | NO | FK to expenses.id |
| confidence_score | DECIMAL | 3,2 | NO | Match confidence (0.00-1.00) |
| match_reasons | JSON | - | YES | Why this match was suggested |
| status | ENUM | - | NO | 'pending', 'accepted', 'rejected' |
| reviewed_at | DATETIME | - | YES | When reviewed |
| reviewed_by | CHAR | 36 | YES | FK to users.id |
| created_at | DATETIME | - | NO | Suggestion timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`credit_card_transaction_id`)
- INDEX (`expense_id`)
- INDEX (`status`)
- INDEX (`confidence_score`)

---

## Module 5: Approval Workflow

### Table: `approval_chains`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| name | VARCHAR | 100 | NO | Chain name |
| description | TEXT | - | YES | Chain description |
| department | VARCHAR | 100 | YES | Applies to department |
| min_amount | DECIMAL | 10,2 | YES | Minimum amount threshold |
| max_amount | DECIMAL | 10,2 | YES | Maximum amount threshold |
| is_active | TINYINT | 1 | NO | Active status |
| priority | INT | - | NO | Evaluation priority |
| created_at | DATETIME | - | NO | Creation timestamp |
| updated_at | DATETIME | - | NO | Update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`department`)
- INDEX (`is_active`)
- INDEX (`priority`)

---

### Table: `approval_chain_steps`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| approval_chain_id | CHAR | 36 | NO | FK to approval_chains.id |
| step_order | INT | - | NO | Step sequence number |
| approver_type | ENUM | - | NO | 'user', 'manager', 'role', 'department_head' |
| approver_id | CHAR | 36 | YES | FK to users.id (if type='user') |
| approver_role | VARCHAR | 50 | YES | Role name (if type='role') |
| can_skip | TINYINT | 1 | NO | Can be skipped (default: 0) |
| auto_approve_below | DECIMAL | 10,2 | YES | Auto-approve under this amount |
| created_at | DATETIME | - | NO | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`approval_chain_id`)
- UNIQUE INDEX (`approval_chain_id`, `step_order`)

---

### Table: `approval_requests`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| expense_id | CHAR | 36 | YES | FK to expenses.id |
| expense_report_id | CHAR | 36 | YES | FK to expense_reports.id |
| approval_chain_id | CHAR | 36 | NO | FK to approval_chains.id |
| current_step | INT | - | NO | Current step in chain |
| status | ENUM | - | NO | 'pending', 'approved', 'rejected', 'cancelled' |
| created_at | DATETIME | - | NO | Request creation timestamp |
| updated_at | DATETIME | - | NO | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`expense_id`)
- INDEX (`expense_report_id`)
- INDEX (`approval_chain_id`)
- INDEX (`status`)

---

### Table: `approval_actions`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| approval_request_id | CHAR | 36 | NO | FK to approval_requests.id |
| step_number | INT | - | NO | Step number in chain |
| approver_id | CHAR | 36 | NO | FK to users.id |
| action | ENUM | - | NO | 'approved', 'rejected', 'delegated' |
| comment | TEXT | - | YES | Approver comment |
| delegated_to | CHAR | 36 | YES | FK to users.id (if delegated) |
| created_at | DATETIME | - | NO | Action timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`approval_request_id`)
- INDEX (`approver_id`)
- INDEX (`action`)
- INDEX (`created_at`)

---

## Module 6: Policy Management

### Table: `expense_policies`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| name | VARCHAR | 100 | NO | Policy name |
| description | TEXT | - | YES | Policy description |
| effective_date | DATE | - | NO | When policy takes effect |
| expiry_date | DATE | - | YES | When policy expires |
| is_active | TINYINT | 1 | NO | Active status |
| applies_to_all | TINYINT | 1 | NO | Applies to all users |
| created_by | CHAR | 36 | NO | FK to users.id |
| created_at | DATETIME | - | NO | Creation timestamp |
| updated_at | DATETIME | - | NO | Update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`is_active`)
- INDEX (`effective_date`)

---

### Table: `policy_rules`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| expense_policy_id | CHAR | 36 | NO | FK to expense_policies.id |
| rule_type | ENUM | - | NO | Type of rule (see below) |
| category | VARCHAR | 50 | YES | Expense category (if applicable) |
| condition_field | VARCHAR | 50 | YES | Field to check |
| condition_operator | ENUM | - | NO | 'equals', 'greater_than', 'less_than', 'contains' |
| condition_value | VARCHAR | 255 | NO | Value to compare |
| action | ENUM | - | NO | 'warn', 'require_justification', 'block' |
| message | TEXT | - | NO | Message to display |
| is_active | TINYINT | 1 | NO | Rule active status |
| created_at | DATETIME | - | NO | Creation timestamp |

**Rule Type ENUM Values:**
- 'daily_limit'
- 'per_expense_limit'
- 'category_limit'
- 'receipt_required'
- 'advance_booking'
- 'preferred_vendor'
- 'custom'

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`expense_policy_id`)
- INDEX (`rule_type`)
- INDEX (`category`)
- INDEX (`is_active`)

---

### Table: `policy_department_assignments`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| expense_policy_id | CHAR | 36 | NO | FK to expense_policies.id |
| department | VARCHAR | 100 | NO | Department name |
| created_at | DATETIME | - | NO | Assignment timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`expense_policy_id`, `department`)
- INDEX (`department`)

---

## Module 7: Reimbursement & Export

### Table: `reimbursement_methods`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| user_id | CHAR | 36 | NO | FK to users.id |
| method_type | ENUM | - | NO | 'direct_deposit', 'check', 'payroll' |
| is_default | TINYINT | 1 | NO | Default method |
| bank_name | VARCHAR | 100 | YES | Bank name |
| account_type | ENUM | - | YES | 'checking', 'savings' |
| account_last_four | CHAR | 4 | YES | Last 4 of account |
| routing_number_last_four | CHAR | 4 | YES | Last 4 of routing |
| encrypted_account_data | TEXT | - | YES | Encrypted full details |
| is_verified | TINYINT | 1 | NO | Verified status |
| verified_at | DATETIME | - | YES | Verification timestamp |
| created_at | DATETIME | - | NO | Creation timestamp |
| updated_at | DATETIME | - | NO | Update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`user_id`)
- INDEX (`is_default`)

---

### Table: `export_batches`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| batch_number | VARCHAR | 20 | NO | Batch reference number |
| export_type | ENUM | - | NO | 'csv', 'quickbooks', 'sage', 'viewpoint', 'custom' |
| status | ENUM | - | NO | 'pending', 'processing', 'completed', 'failed' |
| total_expenses | INT | - | NO | Number of expenses |
| total_amount | DECIMAL | 12,2 | NO | Total amount exported |
| file_url | VARCHAR | 500 | YES | Exported file URL |
| error_message | TEXT | - | YES | Error details if failed |
| created_by | CHAR | 36 | NO | FK to users.id |
| created_at | DATETIME | - | NO | Export timestamp |
| completed_at | DATETIME | - | YES | Completion timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`batch_number`)
- INDEX (`status`)
- INDEX (`created_by`)
- INDEX (`created_at`)

---

### Table: `export_batch_items`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| export_batch_id | CHAR | 36 | NO | FK to export_batches.id |
| expense_id | CHAR | 36 | NO | FK to expenses.id |
| gl_code | VARCHAR | 20 | YES | GL code at export time |
| amount | DECIMAL | 10,2 | NO | Amount at export time |
| created_at | DATETIME | - | NO | Addition timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`export_batch_id`)
- INDEX (`expense_id`)

---

## Module 8: Notifications

### Table: `notifications`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| user_id | CHAR | 36 | NO | FK to users.id (recipient) |
| type | ENUM | - | NO | Notification type (see below) |
| title | VARCHAR | 255 | NO | Notification title |
| message | TEXT | - | NO | Notification message |
| link | VARCHAR | 500 | YES | Action link |
| reference_type | VARCHAR | 50 | YES | 'expense', 'report', 'approval' |
| reference_id | CHAR | 36 | YES | Reference record ID |
| is_read | TINYINT | 1 | NO | Read status (default: 0) |
| read_at | DATETIME | - | YES | When read |
| is_email_sent | TINYINT | 1 | NO | Email sent status |
| email_sent_at | DATETIME | - | YES | Email timestamp |
| is_push_sent | TINYINT | 1 | NO | Push notification sent |
| push_sent_at | DATETIME | - | YES | Push timestamp |
| created_at | DATETIME | - | NO | Creation timestamp |

**Type ENUM Values:**
- 'approval_needed'
- 'expense_approved'
- 'expense_rejected'
- 'expense_reimbursed'
- 'report_submitted'
- 'comment_added'
- 'policy_violation'
- 'card_transaction'
- 'reminder'
- 'system'

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`user_id`)
- INDEX (`type`)
- INDEX (`is_read`)
- INDEX (`reference_type`, `reference_id`)
- INDEX (`created_at`)

---

### Table: `notification_preferences`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| user_id | CHAR | 36 | NO | FK to users.id |
| notification_type | VARCHAR | 50 | NO | Type of notification |
| email_enabled | TINYINT | 1 | NO | Email notifications |
| push_enabled | TINYINT | 1 | NO | Push notifications |
| in_app_enabled | TINYINT | 1 | NO | In-app notifications |
| created_at | DATETIME | - | NO | Creation timestamp |
| updated_at | DATETIME | - | NO | Update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`user_id`, `notification_type`)

---

## Module 9: Categories & Configuration

### Table: `expense_categories`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| code | VARCHAR | 20 | NO | Category code |
| name | VARCHAR | 100 | NO | Display name |
| description | TEXT | - | YES | Category description |
| icon | VARCHAR | 50 | YES | Icon name/emoji |
| default_gl_code | VARCHAR | 20 | YES | Default GL code |
| parent_category_id | CHAR | 36 | YES | FK for subcategories |
| requires_receipt | TINYINT | 1 | NO | Receipt required |
| receipt_threshold | DECIMAL | 10,2 | YES | Receipt required above |
| is_active | TINYINT | 1 | NO | Active status |
| display_order | INT | - | NO | Sort order |
| created_at | DATETIME | - | NO | Creation timestamp |
| updated_at | DATETIME | - | NO | Update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`code`)
- INDEX (`parent_category_id`)
- INDEX (`is_active`)
- INDEX (`display_order`)

---

### Table: `gl_codes`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| code | VARCHAR | 20 | NO | GL code |
| name | VARCHAR | 100 | NO | Account name |
| description | TEXT | - | YES | Account description |
| account_type | VARCHAR | 50 | YES | Account type |
| is_active | TINYINT | 1 | NO | Active status |
| created_at | DATETIME | - | NO | Creation timestamp |
| updated_at | DATETIME | - | NO | Update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`code`)
- INDEX (`is_active`)

---

### Table: `cost_centers`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| code | VARCHAR | 50 | NO | Cost center code |
| name | VARCHAR | 100 | NO | Cost center name |
| description | TEXT | - | YES | Description |
| manager_id | CHAR | 36 | YES | FK to users.id |
| parent_id | CHAR | 36 | YES | Parent cost center |
| is_active | TINYINT | 1 | NO | Active status |
| created_at | DATETIME | - | NO | Creation timestamp |
| updated_at | DATETIME | - | NO | Update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`code`)
- INDEX (`manager_id`)
- INDEX (`parent_id`)
- INDEX (`is_active`)

---

### Table: `departments`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| code | VARCHAR | 20 | NO | Department code |
| name | VARCHAR | 100 | NO | Department name |
| description | TEXT | - | YES | Description |
| manager_id | CHAR | 36 | YES | FK to users.id |
| cost_center_id | CHAR | 36 | YES | FK to cost_centers.id |
| is_active | TINYINT | 1 | NO | Active status |
| created_at | DATETIME | - | NO | Creation timestamp |
| updated_at | DATETIME | - | NO | Update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`code`)
- INDEX (`manager_id`)
- INDEX (`cost_center_id`)
- INDEX (`is_active`)

---

## Module 10: Mileage Tracking

### Table: `mileage_rates`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| effective_date | DATE | - | NO | Rate effective date |
| rate_per_mile | DECIMAL | 4,3 | NO | Rate per mile (e.g., 0.670) |
| vehicle_type | ENUM | - | NO | 'car', 'motorcycle', 'bicycle' |
| description | VARCHAR | 255 | YES | Rate description |
| is_irs_rate | TINYINT | 1 | NO | IRS standard rate |
| created_at | DATETIME | - | NO | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`effective_date`)
- INDEX (`vehicle_type`)

---

### Table: `mileage_logs`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| expense_id | CHAR | 36 | NO | FK to expenses.id |
| user_id | CHAR | 36 | NO | FK to users.id |
| trip_date | DATE | - | NO | Date of trip |
| start_location | VARCHAR | 255 | NO | Starting address |
| end_location | VARCHAR | 255 | NO | Ending address |
| start_odometer | DECIMAL | 10,1 | YES | Starting odometer |
| end_odometer | DECIMAL | 10,1 | YES | Ending odometer |
| distance_miles | DECIMAL | 8,2 | NO | Total miles |
| purpose | VARCHAR | 255 | NO | Business purpose |
| route_data | JSON | - | YES | GPS route data |
| mileage_rate_id | CHAR | 36 | YES | FK to mileage_rates.id |
| rate_applied | DECIMAL | 4,3 | NO | Rate used |
| created_at | DATETIME | - | NO | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`expense_id`)
- INDEX (`user_id`)
- INDEX (`trip_date`)

---

## Module 11: Audit & Compliance

### Table: `audit_log`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| user_id | CHAR | 36 | YES | FK to users.id (actor) |
| action | VARCHAR | 50 | NO | Action performed |
| entity_type | VARCHAR | 50 | NO | Table/entity affected |
| entity_id | CHAR | 36 | YES | Record ID affected |
| old_values | JSON | - | YES | Previous state |
| new_values | JSON | - | YES | New state |
| ip_address | VARCHAR | 45 | YES | Client IP |
| user_agent | VARCHAR | 500 | YES | Browser info |
| request_id | CHAR | 36 | YES | Request correlation ID |
| created_at | DATETIME | - | NO | Action timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`user_id`)
- INDEX (`action`)
- INDEX (`entity_type`, `entity_id`)
- INDEX (`created_at`)

---

### Table: `system_settings`
| Field Name | Data Type | Length | Nullable | Description |
|------------|-----------|--------|----------|-------------|
| id | CHAR | 36 | NO | Primary key (UUID) |
| setting_key | VARCHAR | 100 | NO | Setting identifier |
| setting_value | TEXT | - | YES | Setting value |
| setting_type | ENUM | - | NO | 'string', 'number', 'boolean', 'json' |
| description | TEXT | - | YES | Setting description |
| is_public | TINYINT | 1 | NO | Visible to all users |
| updated_by | CHAR | 36 | YES | FK to users.id |
| created_at | DATETIME | - | NO | Creation timestamp |
| updated_at | DATETIME | - | NO | Update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`setting_key`)

---

## Entity Relationship Summary

```
users
  ├── expenses (user_id)
  ├── expense_reports (user_id)
  ├── credit_cards (user_id)
  ├── notifications (user_id)
  ├── approval_actions (approver_id)
  └── reimbursement_methods (user_id)

expenses
  ├── expense_receipts (expense_id)
  ├── expense_policy_violations (expense_id)
  ├── expense_comments (expense_id)
  ├── expense_history (expense_id)
  ├── expense_report_items (expense_id)
  ├── credit_card_transactions (expense_id) [match]
  ├── approval_requests (expense_id)
  └── export_batch_items (expense_id)

credit_cards
  ├── credit_card_statements (credit_card_id)
  └── credit_card_transactions (credit_card_id)

credit_card_transactions
  ├── transaction_match_suggestions (credit_card_transaction_id)
  └── expenses (credit_card_transaction_id) [matched to]

expense_policies
  ├── policy_rules (expense_policy_id)
  └── policy_department_assignments (expense_policy_id)

approval_chains
  ├── approval_chain_steps (approval_chain_id)
  └── approval_requests (approval_chain_id)

approval_requests
  └── approval_actions (approval_request_id)

export_batches
  └── export_batch_items (export_batch_id)
```

---

## Notes

1. **UUIDs**: All primary keys use UUID (CHAR(36)) for better distribution and security.

2. **Timestamps**: All tables include `created_at` and most include `updated_at` for audit purposes.

3. **Soft Deletes**: Consider adding `deleted_at` columns for soft delete functionality where needed.

4. **Encryption**: Sensitive data (bank accounts, etc.) should be encrypted at rest using `encrypted_*` fields.

5. **Indexing**: Additional composite indexes may be needed based on query patterns.

6. **Partitioning**: Consider partitioning large tables (expenses, audit_log, notifications) by date for performance.

7. **Credit Card Matching Algorithm**:
   - Match by amount (exact or within tolerance)
   - Match by date (transaction date within 3-5 days of expense date)
   - Match by merchant name (fuzzy matching)
   - Confidence score based on multiple factors

8. **Foreign Key Constraints**: Implement appropriate ON DELETE and ON UPDATE actions based on business rules.
