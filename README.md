# Glass Expense App

A modern, beautiful expense management application with a stunning glassmorphism UI design. Built with React, TypeScript, and Vite.

## Overview

Glass Expense App is a comprehensive expense tracking and approval system that integrates with SuiteCRM for user management. The application features a beautiful dark mode with animated starfield backgrounds, aurora effects, and neon purple/magenta accents.

## Features

- **Expense Submission** - Create and submit expenses with receipt upload and OCR auto-fill
- **Approval Workflow** - Multi-level approval chains with manager routing
- **Dashboard** - Real-time expense statistics and recent activity
- **Credit Card Integration** - Match corporate card transactions to expenses
- **Policy Enforcement** - Automatic policy violation detection and warnings
- **Reimbursement Tracking** - Track expense status from submission to payment
- **Dark Mode** - Stunning animated dark theme with space/aurora effects
- **Mobile Responsive** - Works beautifully on all device sizes

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Framer Motion
- **State Management**: Zustand
- **Routing**: React Router v6
- **Database**: MySQL 8.x
- **User Integration**: SuiteCRM (users synced daily)

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.x
- Access to SuiteCRM database (for user sync)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev -- --port 5001 --host

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file in the parent directory (`/var/www/html/public/apps/expenses/`):

```env
DB_HOST=localhost
DB_NAME=apps
DB_USER=apps
DB_PASS=your_password
```

## User Access

Access to this application is controlled via the `users_cstm` table:

| Field | Description |
|-------|-------------|
| `expense_mgr_c` | If `1`, user has access to the expense app |
| `is_onboarded_c` | If `1`, user has completed onboarding |

Users are synced daily from `crm.users` and `crm.users_cstm` tables at 2:00 AM via MySQL scheduled event.

## Project Structure

```
glass-expense-app/
├── src/
│   ├── components/
│   │   ├── layout/          # Navigation, Sidebar, AnimatedBackground
│   │   └── ui/              # Reusable UI components (GlassCard, Button, etc.)
│   ├── pages/               # Route pages
│   │   ├── DashboardPage.tsx
│   │   ├── ExpensesPage.tsx
│   │   ├── ExpenseDetailPage.tsx
│   │   ├── NewExpensePage.tsx
│   │   ├── ApprovalPage.tsx
│   │   ├── APDashboardPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── OnboardingPage.tsx
│   ├── store/               # Zustand state management
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles & dark mode
├── docs/                    # Documentation
│   └── CHANGELOG.md         # Version history
├── DATABASE_SCHEMA.md       # Database documentation
└── README.md                # This file
```

## Database

The application uses 36 MySQL tables organized into 11 modules:

1. **Users & Authentication** - users, user_sessions, magic_links
2. **Expenses** - expenses, expense_receipts, expense_policy_violations, expense_comments, expense_history
3. **Expense Reports** - expense_reports, expense_report_items
4. **Credit Cards** - credit_cards, credit_card_statements, credit_card_transactions, transaction_match_suggestions
5. **Approval Workflow** - approval_chains, approval_chain_steps, approval_requests, approval_actions
6. **Policy Management** - expense_policies, policy_rules, policy_department_assignments
7. **Reimbursement** - reimbursement_methods, export_batches, export_batch_items
8. **Notifications** - notifications, notification_preferences
9. **Categories & Config** - expense_categories, gl_codes, cost_centers, departments
10. **Mileage Tracking** - mileage_rates, mileage_logs
11. **Audit & Compliance** - audit_log, system_settings

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete schema documentation.

## User Sync

Users are automatically synced from SuiteCRM via a MySQL scheduled event:

- **Event Name**: `sync_users_daily`
- **Schedule**: Daily at 2:00 AM
- **Tables Synced**: `users`, `users_cstm`
- **Stored Procedure**: `apps.sync_users_from_crm()`

To manually trigger a sync:

```sql
CALL apps.sync_users_from_crm();
```

## UI/UX Features

### Dark Mode
- Deep space gradient background with purple/magenta hues
- Animated twinkling starfield (two layers)
- Aurora borealis effect animation
- Neon glow effects on interactive elements
- Glass cards with purple tint and enhanced blur

### Animations
- Page transitions with Framer Motion
- Confetti celebration on expense approval
- Smooth micro-interactions throughout
- Animated progress indicators

## Routes

| Path | Description | Access |
|------|-------------|--------|
| `/login` | Login page | Public |
| `/onboarding` | New user onboarding | Authenticated, not onboarded |
| `/dashboard` | Main dashboard | Authenticated, onboarded |
| `/expenses` | Expense list | Authenticated, onboarded |
| `/expense/new` | Create new expense | Authenticated, onboarded |
| `/expense/:id` | Expense details | Authenticated, onboarded |
| `/approvals` | Approval queue | Authenticated, onboarded |
| `/ap-dashboard` | AP team dashboard | Authenticated, onboarded |
| `/notifications` | Notification center | Authenticated, onboarded |
| `/settings` | User settings | Authenticated, onboarded |

## License

Proprietary - Internal Use Only

## Support

For issues or questions, contact the development team.
