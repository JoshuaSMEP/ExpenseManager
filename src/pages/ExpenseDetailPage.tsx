import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Edit,
  Trash2,
  Send,
  Calendar,
  Tag,
  FileText,
  AlertTriangle,
  Check,
  X,
  DollarSign,
} from 'lucide-react';
import { GlassCard, Button, Badge, ReceiptGallery } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, getCategoryLabel, getCategoryIcon } from '../utils/formatters';

export function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { expenses, deleteExpense, submitExpense } = useStore();

  const expense = expenses.find((e) => e.id === id);

  if (!expense) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <GlassCard className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-2">Expense Not Found</h2>
          <p className="text-white/60 mb-6">
            The expense you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/expenses')}>Back to Expenses</Button>
        </GlassCard>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(expense.id);
      navigate('/expenses');
    }
  };

  const handleSubmit = () => {
    submitExpense(expense.id);
    navigate('/expenses');
  };

  const canEdit = expense.status === 'draft' || expense.status === 'rejected';
  const canSubmit = expense.status === 'draft';
  const canDelete = expense.status === 'draft';

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 md:pb-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}
              whileHover="hover"
            >
              <motion.div
                variants={{
                  hover: {
                    x: [0, -4, 0, -4, 0],
                    transition: {
                      duration: 0.5,
                      ease: 'easeInOut',
                    },
                  },
                }}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </motion.div>
            </motion.button>
            <h1 className="text-2xl font-bold text-white">Expense Details</h1>
          </div>
          <div style={{ marginTop: '8px' }}>
            <Badge status={expense.status} />
          </div>
        </motion.div>

        {/* Main Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="mb-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.07)' }}>
            {/* Amount & Merchant */}
            <div className="text-center mb-6" style={{ marginLeft: '15px', marginRight: '15px' }}>
              <p className="text-4xl font-bold text-white mb-1" style={{ marginTop: '5px' }}>
                {formatCurrency(expense.amount)}
              </p>
              <p className="text-white/60" style={{ marginBottom: '5px' }}>{expense.merchantName}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4" style={{ marginLeft: '15px', marginRight: '15px', marginBottom: '10px' }}>
              <div className="rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)', paddingTop: '15px', paddingLeft: '15px', paddingRight: '10px', paddingBottom: '10px' }}>
                <p className="text-white/50 text-xs uppercase mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </p>
                <p className="text-white font-medium" style={{ marginBottom: '20px' }}>
                  {formatDate(expense.expenseDate)}
                </p>
              </div>
              <div className="rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)', paddingTop: '15px', paddingLeft: '15px', paddingRight: '10px', paddingBottom: '10px' }}>
                <p className="text-white/50 text-xs uppercase mb-1.5">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category
                </p>
                <p className="text-white font-medium" style={{ marginBottom: '20px' }}>
                  {getCategoryIcon(expense.category)} {getCategoryLabel(expense.category)}
                </p>
              </div>
            </div>

            {/* Notes */}
            {expense.notes && (
              <div className="rounded-xl" style={{ marginLeft: '15px', marginRight: '15px', marginTop: '10px', marginBottom: '10px', backgroundColor: 'rgba(0, 0, 0, 0.10)', paddingTop: '15px', paddingLeft: '15px', paddingRight: '10px', paddingBottom: '10px' }}>
                <p className="text-white/50 text-xs uppercase mb-1.5">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Notes
                </p>
                <p className="text-white">{expense.notes}</p>
              </div>
            )}

            {/* Policy Violations */}
            {expense.policyViolations && expense.policyViolations.length > 0 && (
              <div className="p-4 rounded-xl bg-warning/20 border border-warning/30" style={{ marginLeft: '15px', marginRight: '15px', marginTop: '10px', marginBottom: '10px' }}>
                <div className="flex items-start gap-3" style={{ marginLeft: '5px', marginTop: '5px' }}>
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                  <div>
                    <p className="text-warning font-medium text-sm mb-1">Policy Flag</p>
                    {expense.policyViolations.map((violation, i) => (
                      <p key={i} className="text-white/70 text-sm" style={{ marginTop: '5px' }}>
                        {violation}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="rounded-xl" style={{ marginLeft: '15px', marginRight: '15px', marginTop: '10px', marginBottom: '15px', backgroundColor: 'rgba(0, 0, 0, 0.10)', paddingTop: '15px', paddingLeft: '15px', paddingRight: '10px', paddingBottom: '15px' }}>
              <p className="text-white/50 text-xs uppercase mb-3">Timeline</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-success-primary" />
                  </div>
                  <div>
                    <p className="text-white text-sm">Created</p>
                    <p className="text-white/50 text-xs">{formatDate(expense.createdAt)}</p>
                  </div>
                </div>

                {expense.submittedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center">
                      <Send className="w-3 h-3 text-accent-primary" />
                    </div>
                    <div>
                      <p className="text-white text-sm">Submitted</p>
                      <p className="text-white/50 text-xs">{formatDate(expense.submittedAt)}</p>
                    </div>
                  </div>
                )}

                {expense.approvedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-success-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-success-primary" />
                    </div>
                    <div>
                      <p className="text-white text-sm">Approved</p>
                      <p className="text-white/50 text-xs">{formatDate(expense.approvedAt)}</p>
                    </div>
                  </div>
                )}

                {expense.status === 'rejected' && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                      <X className="w-3 h-3 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">Rejected</p>
                      <p className="text-white/50 text-xs">{formatDate(expense.updatedAt)}</p>
                    </div>
                  </div>
                )}

                {expense.paidAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <DollarSign className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">Reimbursed</p>
                      <p className="text-white/50 text-xs">{formatDate(expense.paidAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Receipt Gallery */}
        {(expense.receiptFiles?.length || expense.receiptImageUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard padding="md" className="mb-4" style={{ marginTop: '20px', marginBottom: '20px' }}>
              <ReceiptGallery
                files={
                  expense.receiptFiles?.length
                    ? expense.receiptFiles
                    : expense.receiptImageUrl
                      ? [{
                          id: 'legacy-1',
                          url: expense.receiptImageUrl,
                          type: 'image' as const,
                          name: 'Receipt',
                        }]
                      : []
                }
              />
            </GlassCard>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3"
          style={{ marginTop: '25px', marginBottom: '20px' }}
        >
          {canDelete && (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="!border-red-500/50 hover:!bg-red-500/20 !text-red-400"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}
              icon={<Trash2 className="w-5 h-5" />}
            >
              Delete
            </Button>
          )}

          {canEdit && (
            <Button
              variant="outline"
              onClick={() => navigate(`/expense/edit/${expense.id}`)}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}
              icon={<Edit className="w-5 h-5" />}
            >
              Edit
            </Button>
          )}

          {canSubmit && (
            <Button
              onClick={handleSubmit}
              className="flex-1"
              icon={<Send className="w-5 h-5" />}
            >
              Submit for Approval
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
