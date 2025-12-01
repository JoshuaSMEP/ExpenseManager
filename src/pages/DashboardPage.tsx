import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Clock,
  CheckCircle,
  Banknote,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { GlassCard, FloatingActionButton, Badge } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatCurrency, formatRelativeTime, getCategoryIcon } from '../utils/formatters';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, expenses, notifications } = useStore();

  const draftExpenses = expenses.filter((e) => e.status === 'draft');
  const pendingExpenses = expenses.filter((e) => e.status === 'submitted');
  const recentlyReimbursed = expenses.filter(
    (e) => e.status === 'paid' && e.paidAt && new Date().getTime() - new Date(e.paidAt).getTime() < 7 * 24 * 60 * 60 * 1000
  );

  const totalPending = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalReimbursed = recentlyReimbursed.reduce((sum, e) => sum + e.amount, 0);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

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
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/notifications')}
            className="relative p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            style={{ transform: 'scale(1.1)' }}
          >
            <Bell className="w-6 h-6 text-white" />
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
            <p className="text-white/60 text-sm mt-1.5">Pending</p>
          </GlassCard>

          <GlassCard padding="md" className="text-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-success-primary/10 mb-3" style={{ marginTop: '5px' }}>
              <CheckCircle className="w-6 h-6 text-success-primary" />
            </div>
            <p className="text-2xl font-bold text-white">{recentlyReimbursed.length}</p>
            <p className="text-white/60 text-sm mt-1.5">Paid (7d)</p>
          </GlassCard>

          <GlassCard padding="md" className="text-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-primary/10 mb-3" style={{ marginTop: '5px' }}>
              <TrendingUp className="w-6 h-6 text-accent-primary" />
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalPending)}</p>
            <p className="text-white/60 text-sm mt-1.5">Awaiting</p>
          </GlassCard>

          <GlassCard padding="md" className="text-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-400/10 mb-3" style={{ marginTop: '5px' }}>
              <Banknote className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalReimbursed)}</p>
            <p className="text-white/60 text-sm mt-1.5">Reimbursed</p>
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
              className="text-accent-primary text-sm hover:underline"
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
      <FloatingActionButton onClick={() => navigate('/expense/new')} />
    </div>
  );
}
