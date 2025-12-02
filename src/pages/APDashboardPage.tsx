import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  CheckSquare,
  DollarSign,
  Users,
  FileSpreadsheet,
  Search,
  ChevronDown,
  Check,
} from 'lucide-react';
import { GlassCard, Button, Badge, Input } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { triggerConfetti } from '../utils/confetti';
import type { ExpenseStatus } from '../types';

export function APDashboardPage() {
  const navigate = useNavigate();
  const { expenses, updateExpense } = useStore();
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | 'all'>('approved');
  const [searchQuery, setSearchQuery] = useState('');

  // Get approved expenses ready for payment
  const filteredExpenses = expenses.filter((e) => {
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchesSearch =
      e.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const approvedTotal = expenses
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.status === 'submitted').length;
  const readyToPay = expenses.filter((e) => e.status === 'approved').length;

  const toggleExpenseSelection = (id: string) => {
    const newSelection = new Set(selectedExpenses);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedExpenses(newSelection);
  };

  const selectAll = () => {
    if (selectedExpenses.size === filteredExpenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(filteredExpenses.map((e) => e.id)));
    }
  };

  const markAsPaid = () => {
    selectedExpenses.forEach((id) => {
      updateExpense(id, { status: 'paid', paidAt: new Date() });
    });
    setSelectedExpenses(new Set());
    triggerConfetti();
  };

  const exportToCSV = () => {
    // Generate CSV content
    const headers = [
      'Employee',
      'Merchant',
      'Amount',
      'Category',
      'Date',
      'GL Code',
      'Status',
    ];
    const rows = [...selectedExpenses].map((id) => {
      const expense = expenses.find((e) => e.id === id);
      if (!expense) return [];
      return [
        'Sarah Johnson', // In real app, get from user
        expense.merchantName,
        expense.amount.toFixed(2),
        expense.category,
        formatDate(expense.expenseDate),
        expense.glCode || '6000-00',
        expense.status,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
      '\n'
    );

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    triggerConfetti();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 md:pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            AP Dashboard
          </h1>
          <p className="text-white/60">
            Manage approvals, payments, and exports
          </p>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6"
        >
          <GlassCard padding="md" className="text-center cursor-pointer" onClick={() => navigate('/approvals')}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400/10 mb-3">
              <Users className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">{pendingCount}</p>
            <p className="text-white/60 text-sm mt-1.5">Pending Review</p>
          </GlassCard>

          <GlassCard padding="md" className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-success-primary/10 mb-3">
              <CheckSquare className="w-6 h-6 text-success-primary" />
            </div>
            <p className="text-2xl font-bold text-white">{readyToPay}</p>
            <p className="text-white/60 text-sm mt-1.5">Ready to Pay</p>
          </GlassCard>

          <GlassCard padding="md" className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-primary/10 mb-3">
              <DollarSign className="w-6 h-6 text-accent-primary" />
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(approvedTotal)}
            </p>
            <p className="text-white/60 text-sm mt-1.5">Total Approved</p>
          </GlassCard>

          <GlassCard padding="md" className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-400/10 mb-3">
              <FileSpreadsheet className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{expenses.filter(e => e.status === 'exported').length}</p>
            <p className="text-white/60 text-sm mt-1.5">Exported</p>
          </GlassCard>
        </motion.div>

        {/* Filters and actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="flex-1">
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ExpenseStatus | 'all')}
                className="glass-input appearance-none pl-4 pr-10 py-3 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="submitted">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="exported">Exported</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
            </div>

            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={selectedExpenses.size === 0}
              icon={<Download className="w-5 h-5" />}
            >
              Export CSV
            </Button>

            <Button
              variant="success"
              onClick={markAsPaid}
              disabled={selectedExpenses.size === 0}
              icon={<Check className="w-5 h-5" />}
            >
              Mark Paid ({selectedExpenses.size})
            </Button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard padding="none" className="overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5">
              <div className="col-span-1">
                <button
                  onClick={selectAll}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedExpenses.size === filteredExpenses.length && filteredExpenses.length > 0
                      ? 'bg-accent-primary border-accent-primary'
                      : 'border-white/30 hover:border-white/50'
                  }`}
                >
                  {selectedExpenses.size === filteredExpenses.length && filteredExpenses.length > 0 && (
                    <Check className="w-3 h-3 text-gray-900" />
                  )}
                </button>
              </div>
              <div className="col-span-2 text-white/50 text-sm font-medium">Employee</div>
              <div className="col-span-2 text-white/50 text-sm font-medium">Merchant</div>
              <div className="col-span-2 text-white/50 text-sm font-medium">Amount</div>
              <div className="col-span-2 text-white/50 text-sm font-medium">Date</div>
              <div className="col-span-2 text-white/50 text-sm font-medium">Status</div>
              <div className="col-span-1 text-white/50 text-sm font-medium">GL</div>
            </div>

            {/* Table body */}
            <div className="divide-y divide-white/10">
              {filteredExpenses.map((expense) => (
                <motion.div
                  key={expense.id}
                  className={`grid grid-cols-12 gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                    selectedExpenses.has(expense.id) ? 'bg-accent-primary/10' : ''
                  }`}
                  onClick={() => toggleExpenseSelection(expense.id)}
                  whileHover={{ x: 4 }}
                >
                  <div className="col-span-1 flex items-center">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedExpenses.has(expense.id)
                          ? 'bg-accent-primary border-accent-primary'
                          : 'border-white/30'
                      }`}
                    >
                      {selectedExpenses.has(expense.id) && (
                        <Check className="w-3 h-3 text-gray-900" />
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">SJ</span>
                    </div>
                    <span className="text-white text-sm truncate">Sarah Johnson</span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <span className="text-white truncate">{expense.merchantName}</span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <span className="text-white font-semibold">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <span className="text-white/70">{formatDate(expense.expenseDate)}</span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <Badge status={expense.status} />
                  </div>

                  <div className="col-span-1 flex items-center">
                    <span className="text-white/50 text-sm">{expense.glCode || '6000-00'}</span>
                  </div>
                </motion.div>
              ))}

              {filteredExpenses.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-white/50">No expenses found</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Export info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-white/50 text-sm"
        >
          <p>
            CSV exports are formatted for Viewpoint Vista import.
            <br />
            Select expenses and click "Export CSV" to download.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
