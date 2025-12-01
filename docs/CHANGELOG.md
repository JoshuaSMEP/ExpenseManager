# Changelog

All notable changes to the Glass Expense App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-12-01

### Added

#### Core Features
- **Expense Management**
  - Create, edit, and delete expense entries
  - Receipt image upload with OCR auto-fill capability
  - Support for 12 expense categories (meals, travel, transportation, lodging, supplies, entertainment, communication, software, equipment, training, mileage, other)
  - Expense status workflow: Draft -> Submitted -> Approved/Rejected -> Paid -> Exported
  - Policy violation detection and warnings

- **Approval Workflow**
  - Swipeable approval interface for managers
  - Approve/reject expenses with optional comments
  - Progress indicator showing queue position
  - Confetti celebration on approval

- **Dashboard**
  - Real-time expense statistics (pending, approved, total reimbursements)
  - Recent expense activity feed
  - Quick action buttons

- **User Management**
  - SuiteCRM integration for user data
  - Daily automated user sync (2:00 AM)
  - Role-based access control via `expense_mgr_c` field
  - Onboarding flow for new users via `is_onboarded_c` field

- **Notifications**
  - In-app notification center
  - Notification badge with unread count
  - Support for multiple notification types (approval needed, approved, rejected, reimbursed, comments, policy violations)

- **Settings**
  - User profile display
  - Dark mode toggle
  - Notification preferences
  - Account settings

#### UI/UX
- **Glassmorphism Design**
  - Frosted glass card components with backdrop blur
  - Semi-transparent overlays
  - Subtle border highlights

- **Dark Mode Theme**
  - Deep space gradient background (#0a0a0f to #1a0a2e)
  - Animated twinkling starfield (two layers)
  - Aurora borealis color shift animation
  - Purple/magenta accent colors (#a855f7, #ec4899)
  - Neon glow effects on buttons and interactive elements
  - Enhanced glass cards with purple tint

- **Animations**
  - Framer Motion page transitions
  - Smooth micro-interactions
  - Confetti celebration effects
  - Pulse glow on selected states

- **Responsive Design**
  - Mobile-first approach
  - Bottom navigation for mobile
  - Sidebar navigation for desktop
  - Adaptive layouts for all screen sizes

#### Database
- **36 MySQL Tables** across 11 modules:
  1. Users & Authentication (3 tables)
  2. Expenses (5 tables)
  3. Expense Reports (2 tables)
  4. Credit Card Integration (4 tables)
  5. Approval Workflow (4 tables)
  6. Policy Management (3 tables)
  7. Reimbursement & Export (3 tables)
  8. Notifications (2 tables)
  9. Categories & Configuration (4 tables)
  10. Mileage Tracking (2 tables)
  11. Audit & Compliance (2 tables)

- **User Sync System**
  - Stored procedure: `apps.sync_users_from_crm()`
  - MySQL scheduled event: `sync_users_daily`
  - Syncs `users` and `users_cstm` from CRM database

#### Technical
- React 18 with TypeScript
- Vite build system
- Tailwind CSS v4
- Zustand state management
- React Router v6 for navigation
- Framer Motion for animations

### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | LoginPage | User authentication |
| `/onboarding` | OnboardingPage | New user setup wizard |
| `/dashboard` | DashboardPage | Main dashboard with stats |
| `/expenses` | ExpensesPage | Expense list with filters |
| `/expense/new` | NewExpensePage | Create new expense |
| `/expense/:id` | ExpenseDetailPage | View expense details |
| `/approvals` | ApprovalPage | Manager approval queue |
| `/ap-dashboard` | APDashboardPage | AP team overview |
| `/notifications` | NotificationsPage | Notification center |
| `/settings` | SettingsPage | User preferences |

### Security
- Protected routes requiring authentication
- Onboarding gate for new users
- Role-based access via CRM integration

---

## [Unreleased]

### Planned
- Backend API integration
- Real receipt OCR processing
- Email notifications
- Push notifications
- Credit card statement import
- Mileage tracking with GPS
- Expense report bundling
- Export to accounting systems (QuickBooks, Sage, Viewpoint)
- Advanced reporting and analytics

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2025-12-01 | Initial release with full UI, database schema, and CRM integration |

---

## Contributing

This is an internal application. For feature requests or bug reports, contact the development team.

## Authors

- Development Team

## License

Proprietary - Internal Use Only
