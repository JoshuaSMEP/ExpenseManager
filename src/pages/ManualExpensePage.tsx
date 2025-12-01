import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Upload,
  X,
  Check,
  Receipt,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { GlassCard, Button, Input } from '../components/ui';
import { useStore } from '../store/useStore';
import { triggerConfetti, triggerSpecialConfetti, isSpecialAmount } from '../utils/confetti';
import type { ExpenseCategory } from '../types';

const categories: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'meals', label: 'Meals & Dining', icon: '🍽️' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'transportation', label: 'Transportation', icon: '🚗' },
  { value: 'lodging', label: 'Lodging', icon: '🏨' },
  { value: 'supplies', label: 'Office Supplies', icon: '📦' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { value: 'other', label: 'Other', icon: '📋' },
];

interface LocationState {
  prefill?: {
    merchantName?: string;
    amount?: string;
  };
}

export function ManualExpensePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addExpense, user } = useStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [policyWarning, setPolicyWarning] = useState<string | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Form data
  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('meals');
  const [notes, setNotes] = useState('');

  // Handle prefill from navigation state (e.g., from card feed)
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.prefill) {
      if (state.prefill.merchantName) setMerchantName(state.prefill.merchantName);
      if (state.prefill.amount) setAmount(state.prefill.amount);
    }
  }, [location.state]);

  const handleFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numAmount = parseFloat(value);

    if (category === 'meals' && numAmount > 75) {
      setPolicyWarning('This exceeds the daily meal limit of $75. Please add justification.');
    } else if (category === 'lodging' && numAmount > 200) {
      setPolicyWarning('This exceeds the daily lodging limit of $200. Please add justification.');
    } else {
      setPolicyWarning(null);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const numAmount = parseFloat(amount);
    const newExpense = {
      userId: user?.id || '1',
      amount: numAmount,
      currency: 'USD',
      merchantName,
      expenseDate: new Date(expenseDate),
      category,
      receiptImageUrl: receiptImage || undefined,
      status: 'draft' as const,
      notes,
      policyViolations: policyWarning ? [policyWarning] : undefined,
    };

    addExpense(newExpense);

    if (isSpecialAmount(numAmount)) {
      triggerSpecialConfetti();
    } else {
      triggerConfetti();
    }

    setIsProcessing(false);
    navigate('/expenses');
  };

  const handleSubmitForApproval = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const numAmount = parseFloat(amount);
    const newExpense = {
      userId: user?.id || '1',
      amount: numAmount,
      currency: 'USD',
      merchantName,
      expenseDate: new Date(expenseDate),
      category,
      receiptImageUrl: receiptImage || undefined,
      status: 'submitted' as const,
      notes,
      policyViolations: policyWarning ? [policyWarning] : undefined,
      submittedAt: new Date(),
    };

    addExpense(newExpense);

    if (isSpecialAmount(numAmount)) {
      triggerSpecialConfetti();
    } else {
      triggerConfetti();
    }

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
            <div>
              <h1 className="text-2xl font-bold text-white">Manual Entry</h1>
              <p className="text-white/60 text-sm">Enter expense details manually</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Receipt upload (optional) */}
          {receiptImage ? (
            <GlassCard padding="sm" className="mb-4">
              <div className="relative">
                <img
                  src={receiptImage}
                  alt="Receipt"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setReceiptImage(null)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 hover:bg-black/70"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard padding="md" className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileCapture}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl hover:border-accent-primary/50 transition-colors"
              >
                <Upload className="w-6 h-6 text-white/40 mx-auto mb-2" />
                <p className="text-white/60 text-sm">Add Receipt (Optional)</p>
              </button>
            </GlassCard>
          )}

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
                      onClick={() => setCategory(cat.value)}
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
                  onClick={handleSubmit}
                  disabled={!merchantName || !amount || isProcessing}
                  className="flex-1"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={handleSubmitForApproval}
                  disabled={!merchantName || !amount || isProcessing}
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
