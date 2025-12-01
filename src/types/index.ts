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
