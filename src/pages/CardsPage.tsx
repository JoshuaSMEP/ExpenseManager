import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  CreditCard,
  Link,
  Plus,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { GlassCard, Button } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { CardTransaction } from '../types';

const mockCardTransactions: CardTransaction[] = [
  {
    id: 'ct1',
    userId: '1',
    cardLast4: '4242',
    merchant: 'UBER *TRIP',
    amount: 34.5,
    currency: 'USD',
    postedDate: new Date('2024-11-29'),
    status: 'unmatched',
  },
  {
    id: 'ct2',
    userId: '1',
    cardLast4: '4242',
    merchant: 'DELTA AIR LINES',
    amount: 425.0,
    currency: 'USD',
    postedDate: new Date('2024-11-28'),
    status: 'unmatched',
  },
  {
    id: 'ct3',
    userId: '1',
    cardLast4: '4242',
    merchant: 'MARRIOTT HOTELS',
    amount: 189.0,
    currency: 'USD',
    postedDate: new Date('2024-11-27'),
    status: 'unmatched',
  },
  {
    id: 'ct4',
    userId: '1',
    cardLast4: '8832',
    merchant: 'STARBUCKS',
    amount: 12.75,
    currency: 'USD',
    postedDate: new Date('2024-11-26'),
    status: 'matched',
    matchedExpenseId: '5',
  },
  {
    id: 'ct5',
    userId: '1',
    cardLast4: '4242',
    merchant: 'OFFICE DEPOT',
    amount: 45.99,
    currency: 'USD',
    postedDate: new Date('2024-11-25'),
    status: 'ignored',
  },
];

type StatusFilter = 'all' | 'unmatched' | 'matched' | 'ignored';

export function CardsPage() {
  const navigate = useNavigate();
  const { expenses } = useStore();
  const [transactions, setTransactions] = useState<CardTransaction[]>(mockCardTransactions);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<CardTransaction | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const unmatchedCount = transactions.filter((t) => t.status === 'unmatched').length;

  const handleMatch = (transactionId: string, expenseId: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId ? { ...t, status: 'matched' as const, matchedExpenseId: expenseId } : t
      )
    );
    setShowMatchModal(false);
    setSelectedTransaction(null);
  };

  const handleIgnore = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, status: 'ignored' as const } : t))
    );
  };

  const handleCreateExpense = (transaction: CardTransaction) => {
    navigate('/expense/manual', {
      state: {
        prefill: {
          merchantName: transaction.merchant,
          amount: transaction.amount.toString(),
        },
      },
    });
  };

  const getStatusColor = (status: CardTransaction['status']) => {
    switch (status) {
      case 'unmatched':
        return 'bg-warning/20 text-warning';
      case 'matched':
        return 'bg-success-primary/20 text-success-primary';
      case 'ignored':
        return 'bg-white/10 text-white/50';
    }
  };

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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Corporate Card Feed</h1>
            <p className="text-white/60 text-sm">
              {unmatchedCount} unmatched transactions
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-accent-primary" />
          </div>
        </motion.div>

        {/* Status Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {(['all', 'unmatched', 'matched', 'ignored'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-accent-primary text-gray-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'unmatched' && unmatchedCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-warning/30 rounded-full text-xs">
                  {unmatchedCount}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Transactions List */}
        <AnimatePresence mode="popLayout">
          {filteredTransactions.length > 0 ? (
            <motion.div layout className="space-y-3">
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard padding="none">
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Card Icon */}
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-6 h-6 text-white/60" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-white font-semibold">{transaction.merchant}</h3>
                              <p className="text-white/60 text-sm">
                                •••• {transaction.cardLast4} · {formatDate(transaction.postedDate)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold">
                                {formatCurrency(transaction.amount)}
                              </p>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  transaction.status
                                )}`}
                              >
                                {transaction.status}
                              </span>
                            </div>
                          </div>

                          {/* Actions for unmatched */}
                          {transaction.status === 'unmatched' && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setShowMatchModal(true);
                                }}
                                icon={<Link className="w-4 h-4" />}
                              >
                                Match to Expense
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleCreateExpense(transaction)}
                                icon={<Plus className="w-4 h-4" />}
                              >
                                Create Expense
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleIgnore(transaction.id)}
                              >
                                Ignore
                              </Button>
                            </div>
                          )}

                          {/* Matched info */}
                          {transaction.status === 'matched' && (
                            <div className="mt-3 p-2 rounded-lg bg-success-primary/10 flex items-center gap-2">
                              <Check className="w-4 h-4 text-success-primary" />
                              <span className="text-success-primary text-sm">
                                Matched to expense #{transaction.matchedExpenseId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <GlassCard>
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-xl font-semibold text-white mb-2">No transactions found</h3>
                <p className="text-white/60">
                  {statusFilter === 'unmatched'
                    ? 'All card transactions have been matched!'
                    : 'No transactions match this filter'}
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Match Modal */}
        <AnimatePresence>
          {showMatchModal && selectedTransaction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowMatchModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Match to Expense</h2>
                    <button
                      onClick={() => setShowMatchModal(false)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 mb-4">
                    <p className="text-white font-medium">{selectedTransaction.merchant}</p>
                    <p className="text-white/60 text-sm">
                      {formatCurrency(selectedTransaction.amount)} ·{' '}
                      {formatDate(selectedTransaction.postedDate)}
                    </p>
                  </div>

                  <p className="text-white/60 text-sm mb-3">Select an expense to match:</p>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {expenses
                      .filter((e) => e.status === 'draft' || e.status === 'submitted')
                      .map((expense) => (
                        <button
                          key={expense.id}
                          onClick={() => handleMatch(selectedTransaction.id, expense.id)}
                          className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{expense.merchantName}</p>
                              <p className="text-white/60 text-sm">{formatDate(expense.expenseDate)}</p>
                            </div>
                            <p className="text-white font-bold">{formatCurrency(expense.amount)}</p>
                          </div>
                        </button>
                      ))}
                  </div>

                  {expenses.filter((e) => e.status === 'draft' || e.status === 'submitted').length ===
                    0 && (
                    <div className="text-center py-4">
                      <AlertCircle className="w-8 h-8 text-white/40 mx-auto mb-2" />
                      <p className="text-white/60 text-sm">No unmatched expenses available</p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
