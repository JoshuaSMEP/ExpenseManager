import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  ChevronDown,
  X,
  Receipt,
  Building2,
  CreditCard,
  FileText,
} from 'lucide-react';
import { GlassCard } from '../components/ui';
import { formatCurrency } from '../utils/formatters';

// ============================================================================
// CATEGORY DATA & HELPERS
// ============================================================================
interface CategoryData {
  id: string;
  label: string;
  icon: string;
  color: string;
  total: number;
  count: number;
  avgTransaction: number;
  percentOfTotal: number;
  trend: number; // percentage change from last period
  transactions: Array<{
    date: Date;
    amount: number;
    merchant: string;
    description?: string;
  }>;
}

const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  tools: { label: 'Tools & Equipment', icon: '🔧', color: '#f97316' },
  materials: { label: 'Materials', icon: '📦', color: '#22d3ee' },
  fuel: { label: 'Vehicle & Fuel', icon: '⛽', color: '#22c55e' },
  meals: { label: 'Job Site Meals', icon: '🍽️', color: '#00f5a0' },
  lodging: { label: 'Travel & Lodging', icon: '🏨', color: '#ff6b9d' },
  safety: { label: 'Safety Equipment', icon: '🦺', color: '#ef4444' },
  transportation: { label: 'Transportation', icon: '🚗', color: '#00f5ff' },
  software: { label: 'Software & Subscriptions', icon: '💻', color: '#a855f7' },
  it: { label: 'IT & Hardware', icon: '🖥️', color: '#ec4899' },
  permits: { label: 'Permits & Licenses', icon: '📋', color: '#8b5cf6' },
  other: { label: 'Other', icon: '📁', color: '#94a3b8' },
};

// Generate MEP expense data (same as AnalyticsPage)
function generateMEPExpenseData() {
  const now = new Date();
  const expenses: Array<{
    date: Date;
    amount: number;
    merchant: string;
    category: string;
    project?: string;
  }> = [];

  const projects = [
    'Downtown Office Tower - Phase 2',
    'Memorial Hospital HVAC Retrofit',
    'Riverside Apartments Complex',
    'Tech Campus Data Center',
    'City Hall Renovation',
  ];

  const expenseTypes = [
    { merchant: 'Grainger', category: 'tools', minAmount: 150, maxAmount: 800 },
    { merchant: 'Home Depot', category: 'tools', minAmount: 50, maxAmount: 400 },
    { merchant: 'Fastenal', category: 'tools', minAmount: 75, maxAmount: 350 },
    { merchant: 'MSC Industrial', category: 'tools', minAmount: 100, maxAmount: 500 },
    { merchant: 'Ferguson', category: 'materials', minAmount: 200, maxAmount: 1200 },
    { merchant: 'Winsupply', category: 'materials', minAmount: 150, maxAmount: 800 },
    { merchant: 'Graybar Electric', category: 'materials', minAmount: 180, maxAmount: 950 },
    { merchant: 'Johnstone Supply', category: 'materials', minAmount: 200, maxAmount: 1100 },
    { merchant: 'United Rentals', category: 'tools', minAmount: 400, maxAmount: 1500 },
    { merchant: 'Sunbelt Rentals', category: 'tools', minAmount: 350, maxAmount: 1200 },
    { merchant: 'Shell', category: 'fuel', minAmount: 60, maxAmount: 150 },
    { merchant: 'Chevron', category: 'fuel', minAmount: 55, maxAmount: 140 },
    { merchant: 'Chipotle', category: 'meals', minAmount: 12, maxAmount: 85 },
    { merchant: 'Panera Bread', category: 'meals', minAmount: 15, maxAmount: 95 },
    { merchant: 'Subway', category: 'meals', minAmount: 10, maxAmount: 65 },
    { merchant: 'Hampton Inn', category: 'lodging', minAmount: 120, maxAmount: 180 },
    { merchant: 'Enterprise', category: 'transportation', minAmount: 80, maxAmount: 200 },
    { merchant: 'Grainger', category: 'safety', minAmount: 50, maxAmount: 300 },
    { merchant: 'Autodesk', category: 'software', minAmount: 250, maxAmount: 2500 },
    { merchant: 'Bluebeam', category: 'software', minAmount: 150, maxAmount: 400 },
    { merchant: 'Procore', category: 'software', minAmount: 500, maxAmount: 1500 },
    { merchant: 'PlanGrid', category: 'software', minAmount: 100, maxAmount: 300 },
    { merchant: 'Trimble', category: 'software', minAmount: 200, maxAmount: 800 },
    { merchant: 'Microsoft 365', category: 'software', minAmount: 12, maxAmount: 300 },
    { merchant: 'Adobe Creative Cloud', category: 'software', minAmount: 55, maxAmount: 600 },
    { merchant: 'Dell Technologies', category: 'it', minAmount: 800, maxAmount: 3500 },
    { merchant: 'CDW', category: 'it', minAmount: 150, maxAmount: 2000 },
    { merchant: 'Best Buy Business', category: 'it', minAmount: 100, maxAmount: 1500 },
    { merchant: 'Apple', category: 'it', minAmount: 300, maxAmount: 2000 },
  ];

  // Use a seeded random for consistency
  let seed = 12345;
  const seededRandom = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (let i = 0; i < 180; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || (dayOfWeek === 6 && seededRandom() > 0.3)) continue;

    const numExpenses = Math.floor(seededRandom() * 4) + 2;

    for (let j = 0; j < numExpenses; j++) {
      const expenseType = expenseTypes[Math.floor(seededRandom() * expenseTypes.length)];
      const amount = Math.round(
        (expenseType.minAmount + seededRandom() * (expenseType.maxAmount - expenseType.minAmount)) * 100
      ) / 100;

      expenses.push({
        date,
        amount,
        merchant: expenseType.merchant,
        category: expenseType.category,
        project: projects[Math.floor(seededRandom() * projects.length)],
      });
    }
  }

  return expenses;
}

// ============================================================================
// ANIMATED BAR COMPONENT
// ============================================================================
function AnimatedBar({
  value,
  maxValue,
  color,
  delay = 0
}: {
  value: number;
  maxValue: number;
  color: string;
  delay?: number;
}) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          boxShadow: `0 0 20px ${color}40`,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, delay, ease: 'easeOut' }}
      />
    </div>
  );
}

// ============================================================================
// TRANSACTION DETAIL MODAL
// ============================================================================
interface TransactionDetail {
  date: Date;
  amount: number;
  merchant: string;
  description?: string;
  category: string;
  categoryColor: string;
  categoryIcon: string;
}

function TransactionDetailModal({
  transaction,
  onClose,
}: {
  transaction: TransactionDetail;
  onClose: () => void;
}) {
  // Generate a fake transaction ID based on date and amount
  const transactionId = `TXN-${transaction.date.getTime().toString(36).toUpperCase()}-${Math.abs(Math.round(transaction.amount * 100)).toString(36).toUpperCase()}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '900px',
          zIndex: 10000,
          margin: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard
          className="overflow-hidden"
          style={{ background: 'rgba(20, 20, 40, 0.98)' }}
        >
          {/* Header */}
          <div style={{ padding: '24px 30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: '20px' }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    fontSize: '28px',
                    background: `linear-gradient(135deg, ${transaction.categoryColor}, ${transaction.categoryColor}88)`,
                    boxShadow: `0 4px 20px ${transaction.categoryColor}40`,
                  }}
                >
                  {transaction.categoryIcon}
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    {transaction.merchant}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{transaction.category}</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                style={{ padding: '12px', borderRadius: '12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                className="hover:bg-white/10 transition-colors"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <X style={{ width: '24px', height: '24px', color: 'rgba(255,255,255,0.6)' }} />
              </motion.button>
            </div>
          </div>

          {/* Content - Two Column Layout */}
          <div style={{ padding: '30px' }}>
            <div className="flex" style={{ gap: '40px' }}>
              {/* Left Column - Details */}
              <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Amount */}
                <div style={{
                  textAlign: 'center',
                  padding: '32px 24px',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.05)',
                  margin: '0 0 8px 0'
                }}>
                  <p style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>
                    {transaction.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '20px 24px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.05)'
                  }}>
                    <Receipt style={{ width: '24px', height: '24px', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '6px' }}>Transaction ID</p>
                      <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '15px' }}>{transactionId}</p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '20px 24px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.05)'
                  }}>
                    <Building2 style={{ width: '24px', height: '24px', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '6px' }}>Merchant</p>
                      <p style={{ color: 'white', fontSize: '16px' }}>{transaction.merchant}</p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '20px 24px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.05)'
                  }}>
                    <CreditCard style={{ width: '24px', height: '24px', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '6px' }}>Payment Method</p>
                      <p style={{ color: 'white', fontSize: '16px' }}>Company Card ••••4582</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  marginTop: '16px',
                  justifyContent: 'center',
                  maxWidth: '400px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    style={{
                      flex: 1,
                      padding: '18px 32px',
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    Close
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: `0 8px 32px ${transaction.categoryColor}60`,
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    style={{
                      flex: 1,
                      padding: '18px 32px',
                      borderRadius: '16px',
                      border: 'none',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: `linear-gradient(135deg, ${transaction.categoryColor}, ${transaction.categoryColor}aa)`,
                      boxShadow: `0 4px 20px ${transaction.categoryColor}40`,
                    }}
                  >
                    View Full Details
                  </motion.button>
                </div>
              </div>

              {/* Right Column - Invoice Preview */}
              <div style={{ width: '320px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <FileText style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.5)' }} />
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', fontWeight: '500' }}>Invoice / Receipt</p>
                </div>
                <div
                  style={{
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    height: '420px',
                  }}
                >
                  {/* Placeholder invoice image */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '20px',
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                    }}>
                      <Receipt style={{ width: '36px', height: '36px', color: 'rgba(255,255,255,0.3)' }} />
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginBottom: '8px' }}>Invoice Preview</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Receipt image will be displayed here</p>

                    {/* Fake invoice placeholder content */}
                    <div style={{ marginTop: '32px', width: '100%', textAlign: 'left' }}>
                      <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', width: '75%', marginBottom: '12px' }} />
                      <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', width: '50%', marginBottom: '20px' }} />
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '100%', marginBottom: '8px' }} />
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '100%', marginBottom: '8px' }} />
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '75%', marginBottom: '8px' }} />
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '100%', marginBottom: '20px' }} />
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', width: '60px' }} />
                        <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', width: '80px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// CATEGORY CARD COMPONENT
// ============================================================================
function CategoryCard({
  category,
  index,
  maxTotal,
  isExpanded,
  onToggle,
  onTransactionClick,
}: {
  category: CategoryData;
  index: number;
  maxTotal: number;
  isExpanded: boolean;
  onToggle: () => void;
  onTransactionClick: (tx: { date: Date; amount: number; merchant: string; description?: string }) => void;
}) {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const displayedTransactions = showAllTransactions
    ? category.transactions
    : category.transactions.slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard
        className="overflow-hidden cursor-pointer hover:border-white/20 transition-all"
        style={{ background: 'rgba(30, 30, 50, 0.6)', marginTop: '15px', marginBottom: '15px' }}
        onClick={onToggle}
      >
        <div style={{ padding: '25px' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6" style={{ marginLeft: '15px', marginRight: '15px' }}>
            <div className="flex items-center gap-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${category.color}, ${category.color}88)`,
                  boxShadow: `0 4px 20px ${category.color}40`,
                }}
              >
                {category.icon}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">{category.label}</h3>
                <p className="text-white/50 text-sm">{category.count} transactions</p>
              </div>
            </div>
            <div className="text-right" style={{ marginRight: '15px' }}>
              <p className="text-2xl font-bold text-white">{formatCurrency(category.total)}</p>
              <div className="flex items-center justify-end gap-1 mt-2">
                {category.trend >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-400" />
                )}
                <span className={`text-sm font-medium ${category.trend >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {Math.abs(category.trend).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-5" style={{ marginLeft: '15px', marginRight: '15px' }}>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-white/50">{category.percentOfTotal.toFixed(1)}% of total spending</span>
              <span className="text-white/50">Avg: {formatCurrency(category.avgTransaction)}</span>
            </div>
            <AnimatedBar
              value={category.total}
              maxValue={maxTotal}
              color={category.color}
              delay={index * 0.05}
            />
          </div>

          {/* Expand indicator */}
          <div className="flex items-center justify-center mt-4">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-white/40" />
            </motion.div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/10"
            >
              <div style={{ padding: '20px' }}>
                <h4 className="text-white/70 text-sm font-medium mb-3">Recent Transactions</h4>
                <div className={`space-y-2 overflow-y-auto ${showAllTransactions ? 'max-h-96' : 'max-h-64'}`}>
                  {displayedTransactions.map((tx, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i < 10 ? i * 0.03 : 0 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/20 transition-colors cursor-pointer"
                      style={{ marginTop: '1px', marginBottom: '1px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTransactionClick(tx);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: category.color }}
                        />
                        <div>
                          <p className="text-white text-sm font-medium">{tx.merchant}</p>
                          <p className="text-white/40 text-xs">
                            {tx.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <p className="text-white font-medium">{formatCurrency(tx.amount)}</p>
                    </motion.div>
                  ))}
                </div>
                {category.transactions.length > 10 && (
                  <button
                    className="w-full text-center mt-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllTransactions(!showAllTransactions);
                    }}
                  >
                    <span className="text-white/60 text-sm hover:text-white transition-colors">
                      {showAllTransactions
                        ? 'Show less'
                        : `+${category.transactions.length - 10} more transactions`}
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

// ============================================================================
// SUMMARY STATS COMPONENT
// ============================================================================
function SummaryStats({ categories, totalSpending }: { categories: CategoryData[]; totalSpending: number }) {
  const topCategory = categories[0];
  const avgPerCategory = totalSpending / categories.length;
  const totalTransactions = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12" style={{ marginTop: '20px', padding: '10px' }}>
      {[
        { label: 'Total Spending', value: formatCurrency(totalSpending), color: '#00f5ff' },
        { label: 'Categories', value: categories.length.toString(), color: '#a855f7' },
        { label: 'Transactions', value: totalTransactions.toString(), color: '#22c55e' },
        { label: 'Top Category', value: topCategory?.label || '-', color: topCategory?.color || '#fff' },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          style={{ marginTop: '15px', marginBottom: '15px' }}
        >
          <GlassCard className="p-8" style={{ background: 'rgba(30, 30, 50, 0.6)' }}>
            <div style={{ padding: '10px' }}>
              <p className="text-white/50 text-sm mb-3">{stat.label}</p>
              <p
                className="text-2xl font-bold truncate"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export function CategoryBreakdownPage() {
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'total' | 'count' | 'trend'>('total');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);

  // Generate and process expense data
  const { categories, totalSpending } = useMemo(() => {
    const expenses = generateMEPExpenseData();
    const now = new Date();

    // Filter by time period
    const filteredExpenses = expenses.filter(e => {
      const daysDiff = Math.floor((now.getTime() - e.date.getTime()) / (1000 * 60 * 60 * 24));
      if (timePeriod === 'month') return daysDiff <= 30;
      if (timePeriod === 'quarter') return daysDiff <= 90;
      return daysDiff <= 365;
    });

    // Previous period for trend calculation
    const prevPeriodExpenses = expenses.filter(e => {
      const daysDiff = Math.floor((now.getTime() - e.date.getTime()) / (1000 * 60 * 60 * 24));
      if (timePeriod === 'month') return daysDiff > 30 && daysDiff <= 60;
      if (timePeriod === 'quarter') return daysDiff > 90 && daysDiff <= 180;
      return daysDiff > 365 && daysDiff <= 730;
    });

    // Group by category
    const categoryMap: Record<string, CategoryData> = {};
    const prevTotals: Record<string, number> = {};

    // Calculate previous period totals
    prevPeriodExpenses.forEach(e => {
      prevTotals[e.category] = (prevTotals[e.category] || 0) + e.amount;
    });

    // Calculate current period data
    filteredExpenses.forEach(e => {
      if (!categoryMap[e.category]) {
        const config = categoryConfig[e.category] || categoryConfig.other;
        categoryMap[e.category] = {
          id: e.category,
          label: config.label,
          icon: config.icon,
          color: config.color,
          total: 0,
          count: 0,
          avgTransaction: 0,
          percentOfTotal: 0,
          trend: 0,
          transactions: [],
        };
      }
      categoryMap[e.category].total += e.amount;
      categoryMap[e.category].count += 1;
      categoryMap[e.category].transactions.push({
        date: e.date,
        amount: e.amount,
        merchant: e.merchant,
      });
    });

    // Calculate totals and derived values
    const totalSpending = Object.values(categoryMap).reduce((sum, c) => sum + c.total, 0);

    Object.values(categoryMap).forEach(category => {
      category.avgTransaction = category.total / category.count;
      category.percentOfTotal = (category.total / totalSpending) * 100;

      const prevTotal = prevTotals[category.id] || 0;
      if (prevTotal > 0) {
        category.trend = ((category.total - prevTotal) / prevTotal) * 100;
      } else {
        category.trend = 100; // New category
      }

      // Sort transactions by date
      category.transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    });

    // Sort categories
    let sortedCategories = Object.values(categoryMap);
    if (sortBy === 'total') {
      sortedCategories.sort((a, b) => b.total - a.total);
    } else if (sortBy === 'count') {
      sortedCategories.sort((a, b) => b.count - a.count);
    } else {
      sortedCategories.sort((a, b) => Math.abs(b.trend) - Math.abs(a.trend));
    }

    return { categories: sortedCategories, totalSpending };
  }, [timePeriod, sortBy]);

  const maxTotal = Math.max(...categories.map(c => c.total));

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 md:pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
          style={{ paddingLeft: '15px', marginTop: '15px' }}
        >
          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Analytics</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Category Breakdown
          </h1>
          <p className="text-white/60 text-lg">
            Detailed view of your spending across all categories
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-8 mb-12"
          style={{ paddingLeft: '15px', paddingRight: '15px', marginTop: '10px' }}
        >
          {/* Time Period Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/50" />
            <div className="flex bg-white/10 rounded-xl p-1">
              {(['month', 'quarter', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timePeriod === period
                      ? 'bg-accent-primary text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {period === 'month' ? 'Month' : period === 'quarter' ? 'Quarter' : 'Year'}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/50" />
            <div className="flex bg-white/10 rounded-xl p-1">
              {([
                { key: 'total', label: 'Amount' },
                { key: 'count', label: 'Count' },
                { key: 'trend', label: 'Trend' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === key
                      ? 'bg-accent-primary text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <div style={{ paddingLeft: '15px', paddingRight: '15px', marginTop: '15px' }}>
          <SummaryStats categories={categories} totalSpending={totalSpending} />
        </div>

        {/* Category List */}
        <div className="space-y-8" style={{ paddingLeft: '15px', paddingRight: '15px', marginTop: '30px' }}>
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              maxTotal={maxTotal}
              isExpanded={expandedCategory === category.id}
              onToggle={() => setExpandedCategory(
                expandedCategory === category.id ? null : category.id
              )}
              onTransactionClick={(tx) => setSelectedTransaction({
                ...tx,
                category: category.label,
                categoryColor: category.color,
                categoryIcon: category.icon,
              })}
            />
          ))}
        </div>

        {categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-white/50 text-lg">No spending data for this period</p>
          </motion.div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <TransactionDetailModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
