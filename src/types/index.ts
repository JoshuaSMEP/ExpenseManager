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
