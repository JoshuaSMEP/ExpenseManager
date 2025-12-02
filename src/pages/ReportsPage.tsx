import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  FileText,
  Download,
  Calendar,
  Filter,
  PieChart,
  DollarSign,
  Users,
  CheckCircle,
} from 'lucide-react';
import { GlassCard, Button, Badge } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/formatters';

type DateRange = 'thisMonth' | 'lastMonth' | 'q1' | 'q2' | 'q3' | 'q4' | 'custom';
type ExportFormat = 'csv' | 'pdf' | 'viewpoint';

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'q1', label: 'Q1' },
  { value: 'q2', label: 'Q2' },
  { value: 'q3', label: 'Q3' },
  { value: 'q4', label: 'Q4' },
];

const mockReportData = {
  totalExpenses: 45,
  totalAmount: 12450.0,
  byCategory: {
    meals: 3200,
    travel: 5100,
    supplies: 1800,
    lodging: 2350,
  },
  byStatus: {
    approved: 15,
    paid: 25,
    exported: 5,
  },
};

export function ReportsPage() {
  const navigate = useNavigate();
  const { expenses } = useStore();
  const [dateRange, setDateRange] = useState<DateRange>('thisMonth');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsExporting(false);
    alert(`Exported as ${format.toUpperCase()}!`);
  };

  const filteredExpenses = expenses.filter((exp) => {
    if (selectedStatus === 'all') return ['approved', 'paid', 'exported'].includes(exp.status);
    return exp.status === selectedStatus;
  });

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
          <div>
            <h1 className="text-2xl font-bold text-white">Reports & Export</h1>
            <p className="text-white/60 text-sm">Generate reports and export expense data</p>
          </div>
        </motion.div>

        {/* Date Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-accent-primary" />
              <span className="text-white font-medium">Date Range</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    dateRange === option.value
                      ? 'bg-accent-primary text-gray-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <GlassCard padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Total Expenses</p>
                <p className="text-white font-bold text-lg">{mockReportData.totalExpenses}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success-primary/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success-primary" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Total Amount</p>
                <p className="text-white font-bold text-lg">{formatCurrency(mockReportData.totalAmount)}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Approved</p>
                <p className="text-white font-bold text-lg">{mockReportData.byStatus.approved}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Paid</p>
                <p className="text-white font-bold text-lg">{mockReportData.byStatus.paid}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* By Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-accent-primary" />
              <span className="text-white font-medium">By Category</span>
            </div>
            <div className="space-y-3">
              {Object.entries(mockReportData.byCategory).map(([category, amount]) => {
                const percentage = (amount / mockReportData.totalAmount) * 100;
                return (
                  <div key={category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/80 capitalize">{category}</span>
                      <span className="text-white font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Export Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-accent-primary" />
              <span className="text-white font-medium">Export Data</span>
            </div>
            <p className="text-white/60 text-sm mb-4">
              Export expense data to your accounting system
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleExport('csv')}
                loading={isExporting}
                icon={<Download className="w-4 h-4" />}
              >
                CSV Download
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleExport('pdf')}
                loading={isExporting}
                icon={<FileText className="w-4 h-4" />}
              >
                PDF Report
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('viewpoint')}
                loading={isExporting}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}
              >
                Viewpoint Vista
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Status Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-white/60" />
            <span className="text-white/60 text-sm">Filter by Status</span>
          </div>
          <div className="flex gap-2">
            {['all', 'approved', 'paid', 'exported'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedStatus === status
                    ? 'bg-accent-primary text-gray-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Expenses Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 text-sm font-medium">Date</th>
                    <th className="text-left p-4 text-white/60 text-sm font-medium">Merchant</th>
                    <th className="text-left p-4 text-white/60 text-sm font-medium">Category</th>
                    <th className="text-right p-4 text-white/60 text-sm font-medium">Amount</th>
                    <th className="text-center p-4 text-white/60 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/expense/${expense.id}`)}
                    >
                      <td className="p-4 text-white/80 text-sm">{formatDate(expense.expenseDate)}</td>
                      <td className="p-4 text-white font-medium">{expense.merchantName}</td>
                      <td className="p-4 text-white/60 text-sm capitalize">{expense.category}</td>
                      <td className="p-4 text-white font-medium text-right">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="p-4 text-center">
                        <Badge status={expense.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredExpenses.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-white/60">No expenses found for this filter</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
