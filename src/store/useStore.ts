import { create } from 'zustand';
import type { User, Expense, Notification, ExpenseStatus, Trip, CardTransaction, PolicyRule, AuditLog, ExportBatch } from '../types';

// Mock data for demo
const mockUser: User = {
  id: '1',
  email: 'sarah.johnson@company.com',
  fullName: 'Sarah Johnson',
  profilePhotoUrl: 'https://i.pravatar.cc/150?u=sarah',
  department: 'Engineering',
  jobTitle: 'Senior Developer',
  managerId: '2',
  role: 'employee',
  createdAt: new Date(),
};

const mockExpenses: Expense[] = [
  {
    id: '1',
    userId: '1',
    amount: 124.50,
    currency: 'USD',
    merchantName: 'Uber',
    expenseDate: new Date('2024-11-28'),
    category: 'transportation',
    expenseType: 'reimbursement',
    status: 'approved',
    notes: 'Uber ride to client meeting',
    receiptImageUrl: 'https://picsum.photos/seed/receipt1/300/400',
    receiptFiles: [
      {
        id: 'r1-1',
        url: 'https://picsum.photos/seed/receipt1/300/400',
        type: 'image',
        name: 'Uber Receipt.jpg',
      },
    ],
    submittedAt: new Date('2024-11-28'),
    approvedAt: new Date('2024-11-29'),
    approvedBy: '2',
    createdAt: new Date('2024-11-28'),
    updatedAt: new Date('2024-11-29'),
  },
  {
    id: '2',
    userId: '1',
    amount: 45.99,
    currency: 'USD',
    merchantName: 'Office Depot',
    expenseDate: new Date('2024-11-27'),
    category: 'supplies',
    expenseType: 'company_card',
    status: 'unmatched',
    notes: 'Printer paper and pens',
    receiptImageUrl: 'https://picsum.photos/seed/receipt2/300/400',
    receiptFiles: [
      {
        id: 'r2-1',
        url: 'https://picsum.photos/seed/receipt2/300/400',
        type: 'image',
        name: 'Office Depot Receipt.png',
      },
      {
        id: 'r2-2',
        url: 'https://picsum.photos/seed/receipt2b/300/400',
        type: 'image',
        name: 'Items List.jpg',
      },
    ],
    submittedAt: new Date('2024-11-27'),
    createdAt: new Date('2024-11-27'),
    updatedAt: new Date('2024-11-27'),
  },
  {
    id: '3',
    userId: '1',
    amount: 89.00,
    currency: 'USD',
    merchantName: 'The Capital Grille',
    expenseDate: new Date('2024-11-25'),
    category: 'meals',
    expenseType: 'reimbursement',
    status: 'paid',
    notes: 'Client dinner',
    receiptImageUrl: 'https://picsum.photos/seed/receipt3/300/400',
    receiptFiles: [
      {
        id: 'r3-1',
        url: 'https://picsum.photos/seed/receipt3/300/400',
        type: 'image',
        name: 'Dinner Receipt.jpg',
      },
    ],
    submittedAt: new Date('2024-11-25'),
    approvedAt: new Date('2024-11-26'),
    approvedBy: '2',
    paidAt: new Date('2024-11-27'),
    createdAt: new Date('2024-11-25'),
    updatedAt: new Date('2024-11-27'),
  },
  {
    id: '4',
    userId: '1',
    amount: 350.00,
    currency: 'USD',
    merchantName: 'Marriott Hotel',
    expenseDate: new Date('2024-11-20'),
    category: 'lodging',
    expenseType: 'reimbursement',
    status: 'rejected',
    notes: 'Conference hotel stay',
    policyViolations: ['Exceeded daily lodging limit of $200'],
    receiptImageUrl: 'https://picsum.photos/seed/receipt4/300/400',
    receiptFiles: [
      {
        id: 'r4-1',
        url: 'https://picsum.photos/seed/receipt4/300/400',
        type: 'image',
        name: 'Hotel Folio.jpg',
      },
    ],
    submittedAt: new Date('2024-11-20'),
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2024-11-21'),
  },
  {
    id: '5',
    userId: '1',
    amount: 25.50,
    currency: 'USD',
    merchantName: 'Starbucks',
    expenseDate: new Date(),
    category: 'meals',
    expenseType: 'reimbursement',
    status: 'draft',
    notes: 'Team coffee meeting',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Expense Approved!',
    message: 'Your $124.50 Uber expense has been approved.',
    type: 'reimbursed',
    read: false,
    createdAt: new Date(),
  },
  {
    id: '2',
    userId: '1',
    title: 'Payment Sent',
    message: "You're getting paid tomorrow! $89.00 reimbursement processed.",
    type: 'reimbursed',
    read: false,
    createdAt: new Date(Date.now() - 86400000),
  },
];

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;

  // Expenses
  expenses: Expense[];
  selectedExpense: Expense | null;

  // Notifications
  notifications: Notification[];

  // Trips
  trips: Trip[];

  // Card Transactions
  cardTransactions: CardTransaction[];

  // Policy Rules
  policyRules: PolicyRule[];

  // Audit Logs
  auditLogs: AuditLog[];

  // Export Batches
  exportBatches: ExportBatch[];

  // UI State
  isDarkMode: boolean;
  isLoading: boolean;
  animatedBackground: boolean;

  // Actions
  login: (email: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  selectExpense: (expense: Expense | null) => void;
  submitExpense: (id: string) => void;
  approveExpense: (id: string, approverId: string) => void;
  rejectExpense: (id: string, approverId: string, reason?: string) => void;

  // Trip actions
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

  // Card transaction actions
  matchCardTransaction: (transactionId: string, expenseId: string) => void;
  ignoreCardTransaction: (transactionId: string) => void;

  // Export actions
  createExportBatch: (options: { dateRange: { start: Date; end: Date }; format: 'csv' | 'pdf' | 'viewpoint' }) => void;

  markNotificationRead: (id: string) => void;

  toggleDarkMode: () => void;
  toggleAnimatedBackground: () => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isOnboarded: false,
  expenses: [],
  selectedExpense: null,
  notifications: [],
  trips: [],
  cardTransactions: [],
  policyRules: [],
  auditLogs: [],
  exportBatches: [],
  isDarkMode: true,
  isLoading: false,
  animatedBackground: true,

  // Auth actions
  login: async (email: string) => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    set({
      user: { ...mockUser, email },
      isAuthenticated: true,
      expenses: mockExpenses,
      notifications: mockNotifications,
      isLoading: false,
    });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      expenses: [],
      notifications: [],
    });
  },

  completeOnboarding: () => {
    set({ isOnboarded: true });
  },

  // Expense actions
  addExpense: (expense) => {
    const newExpense: Expense = {
      ...expense,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      expenses: [newExpense, ...state.expenses],
    }));
  },

  updateExpense: (id, updates) => {
    set((state) => ({
      expenses: state.expenses.map((exp) =>
        exp.id === id ? { ...exp, ...updates, updatedAt: new Date() } : exp
      ),
    }));
  },

  deleteExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((exp) => exp.id !== id),
    }));
  },

  selectExpense: (expense) => {
    set({ selectedExpense: expense });
  },

  submitExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.map((exp) =>
        exp.id === id
          ? { ...exp, status: 'submitted' as ExpenseStatus, submittedAt: new Date(), updatedAt: new Date() }
          : exp
      ),
    }));
  },

  approveExpense: (id, approverId) => {
    set((state) => ({
      expenses: state.expenses.map((exp) =>
        exp.id === id
          ? {
              ...exp,
              status: 'approved' as ExpenseStatus,
              approvedAt: new Date(),
              approvedBy: approverId,
              updatedAt: new Date(),
            }
          : exp
      ),
    }));
  },

  rejectExpense: (id, _approverId, reason) => {
    set((state) => ({
      expenses: state.expenses.map((exp) =>
        exp.id === id
          ? {
              ...exp,
              status: 'rejected' as ExpenseStatus,
              policyViolations: reason ? [reason] : exp.policyViolations,
              updatedAt: new Date(),
            }
          : exp
      ),
    }));
  },

  // Trip actions
  addTrip: (trip) => {
    const newTrip: Trip = {
      ...trip,
      id: Math.random().toString(36).substr(2, 9),
    };
    set((state) => ({
      trips: [...state.trips, newTrip],
    }));
  },

  updateTrip: (id, updates) => {
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === id ? { ...trip, ...updates } : trip
      ),
    }));
  },

  deleteTrip: (id) => {
    set((state) => ({
      trips: state.trips.filter((trip) => trip.id !== id),
    }));
  },

  // Card transaction actions
  matchCardTransaction: (transactionId, expenseId) => {
    set((state) => ({
      cardTransactions: state.cardTransactions.map((t) =>
        t.id === transactionId
          ? { ...t, status: 'matched' as const, matchedExpenseId: expenseId }
          : t
      ),
    }));
  },

  ignoreCardTransaction: (transactionId) => {
    set((state) => ({
      cardTransactions: state.cardTransactions.map((t) =>
        t.id === transactionId ? { ...t, status: 'ignored' as const } : t
      ),
    }));
  },

  // Export actions
  createExportBatch: (options) => {
    const newBatch: ExportBatch = {
      id: Math.random().toString(36).substr(2, 9),
      createdBy: '1',
      dateRange: options.dateRange,
      totalAmount: 0,
      expenseCount: 0,
      status: 'prepared',
      format: options.format,
      createdAt: new Date(),
    };
    set((state) => ({
      exportBatches: [...state.exportBatches, newBatch],
    }));
  },

  // Notification actions
  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
    }));
  },

  // UI actions
  toggleDarkMode: () => {
    set((state) => {
      const newMode = !state.isDarkMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDarkMode: newMode };
    });
  },

  toggleAnimatedBackground: () => {
    set((state) => ({ animatedBackground: !state.animatedBackground }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
