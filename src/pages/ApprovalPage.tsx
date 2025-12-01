import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  AlertTriangle,
} from 'lucide-react';
import { GlassCard, Button, Badge, Input } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, getCategoryLabel } from '../utils/formatters';
import { triggerConfetti } from '../utils/confetti';

export function ApprovalPage() {
  const navigate = useNavigate();
  const { expenses, approveExpense, rejectExpense, user } = useStore();
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Get pending expenses for approval (in a real app, this would be filtered by manager)
  const pendingExpenses = expenses.filter((e) => e.status === 'submitted');
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentExpense = pendingExpenses[currentIndex];

  const handleApprove = () => {
    if (!currentExpense) return;
    approveExpense(currentExpense.id, user?.id || '1');
    triggerConfetti();

    if (currentIndex >= pendingExpenses.length - 1) {
      navigate('/dashboard');
    }
  };

  const handleReject = () => {
    if (!currentExpense) return;
    rejectExpense(currentExpense.id, user?.id || '1', comment || undefined);
    setComment('');
    setShowComment(false);

    if (currentIndex >= pendingExpenses.length - 1) {
      navigate('/dashboard');
    }
  };

  const nextExpense = () => {
    if (currentIndex < pendingExpenses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setComment('');
      setShowComment(false);
    }
  };

  const prevExpense = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setComment('');
      setShowComment(false);
    }
  };

  if (pendingExpenses.length === 0) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <GlassCard className="text-center max-w-md">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-white mb-2">All caught up!</h2>
          <p className="text-white/60 mb-6">
            No expenses waiting for your approval.
          </p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 md:pb-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Approvals</h1>
            <p className="text-white/60 text-sm">
              {currentIndex + 1} of {pendingExpenses.length}
            </p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="h-1 bg-white/10 rounded-full mb-6 overflow-hidden"
        >
          <motion.div
            className="h-full bg-accent-primary"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + 1) / pendingExpenses.length) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentExpense?.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Receipt image */}
            {currentExpense?.receiptImageUrl && (
              <GlassCard padding="none" className="mb-4 overflow-hidden" style={{ marginTop: '5px', marginBottom: '20px' }}>
                <div
                  className="relative cursor-pointer"
                  onClick={() => setShowReceiptModal(true)}
                >
                  <img
                    src={currentExpense.receiptImageUrl}
                    alt="Receipt"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <button className="absolute bottom-3 right-3 p-2.5 rounded-full bg-white/20 backdrop-blur-sm">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </button>
                </div>
              </GlassCard>
            )}

            {/* Expense details */}
            <GlassCard className="mb-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.07)' }}>
              {/* Amount - prominent */}
              <div className="text-center mb-6" style={{ marginLeft: '15px', marginRight: '15px' }}>
                <p className="text-4xl font-bold text-white mb-1" style={{ marginTop: '5px' }}>
                  {formatCurrency(currentExpense?.amount || 0)}
                </p>
                <p className="text-white/60" style={{ marginBottom: '5px' }}>{currentExpense?.merchantName}</p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4" style={{ marginLeft: '15px', marginRight: '15px', marginBottom: '10px' }}>
                <div className="rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)', paddingTop: '15px', paddingLeft: '15px', paddingRight: '10px', paddingBottom: '10px' }}>
                  <p className="text-white/50 text-xs uppercase mb-1.5">Date</p>
                  <p className="text-white font-medium" style={{ marginBottom: '20px' }}>
                    {currentExpense ? formatDate(currentExpense.expenseDate) : ''}
                  </p>
                </div>
                <div className="rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)', paddingTop: '15px', paddingLeft: '15px', paddingRight: '10px', paddingBottom: '10px' }}>
                  <p className="text-white/50 text-xs uppercase mb-1.5">Category</p>
                  <p className="text-white font-medium" style={{ marginBottom: '20px' }}>
                    {currentExpense ? getCategoryLabel(currentExpense.category) : ''}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {currentExpense?.notes && (
                <div className="rounded-xl" style={{ marginLeft: '15px', marginRight: '15px', marginTop: '10px', marginBottom: '10px', backgroundColor: 'rgba(0, 0, 0, 0.10)', paddingTop: '15px', paddingLeft: '15px', paddingRight: '10px', paddingBottom: '10px' }}>
                  <p className="text-white/50 text-xs uppercase mb-1.5">Note</p>
                  <p className="text-white">{currentExpense.notes}</p>
                </div>
              )}

              {/* Policy violations */}
              {currentExpense?.policyViolations && currentExpense.policyViolations.length > 0 && (
                <div className="p-4 rounded-xl bg-warning/20 border border-warning/30 mb-4" style={{ marginLeft: '15px', marginRight: '15px' }}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                    <div>
                      <p className="text-warning font-medium text-sm mb-1">
                        Policy Flag
                      </p>
                      {currentExpense.policyViolations.map((violation, i) => (
                        <p key={i} className="text-white/70 text-sm">
                          {violation}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submitted by */}
              <div className="flex items-center gap-3.5 rounded-xl" style={{ marginLeft: '15px', marginRight: '15px', marginTop: '10px', marginBottom: '10px', backgroundColor: 'rgba(0, 0, 0, 0.10)', padding: '15px' }}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center" style={{ marginTop: '25px', marginBottom: '25px' }}>
                  <span className="text-white font-semibold">SJ</span>
                </div>
                <div>
                  <p className="text-white font-medium">Sarah Johnson</p>
                  <p className="text-white/50 text-sm">Engineering</p>
                </div>
                <Badge status="submitted" />
              </div>
            </GlassCard>

            {/* Comment section */}
            <AnimatePresence>
              {showComment && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                  style={{ marginTop: '10px' }}
                >
                  <GlassCard>
                    <Input
                      placeholder="Add a comment (optional)..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      icon={<MessageSquare className="w-5 h-5" />}
                    />
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex gap-3" style={{ marginTop: '25px', marginBottom: '20px' }}>
              <Button
                variant="outline"
                onClick={() => setShowComment(!showComment)}
                className="!p-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}
              >
                <MessageSquare className="w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                onClick={handleReject}
                className="flex-1 !border-red-500/50 hover:!bg-red-500/20 !text-red-400"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)', textShadow: '0 0 8px rgba(0, 0, 0, 0.3)' }}
                icon={<X className="w-5 h-5" />}
              >
                Reject
              </Button>

              <Button
                variant="success"
                onClick={handleApprove}
                className="flex-1"
                icon={<Check className="w-5 h-5" />}
              >
                Approve
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={prevExpense}
                disabled={currentIndex === 0}
                className="flex items-center gap-2.5 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              <button
                onClick={nextExpense}
                disabled={currentIndex === pendingExpenses.length - 1}
                className="flex items-center gap-2.5 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Receipt modal */}
      <AnimatePresence>
        {showReceiptModal && currentExpense?.receiptImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowReceiptModal(false)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={currentExpense.receiptImageUrl}
              alt="Receipt"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
            <button
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20"
              onClick={() => setShowReceiptModal(false)}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
