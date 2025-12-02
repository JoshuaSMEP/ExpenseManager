import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Check,
  Receipt,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { GlassCard, Button, Input, ReceiptUploader } from '../components/ui';
import { useStore } from '../store/useStore';
import { triggerConfetti } from '../utils/confetti';
import type { ExpenseCategory, ReceiptFile } from '../types';

const categories: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'meals', label: 'Meals & Dining', icon: '🍽️' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'transportation', label: 'Transportation', icon: '🚗' },
  { value: 'lodging', label: 'Lodging', icon: '🏨' },
  { value: 'supplies', label: 'Office Supplies', icon: '📦' },
  { value: 'tools', label: 'Tools', icon: '🔧' },
  { value: 'software', label: 'Software', icon: '💻' },
  { value: 'other', label: 'Other', icon: '📋' },
];

export function EditExpensePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { expenses, updateExpense } = useStore();

  const expense = expenses.find((e) => e.id === id);

  const [isProcessing, setIsProcessing] = useState(false);
  const [policyWarning, setPolicyWarning] = useState<string | null>(null);

  // Form data
  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('meals');
  const [notes, setNotes] = useState('');
  const [receiptFiles, setReceiptFiles] = useState<ReceiptFile[]>([]);

  // Load expense data
  useEffect(() => {
    if (expense) {
      setMerchantName(expense.merchantName);
      setAmount(expense.amount.toString());
      setExpenseDate(
        expense.expenseDate instanceof Date
          ? expense.expenseDate.toISOString().split('T')[0]
          : new Date(expense.expenseDate).toISOString().split('T')[0]
      );
      setCategory(expense.category);
      setNotes(expense.notes || '');

      // Load receipt files - support both old and new formats
      if (expense.receiptFiles && expense.receiptFiles.length > 0) {
        setReceiptFiles(expense.receiptFiles);
      } else if (expense.receiptImageUrl) {
        // Convert old single image format to new array format
        setReceiptFiles([{
          id: 'legacy-1',
          url: expense.receiptImageUrl,
          type: 'image',
          name: 'Receipt',
        }]);
      }
    }
  }, [expense]);

  // Check if expense can be edited
  const canEdit = expense && (expense.status === 'draft' || expense.status === 'rejected');

  if (!expense) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-lg mx-auto">
          <GlassCard className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Expense Not Found</h2>
            <p className="text-white/60 mb-6">This expense doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/expenses')}>Go to Expenses</Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-lg mx-auto">
          <GlassCard className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Cannot Edit</h2>
            <p className="text-white/60 mb-6">
              Only draft or rejected expenses can be edited. This expense is currently{' '}
              <span className="text-accent-primary">{expense.status}</span>.
            </p>
            <Button onClick={() => navigate(`/expense/${id}`)}>View Expense</Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  const checkPolicyViolation = (checkAmount: number, checkCategory: ExpenseCategory) => {
    if (checkCategory === 'meals' && checkAmount > 75) {
      setPolicyWarning('This exceeds the daily meal limit of $75. Please add justification.');
    } else if (checkCategory === 'lodging' && checkAmount > 200) {
      setPolicyWarning('This exceeds the daily lodging limit of $200. Please add justification.');
    } else {
      setPolicyWarning(null);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numAmount = parseFloat(value);
    checkPolicyViolation(numAmount, category);
  };

  const handleCategoryChange = (newCategory: ExpenseCategory) => {
    setCategory(newCategory);
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      checkPolicyViolation(numAmount, newCategory);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    updateExpense(id!, {
      merchantName,
      amount: parseFloat(amount),
      expenseDate: new Date(expenseDate),
      category,
      notes,
      receiptFiles: receiptFiles.length > 0 ? receiptFiles : undefined,
      receiptImageUrl: receiptFiles.length > 0 && receiptFiles[0].type === 'image' ? receiptFiles[0].url : undefined,
      policyViolations: policyWarning ? [policyWarning] : undefined,
    });

    triggerConfetti();
    setIsProcessing(false);
    navigate(`/expense/${id}`);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    updateExpense(id!, {
      merchantName,
      amount: parseFloat(amount),
      expenseDate: new Date(expenseDate),
      category,
      notes,
      receiptFiles: receiptFiles.length > 0 ? receiptFiles : undefined,
      receiptImageUrl: receiptFiles.length > 0 && receiptFiles[0].type === 'image' ? receiptFiles[0].url : undefined,
      status: 'submitted',
      submittedAt: new Date(),
      policyViolations: policyWarning ? [policyWarning] : undefined,
    });

    triggerConfetti();
    setIsProcessing(false);
    navigate('/expenses');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Edit Expense</h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Receipt upload */}
          <GlassCard padding="md" className="mb-4" style={{ marginBottom: '20px' }}>
            <ReceiptUploader
              files={receiptFiles}
              onFilesChange={setReceiptFiles}
              required={true}
              maxFiles={10}
            />
          </GlassCard>

          <GlassCard>
            <div className="space-y-4">
              <div style={{ marginLeft: '15px', marginRight: '15px', marginTop: '10px' }}>
                <Input
                  label="Merchant Name"
                  placeholder="e.g., Starbucks"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  icon={<Receipt className="w-5 h-5" />}
                />
              </div>

              <div style={{ marginLeft: '15px', marginRight: '15px', marginTop: '10px' }}>
                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  icon={<DollarSign className="w-5 h-5" />}
                />
              </div>

              <div style={{ marginLeft: '15px', marginRight: '15px', marginTop: '15px' }}>
                <Input
                  label="Date"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  icon={<Calendar className="w-5 h-5" />}
                />
              </div>

              {/* Category selector */}
              <div style={{ marginLeft: '15px', marginRight: '15px', marginTop: '15px' }}>
                <label className="block text-white/80 text-sm font-medium mb-2.5">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`p-3.5 rounded-xl text-left transition-all ${
                        category === cat.value
                          ? 'bg-accent-primary/20 border-2 border-accent-primary'
                          : 'border-2 border-transparent hover:bg-black/15'
                      }`}
                      style={{
                        backgroundColor: category === cat.value ? undefined : 'rgba(0, 0, 0, 0.10)',
                      }}
                    >
                      <span className="text-xl mr-2.5">{cat.icon}</span>
                      <span className="text-white text-sm">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginLeft: '15px', marginRight: '15px', marginTop: '15px' }}>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Notes (optional)
                </label>
                <textarea
                  placeholder="What was this expense for?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-white placeholder:text-white/40"
                  style={{ paddingLeft: '15px', paddingRight: '15px', height: '120px', resize: 'vertical' }}
                  rows={4}
                />
              </div>

              {/* Policy warning */}
              {policyWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-warning/20 border border-warning/30"
                  style={{ marginLeft: '15px', marginRight: '15px' }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-warning font-medium text-sm">Policy Flag</p>
                      <p className="text-white/70 text-sm" style={{ marginTop: '5px' }}>
                        {policyWarning}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div
                className="flex gap-3 pt-4"
                style={{ marginLeft: '15px', marginRight: '15px', marginTop: '15px', marginBottom: '20px' }}
              >
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={!merchantName || !amount || receiptFiles.length === 0 || isProcessing}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!merchantName || !amount || receiptFiles.length === 0 || isProcessing}
                  loading={isProcessing}
                  className="flex-1"
                  icon={<Check className="w-5 h-5" />}
                >
                  Submit
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
