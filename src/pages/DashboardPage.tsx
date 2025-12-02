import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Clock,
  CheckCircle,
  CreditCard,
  TrendingUp,
  Bell,
  X,
  Wallet,
} from 'lucide-react';
import { GlassCard, FloatingActionButton, Badge } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatCurrency, formatRelativeTime, getCategoryIcon } from '../utils/formatters';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, expenses, notifications } = useStore();
  const [isRinging, setIsRinging] = useState(false);
  const [showExpenseTypeModal, setShowExpenseTypeModal] = useState(false);
  const bellControls = useAnimationControls();

  const handleExpenseTypeSelect = (type: 'reimbursement' | 'company_card') => {
    setShowExpenseTypeModal(false);
    navigate(`/expense/new?type=${type}`);
  };

  const handleBellHover = async () => {
    if (isRinging) return;
    setIsRinging(true);
    await bellControls.start({
      rotate: [0, 15, -15, 10, -10, 5, -5, 0],
      transition: { duration: 0.6, ease: "easeInOut" }
    });
    setIsRinging(false);
  };

  const draftExpenses = expenses.filter((e) => e.status === 'draft');
  const pendingExpenses = expenses.filter((e) => e.status === 'submitted');
  const recentlyReimbursed = expenses.filter(
    (e) => e.status === 'paid' && e.paidAt && new Date().getTime() - new Date(e.paidAt).getTime() < 7 * 24 * 60 * 60 * 1000
  );

  const totalPending = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalReimbursed = recentlyReimbursed.reduce((sum, e) => sum + e.amount, 0);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Mock unmatched card charges count (matching CardsPage mock data)
  const unmatchedChargesCount = 3;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 md:pb-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Hello, {user?.fullName.split(' ')[0]}! 👋
            </h1>
            <p className="text-white/60 mt-1">Here's your expense overview</p>
          </div>

          {/* Notifications bell */}
          <motion.button
            onHoverStart={handleBellHover}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/notifications')}
            className="relative p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            style={{ transform: 'scale(1.1)' }}
          >
            <motion.div
              animate={bellControls}
              style={{ originY: 0.1 }}
            >
              <Bell className="w-6 h-6 text-white" />
            </motion.div>
            {unreadNotifications > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-accent-primary text-gray-900 text-xs font-bold rounded-full flex items-center justify-center" style={{ padding: '3px' }}>
                {unreadNotifications}
              </span>
            )}
          </motion.button>
        </motion.div>

        {/* Stats cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <GlassCard padding="md" className="text-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400/10 mb-3" style={{ marginTop: '5px' }}>
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">{pendingExpenses.length}</p>
            <p className="text-white/60 text-sm mt-1.5" style={{ marginBottom: '5px' }}>Pending</p>
          </GlassCard>

          <GlassCard padding="md" className="text-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-success-primary/10 mb-3" style={{ marginTop: '5px' }}>
              <CheckCircle className="w-6 h-6 text-success-primary" />
            </div>
            <p className="text-2xl font-bold text-white">{recentlyReimbursed.length}</p>
            <p className="text-white/60 text-sm mt-1.5" style={{ marginBottom: '5px' }}>Paid (7d)</p>
          </GlassCard>

          <GlassCard padding="md" className="text-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-primary/10 mb-3" style={{ marginTop: '5px' }}>
              <TrendingUp className="w-6 h-6 text-accent-primary" />
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalPending)}</p>
            <p className="text-white/60 text-sm mt-1.5" style={{ marginBottom: '5px' }}>Awaiting</p>
          </GlassCard>

          <GlassCard padding="md" className="text-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-warning/10 mb-3" style={{ marginTop: '5px' }}>
              <CreditCard className="w-6 h-6 text-warning" />
            </div>
            <p className="text-2xl font-bold text-white">{unmatchedChargesCount}</p>
            <p className="text-white/60 text-sm mt-1.5" style={{ marginBottom: '5px' }}>Unmatched Charges</p>
          </GlassCard>
        </motion.div>

        {/* Draft expenses */}
        {draftExpenses.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-white mb-3.5 flex items-center gap-2.5" style={{ marginTop: '20px', marginLeft: '20px', marginRight: '20px' }}>
              <Receipt className="w-5 h-5" />
              Draft Expenses
            </h2>
            <GlassCard padding="none" className="divide-y divide-white/10">
              {draftExpenses.map((expense) => (
                <motion.button
                  key={expense.id}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                  onClick={() => navigate(`/expense/${expense.id}`)}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl" style={{ marginLeft: '15px' }}>{getCategoryIcon(expense.category)}</span>
                    <div>
                      <p className="text-white font-medium">{expense.merchantName}</p>
                      <p className="text-white/60 text-sm">
                        {formatRelativeTime(expense.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold" style={{ marginTop: '15px', marginRight: '15px' }}>
                      {formatCurrency(expense.amount)}
                    </p>
                    <span className="inline-block" style={{ marginRight: '15px', marginBottom: '10px' }}>
                      <Badge status={expense.status} />
                    </span>
                  </div>
                </motion.button>
              ))}
            </GlassCard>
          </motion.div>
        )}

        {/* Recent activity */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3.5" style={{ marginTop: '20px', marginLeft: '20px', marginRight: '20px' }}>
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <button
              onClick={() => navigate('/expenses')}
              className="text-sm hover:underline text-accent-primary dark:text-white"
              style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}
            >
              View all
            </button>
          </div>
          <GlassCard padding="none" className="divide-y divide-white/10">
            {expenses.slice(0, 5).map((expense) => (
              <motion.button
                key={expense.id}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                onClick={() => navigate(`/expense/${expense.id}`)}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl" style={{ marginLeft: '15px' }}>{getCategoryIcon(expense.category)}</span>
                  <div>
                    <p className="text-white font-medium">{expense.merchantName}</p>
                    <p className="text-white/60 text-sm">{expense.notes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold" style={{ marginTop: '15px', marginRight: '15px' }}>
                    {formatCurrency(expense.amount)}
                  </p>
                  <span className="inline-block" style={{ marginRight: '15px', marginBottom: '10px' }}>
                    <Badge status={expense.status} />
                  </span>
                </div>
              </motion.button>
            ))}
          </GlassCard>
        </motion.div>

        {/* Recently reimbursed with confetti celebration */}
        {recentlyReimbursed.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-white mb-3.5 flex items-center gap-2.5">
              🎉 Recently Reimbursed
            </h2>
            <GlassCard className="bg-gradient-to-br from-success-primary/20 to-success-secondary/10 border-success-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-success-primary text-2xl font-bold">
                    {formatCurrency(totalReimbursed)}
                  </p>
                  <p className="text-white/70">
                    {recentlyReimbursed.length} expense{recentlyReimbursed.length !== 1 ? 's' : ''} paid this week!
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="text-4xl"
                >
                  💸
                </motion.div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>

      {/* Floating action button */}
      <FloatingActionButton onClick={() => setShowExpenseTypeModal(true)} />

      {/* Expense Type Selection Modal */}
      {createPortal(
        <AnimatePresence>
          {showExpenseTypeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center p-4 bg-black/80"
              style={{ zIndex: 9999 }}
              onClick={() => setShowExpenseTypeModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-sm rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(30, 30, 50, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white" style={{ marginTop: '5px', marginBottom: '5px', marginLeft: '15px' }}>New Expense</h2>
                  <motion.button
                    onClick={() => setShowExpenseTypeModal(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    style={{ marginTop: '5px', marginBottom: '5px', marginRight: '15px' }}
                    whileHover={{ rotate: 180, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* Options */}
                <div className="p-6 space-y-4">
                  <p className="text-white/60 text-sm text-center mb-4" style={{ marginTop: '10px', marginBottom: '10px' }}>
                    What type of expense is this?
                  </p>

                  {/* Company Card Option */}
                  <motion.button
                    onClick={() => handleExpenseTypeSelect('company_card')}
                    className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-primary/50 transition-all flex items-center gap-4"
                    style={{ marginLeft: '15px', marginRight: '15px', marginTop: '5px', marginBottom: '5px', width: 'calc(100% - 30px)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center" style={{ marginTop: '3px', marginLeft: '3px', marginBottom: '3px' }}>
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-white font-semibold">Company Card</h3>
                      <p className="text-white/50 text-sm">Paid with corporate card</p>
                    </div>
                  </motion.button>

                  {/* Reimbursement Option */}
                  <motion.button
                    onClick={() => handleExpenseTypeSelect('reimbursement')}
                    className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-primary/50 transition-all flex items-center gap-4"
                    style={{ marginLeft: '15px', marginRight: '15px', marginTop: '5px', marginBottom: '15px', width: 'calc(100% - 30px)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center" style={{ marginTop: '3px', marginLeft: '3px', marginBottom: '3px' }}>
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-white font-semibold">Reimbursement</h3>
                      <p className="text-white/50 text-sm">Paid out of pocket</p>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
