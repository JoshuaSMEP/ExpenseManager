import { clsx } from 'clsx';
import type { ExpenseStatus } from '../../types';

interface BadgeProps {
  status: ExpenseStatus;
  children?: React.ReactNode;
}

const statusClasses: Record<ExpenseStatus, string> = {
  draft: 'bg-white/10 text-white/70 border-white/20',
  submitted: 'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  paid: 'badge-paid',
  exported: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const statusLabels: Record<ExpenseStatus, string> = {
  draft: 'Draft',
  submitted: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  paid: 'Paid',
  exported: 'Exported',
};

export function Badge({ status, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full text-xs font-medium border',
        statusClasses[status]
      )}
      style={{ padding: '2px 4px' }}
    >
      {children || statusLabels[status]}
    </span>
  );
}
