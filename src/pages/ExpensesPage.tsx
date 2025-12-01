import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight } from 'lucide-react';
import { GlassCard, FloatingActionButton, Badge, Input } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, getCategoryIcon } from '../utils/formatters';
import type { ExpenseStatus } from '../types';

const tabs: { value: ExpenseStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'submitted', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Reimbursed' },
];

export function ExpensesPage() {
  const navigate = useNavigate();
  const { expenses } = useStore();
  const [activeTab, setActiveTab] = useState<ExpenseStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = expenses.filter((expense) => {
    const matchesTab = activeTab === 'all' || expense.status === activeTab;
    const matchesSearch =
      expense.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            My Expenses
          </h1>
          <p className="text-white/60">
            {filteredExpenses.length} expenses · {formatCurrency(totalAmount)} total
          </p>
        </motion.div>

        {/* Search and filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-6"
          style={{ marginBottom: '15px' }}
        >
          <div className="flex-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)', borderRadius: '12px' }}>
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <button className="p-3.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors" style={{ padding: '2px', backgroundColor: 'rgba(0, 0, 0, 0.10)' }}>
            <Filter className="w-5 h-5 text-white" />
          </button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2.5 mb-6 overflow-x-auto pb-2 scrollbar-hide"
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.value
                  ? 'bg-accent-primary text-gray-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '8px', paddingBottom: '8px' }}
            >
              {tab.label}
              {tab.value !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({expenses.filter((e) => e.status === tab.value).length})
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Expenses list */}
        <AnimatePresence mode="popLayout">
          {filteredExpenses.length > 0 ? (
            <motion.div layout className="space-y-3">
              {filteredExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ marginTop: '10px', marginBottom: '10px' }}
                >
                  <GlassCard
                    padding="none"
                    className="cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/expense/${expense.id}`)}
                  >
                    <div className="p-4 flex items-center gap-4">
                      {/* Receipt thumbnail or category icon */}
                      <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {expense.receiptImageUrl ? (
                          <img
                            src={expense.receiptImageUrl}
                            alt="Receipt"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">
                            {getCategoryIcon(expense.category)}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-white font-semibold truncate">
                              {expense.merchantName}
                            </h3>
                            <p className="text-white/60 text-sm truncate">
                              {expense.notes || formatDate(expense.expenseDate)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-white font-bold" style={{ marginTop: '5px' }}>
                              {formatCurrency(expense.amount)}
                            </p>
                            <Badge status={expense.status} />
                          </div>
                        </div>

                        {/* Policy violations */}
                        {expense.policyViolations && expense.policyViolations.length > 0 && (
                          <div className="mt-2.5 p-2.5 rounded-lg bg-warning/10 border border-warning/20" style={{ maxWidth: '60%', marginBottom: '10px' }}>
                            <p className="text-warning text-xs">
                              ⚠️ {expense.policyViolations[0]}
                            </p>
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0" />
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
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No expenses found
                </h3>
                <p className="text-white/60">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Tap the + button to add your first expense'}
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FloatingActionButton onClick={() => navigate('/expense/new')} />
    </div>
  );
}
