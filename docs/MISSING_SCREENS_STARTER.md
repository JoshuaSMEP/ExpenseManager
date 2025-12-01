# Missing Screens Implementation Guide

This document provides everything an agent needs to build the 8 missing screens for the Glass Expense App.

---

## Project Overview

**App Name:** Glass
**Tech Stack:** React 18 + Vite + TypeScript + Tailwind CSS v4 + Zustand + Framer Motion
**Design:** Full glassmorphism with dark mode theme
**Current Version:** 1.0.1

---

## Directory Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AnimatedBackground.tsx   # Starfield + gradient background
│   │   ├── Navigation.tsx            # Bottom mobile nav
│   │   ├── Sidebar.tsx               # Desktop sidebar
│   │   └── index.ts
│   └── ui/
│       ├── Badge.tsx                 # Status badges
│       ├── Button.tsx                # Glass buttons
│       ├── FloatingActionButton.tsx  # FAB component
│       ├── GlassCard.tsx             # Glass card wrapper
│       ├── Input.tsx                 # Form inputs
│       └── index.ts
├── pages/
│   ├── APDashboardPage.tsx           # ✅ Finance/AP dashboard
│   ├── ApprovalPage.tsx              # ✅ Manager approvals
│   ├── DashboardPage.tsx             # ✅ Main dashboard
│   ├── ExpenseDetailPage.tsx         # ✅ View/edit expense
│   ├── ExpensesPage.tsx              # ✅ My expenses list
│   ├── LoginPage.tsx                 # ✅ Login screen
│   ├── NewExpensePage.tsx            # ✅ Create expense
│   ├── NotificationsPage.tsx         # ✅ Notifications
│   ├── OnboardingPage.tsx            # ✅ First-time onboarding
│   ├── SettingsPage.tsx              # ✅ User settings
│   └── index.ts                      # Export all pages
├── store/
│   └── useStore.ts                   # Zustand state management
├── types/
│   └── index.ts                      # TypeScript interfaces
├── utils/
│   ├── confetti.ts                   # Confetti animations
│   └── formatters.ts                 # Currency, date formatting
├── App.tsx                           # Router + protected routes
└── main.tsx                          # Entry point
```

---

## 8 Screens to Build

| # | Screen Name | Route | Description |
|---|------------|-------|-------------|
| 1 | Reports & Export | `/reports` | Pre-built reports + custom export to accounting systems |
| 2 | Corporate Card Feed | `/cards` | Auto-imported card transactions waiting to be matched |
| 3 | Trip/Project Expenses | `/trips` | Group expenses by trip or project |
| 4 | Policy Rules Overview | `/policy` | Company expense policy readable view |
| 5 | Search & Audit Log | `/search` | Global search + full action history |
| 6 | Admin Panel | `/admin` | Invite users, set policy rules, connect integrations (admin only) |
| 7 | Edit Expense Page | `/expense/edit/:id` | Edit an existing expense |
| 8 | Manual Expense Entry | `/expense/manual` | Manual form without receipt photo |

---

## Existing Types (src/types/index.ts)

```typescript
export type UserRole = 'employee' | 'manager' | 'finance' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  profilePhotoUrl?: string;
  department: string;
  jobTitle: string;
  managerId?: string;
  role: UserRole;
  createdAt: Date;
}

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'exported';

export type ExpenseCategory =
  | 'meals'
  | 'travel'
  | 'supplies'
  | 'entertainment'
  | 'lodging'
  | 'transportation'
  | 'other';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  merchantName: string;
  expenseDate: Date;
  category: ExpenseCategory;
  projectId?: string;
  receiptImageUrl?: string;
  status: ExpenseStatus;
  notes?: string;
  policyViolations?: string[];
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  paidAt?: Date;
  glCode?: string;
  taxAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalAction {
  id: string;
  expenseId: string;
  approverId: string;
  action: 'approved' | 'rejected' | 'commented';
  comment?: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval_needed' | 'reimbursed' | 'comment' | 'rejected' | 'submitted';
  read: boolean;
  deepLinkUrl?: string;
  createdAt: Date;
}

export interface Trip {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  description?: string;
}
```

### New Types to Add

```typescript
// Add to src/types/index.ts

export interface CardTransaction {
  id: string;
  userId: string;
  cardLast4: string;
  merchant: string;
  amount: number;
  currency: string;
  postedDate: Date;
  matchedExpenseId?: string;
  status: 'unmatched' | 'matched' | 'ignored';
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  category?: ExpenseCategory;
  maxAmount?: number;
  requiresReceipt: boolean;
  requiresApproval: boolean;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'expense' | 'user' | 'policy' | 'export';
  entityId: string;
  details?: string;
  ipAddress?: string;
  timestamp: Date;
}

export interface ExportBatch {
  id: string;
  createdBy: string;
  dateRange: { start: Date; end: Date };
  totalAmount: number;
  expenseCount: number;
  status: 'prepared' | 'exported' | 'imported';
  format: 'csv' | 'pdf' | 'viewpoint';
  fileUrl?: string;
  createdAt: Date;
}
```

---

## Existing UI Components

### GlassCard
```tsx
import { GlassCard } from '../components/ui';

<GlassCard
  className="mb-4"
  hoverable={true}           // Default: true - scales on hover
  padding="lg"               // 'none' | 'sm' | 'md' | 'lg'
  style={{ backgroundColor: 'rgba(0, 0, 0, 0.07)' }}  // Optional darker glass
>
  {children}
</GlassCard>
```

### Button
```tsx
import { Button } from '../components/ui';

<Button
  variant="primary"          // 'primary' | 'secondary' | 'outline' | 'success' | 'ghost'
  size="md"                  // 'sm' | 'md' | 'lg'
  loading={false}
  icon={<Icon />}
  fullWidth={false}
  onClick={() => {}}
>
  Button Text
</Button>
```

### Input
```tsx
import { Input } from '../components/ui';

<Input
  type="text"
  placeholder="Enter value"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  icon={<Icon />}
  disabled={false}
/>
```

### Badge
```tsx
import { Badge } from '../components/ui';

<Badge status="pending" />   // 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'exported'
```

### FloatingActionButton
```tsx
import { FloatingActionButton } from '../components/ui';

<FloatingActionButton onClick={() => navigate('/expense/new')} />
```

---

## Design System

### Colors (Tailwind Classes)
```css
/* Glass card background */
bg-white/10 to bg-white/18

/* Dark glass overlay */
style={{ backgroundColor: 'rgba(0, 0, 0, 0.07)' }}
style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}

/* Text */
text-white                  /* Headings */
text-white/80               /* Body text */
text-white/60               /* Secondary text */
text-white/50               /* Labels */
text-white/30               /* Muted text */

/* Accent colors */
text-accent-primary         /* Teal/cyan #00f5ff */
bg-accent-primary
text-accent-secondary       /* Pink #ec4899 */

/* Status colors */
text-success-primary        /* Green #00f5a0 */
bg-success-primary/20       /* Green background */
text-warning               /* Amber #ffb800 */
bg-warning/20              /* Warning background */
text-red-400               /* Error/rejected */
bg-red-500/20              /* Error background */
```

### Spacing
```css
/* Cards */
p-4, p-6, p-8              /* Card padding */
mb-4, mb-6                 /* Card margins */
gap-3, gap-4               /* Flex gaps */

/* Sections */
mt-4, mt-6, mt-8           /* Section spacing */
space-y-3, space-y-4       /* Vertical lists */
```

### Rounded Corners
```css
rounded-xl                 /* 12px - most elements */
rounded-2xl                /* 16px - cards, buttons */
rounded-full               /* Circular elements */
```

---

## Page Template

Use this template for all new pages:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, /* other icons */ } from 'lucide-react';
import { GlassCard, Button, Input, Badge } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/formatters';

export function PageNamePage() {
  const navigate = useNavigate();
  const { user, expenses } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Page Title</h1>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="mb-4">
            {/* Card content */}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
```

---

## Screen Specifications

### 1. Reports & Export Page (`/reports`)

**Purpose:** Generate reports and export expense data to accounting systems

**Features:**
- Date range picker (this month, last month, Q1-Q4, custom)
- Filter by status (approved, paid, exported)
- Filter by department/employee
- Summary statistics (total expenses, by category, by employee)
- Export buttons:
  - CSV Download
  - PDF Report
  - Viewpoint Vista format (special CSV with GL codes)
- Mark selected expenses as "exported"

**Mock Data:**
```typescript
const mockReports = {
  thisMonth: {
    totalExpenses: 45,
    totalAmount: 12450.00,
    byCategory: {
      meals: 3200,
      travel: 5100,
      supplies: 1800,
      lodging: 2350,
    },
    byStatus: {
      approved: 15,
      paid: 25,
      exported: 5,
    }
  }
};
```

**UI Components:**
- GlassCard for each report section
- Date range buttons/selector
- Table with expense list
- Export dropdown with format options
- Summary stat cards (similar to Dashboard)

---

### 2. Corporate Card Feed (`/cards`)

**Purpose:** Show auto-imported card transactions and match them to expenses

**Features:**
- List of unmatched card transactions
- Match button → opens modal to link to existing expense or create new
- Ignore button → mark transaction as ignored
- Filter by status (unmatched, matched, ignored)
- Card last 4 digits shown for each transaction

**Mock Data:**
```typescript
const mockCardTransactions: CardTransaction[] = [
  {
    id: 'ct1',
    userId: '1',
    cardLast4: '4242',
    merchant: 'UBER *TRIP',
    amount: 34.50,
    currency: 'USD',
    postedDate: new Date('2024-11-29'),
    status: 'unmatched',
  },
  {
    id: 'ct2',
    userId: '1',
    cardLast4: '4242',
    merchant: 'DELTA AIR LINES',
    amount: 425.00,
    currency: 'USD',
    postedDate: new Date('2024-11-28'),
    status: 'unmatched',
  },
  // ... more transactions
];
```

**UI Components:**
- Transaction cards with merchant, amount, date, card info
- Status badge (unmatched = amber, matched = green, ignored = gray)
- Action buttons: "Match to Expense" | "Create Expense" | "Ignore"
- Empty state if no unmatched transactions

---

### 3. Trip/Project Expenses (`/trips`)

**Purpose:** Group expenses by trip or project for easy tracking

**Features:**
- List of trips/projects with summary (total spent, budget remaining)
- Click trip → show all expenses in that trip
- Create new trip button
- Add expense to trip from expense detail page
- Budget progress bar

**Mock Data:**
```typescript
const mockTrips: Trip[] = [
  {
    id: 'trip1',
    name: 'Q4 Sales Conference - Las Vegas',
    startDate: new Date('2024-11-15'),
    endDate: new Date('2024-11-18'),
    budget: 2000,
    description: 'Annual sales kickoff conference',
  },
  {
    id: 'trip2',
    name: 'Client Visit - NYC',
    startDate: new Date('2024-11-20'),
    endDate: new Date('2024-11-21'),
    budget: 1500,
  },
];
```

**UI Components:**
- Trip cards with name, dates, budget progress
- Expense list within each trip
- "Add Trip" modal/form
- Budget indicator (green = under, amber = near, red = over)

---

### 4. Policy Rules Overview (`/policy`)

**Purpose:** Display company expense policy in a readable format

**Features:**
- List of policy rules by category
- Visual indicators for limits (e.g., "Meals: $75/day max")
- Receipt requirements shown
- Approval thresholds displayed
- Search/filter rules

**Mock Data:**
```typescript
const mockPolicyRules: PolicyRule[] = [
  {
    id: 'p1',
    name: 'Daily Meal Limit',
    description: 'Maximum $75 per day for meals. Receipts required for all meal expenses.',
    category: 'meals',
    maxAmount: 75,
    requiresReceipt: true,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 'p2',
    name: 'Lodging Limit',
    description: 'Maximum $200 per night for hotels. Pre-approval required for amounts over $150.',
    category: 'lodging',
    maxAmount: 200,
    requiresReceipt: true,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 'p3',
    name: 'Receipt Requirement',
    description: 'Receipts are required for all expenses over $25.',
    maxAmount: 25,
    requiresReceipt: true,
    requiresApproval: false,
    isActive: true,
  },
  // ... more rules
];
```

**UI Components:**
- Category sections with glassmorphism headers
- Rule cards with icon, name, description, limits
- Visual limit indicators (progress-bar style)
- "Receipt Required" badges

---

### 5. Search & Audit Log (`/search`)

**Purpose:** Global search across all expenses + view audit trail

**Features:**
- Search input with instant results
- Search by: merchant, amount, date, category, employee
- Recent searches
- Audit log section showing all actions
- Filter audit log by action type

**Mock Data:**
```typescript
const mockAuditLogs: AuditLog[] = [
  {
    id: 'log1',
    userId: '1',
    userName: 'Sarah Johnson',
    action: 'Created expense',
    entityType: 'expense',
    entityId: '5',
    details: 'Starbucks - $25.50',
    timestamp: new Date(),
  },
  {
    id: 'log2',
    userId: '2',
    userName: 'Mike Chen',
    action: 'Approved expense',
    entityType: 'expense',
    entityId: '1',
    details: 'Uber - $124.50',
    timestamp: new Date(Date.now() - 86400000),
  },
  // ... more logs
];
```

**UI Components:**
- Large search input at top
- Instant search results list
- Tabbed view: "Search Results" | "Audit Log"
- Audit log timeline with user avatars
- Action type badges (created, approved, rejected, exported)

---

### 6. Admin Panel (`/admin`)

**Purpose:** Admin-only settings for users, policies, and integrations

**Access:** Only visible to users with `role: 'admin'`

**Features:**
- **Users Tab:**
  - List all users
  - Invite new user (email)
  - Change user role
  - Deactivate user

- **Policy Tab:**
  - Edit policy rules
  - Add new rules
  - Enable/disable rules

- **Integrations Tab:**
  - Connect accounting systems (QuickBooks, Viewpoint Vista)
  - API key management
  - Webhook settings

**Mock Data:**
```typescript
const mockAdminUsers = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'employee', status: 'active' },
  { id: '2', name: 'Mike Chen', email: 'mike@company.com', role: 'manager', status: 'active' },
  { id: '3', name: 'Lisa Wang', email: 'lisa@company.com', role: 'finance', status: 'active' },
  { id: '4', name: 'Admin User', email: 'admin@company.com', role: 'admin', status: 'active' },
];

const mockIntegrations = [
  { id: 'qb', name: 'QuickBooks', status: 'disconnected', icon: '📊' },
  { id: 'vp', name: 'Viewpoint Vista', status: 'connected', icon: '🏗️' },
  { id: 'xero', name: 'Xero', status: 'disconnected', icon: '💰' },
];
```

**UI Components:**
- Tab navigation (Users | Policy | Integrations)
- User table with role dropdowns
- Invite user modal
- Policy rule editor
- Integration cards with connect/disconnect buttons

---

### 7. Edit Expense Page (`/expense/edit/:id`)

**Purpose:** Edit an existing expense (only if status is draft or rejected)

**Features:**
- Pre-fill form with existing expense data
- Same fields as NewExpensePage
- Show receipt image if exists
- Replace receipt option
- Save/Cancel buttons
- Can only edit draft or rejected expenses

**Implementation:**
- Copy NewExpensePage structure
- Load expense by ID from store
- Pre-populate all fields
- Use `updateExpense` action instead of `addExpense`

---

### 8. Manual Expense Entry (`/expense/manual`)

**Purpose:** Create expense without receipt photo (manual form only)

**Features:**
- Same as NewExpensePage but without camera/upload step
- All fields visible immediately
- Optional receipt upload
- Useful for expenses where receipt is lost or not applicable

**Implementation:**
- Similar to NewExpensePage
- Skip the receipt capture step
- Show form immediately

---

## Adding New Routes

Update `src/App.tsx`:

```tsx
// Add to imports
import {
  // ... existing imports
  ReportsPage,
  CardsPage,
  TripsPage,
  PolicyPage,
  SearchPage,
  AdminPage,
  EditExpensePage,
  ManualExpensePage,
} from './pages';

// Add inside Routes, before the default redirect
<Route
  path="/reports"
  element={
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/cards"
  element={
    <ProtectedRoute>
      <CardsPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/trips"
  element={
    <ProtectedRoute>
      <TripsPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/policy"
  element={
    <ProtectedRoute>
      <PolicyPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/search"
  element={
    <ProtectedRoute>
      <SearchPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/expense/edit/:id"
  element={
    <ProtectedRoute>
      <EditExpensePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/expense/manual"
  element={
    <ProtectedRoute>
      <ManualExpensePage />
    </ProtectedRoute>
  }
/>
```

Update `src/pages/index.ts`:

```typescript
// Add exports for new pages
export { ReportsPage } from './ReportsPage';
export { CardsPage } from './CardsPage';
export { TripsPage } from './TripsPage';
export { PolicyPage } from './PolicyPage';
export { SearchPage } from './SearchPage';
export { AdminPage } from './AdminPage';
export { EditExpensePage } from './EditExpensePage';
export { ManualExpensePage } from './ManualExpensePage';
```

---

## Store Updates

Add to `src/store/useStore.ts`:

```typescript
// Add new state
cardTransactions: CardTransaction[];
trips: Trip[];
policyRules: PolicyRule[];
auditLogs: AuditLog[];
exportBatches: ExportBatch[];

// Add new actions
addTrip: (trip: Omit<Trip, 'id'>) => void;
updateTrip: (id: string, updates: Partial<Trip>) => void;
deleteTrip: (id: string) => void;

matchCardTransaction: (transactionId: string, expenseId: string) => void;
ignoreCardTransaction: (transactionId: string) => void;

createExportBatch: (options: { dateRange: { start: Date; end: Date }; format: string }) => void;

// Add mock data for new entities
```

---

## Navigation Updates

Consider adding these pages to the Sidebar (`src/components/layout/Sidebar.tsx`):

```tsx
// Add to nav items for finance/admin users
{ path: '/reports', icon: FileText, label: 'Reports' },
{ path: '/cards', icon: CreditCard, label: 'Card Feed' },
{ path: '/trips', icon: Briefcase, label: 'Trips' },
{ path: '/policy', icon: Shield, label: 'Policy' },
{ path: '/search', icon: Search, label: 'Search' },
{ path: '/admin', icon: Settings, label: 'Admin' }, // admin only
```

---

## Testing Checklist

For each new page, verify:

- [ ] Page renders without errors
- [ ] Navigation to/from page works
- [ ] Mobile responsive (bottom nav padding)
- [ ] Desktop responsive (sidebar offset)
- [ ] Framer Motion animations work
- [ ] Glass card styling is consistent
- [ ] Dark mode looks correct
- [ ] Empty states are handled
- [ ] Loading states work
- [ ] User role restrictions work (Admin panel)

---

## Icons Reference (Lucide React)

```tsx
import {
  // Navigation
  ChevronLeft, ChevronRight, ArrowLeft, ArrowRight,

  // Actions
  Plus, Edit, Trash2, Check, X, Search, Filter,
  Download, Upload, Send, RefreshCw,

  // Content
  FileText, File, Receipt, CreditCard, DollarSign,
  Calendar, Clock, Tag, Briefcase, Building,

  // Status
  AlertTriangle, AlertCircle, CheckCircle, XCircle, Info,

  // UI
  Menu, MoreVertical, Settings, User, Users, Shield,
  Eye, EyeOff, Lock, Unlock,

  // Charts
  BarChart2, PieChart, TrendingUp, TrendingDown,
} from 'lucide-react';
```

---

## Quick Start Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## Questions?

Refer to existing pages for implementation patterns:
- `DashboardPage.tsx` - Stats cards, recent activity
- `ExpensesPage.tsx` - Filtered lists, tabs
- `APDashboardPage.tsx` - Tables, bulk actions
- `ApprovalPage.tsx` - Swipeable cards, actions
- `SettingsPage.tsx` - Forms, toggles
- `NewExpensePage.tsx` - Multi-step form
