import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Camera,
  X,
  Check,
  Receipt,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  AlertTriangle,
  Loader2,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { GlassCard, Button, Input, ReceiptUploader } from '../components/ui';
import { useStore } from '../store/useStore';
import { triggerConfetti, triggerSpecialConfetti, isSpecialAmount } from '../utils/confetti';
import type { ExpenseCategory, ExpenseType, ReceiptFile } from '../types';
import { extractReceiptData, type ExtractedReceiptData } from '../utils/ocr';

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

export function NewExpensePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addExpense, user } = useStore();

  // Get expense type from URL params (defaults to reimbursement)
  const expenseType: ExpenseType = (searchParams.get('type') as ExpenseType) || 'reimbursement';
  const isCompanyCard = expenseType === 'company_card';

  const [step, setStep] = useState<'capture' | 'form'>('capture');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrMessage, setOcrMessage] = useState('');
  const [receiptFiles, setReceiptFiles] = useState<ReceiptFile[]>([]);
  const [policyWarning, setPolicyWarning] = useState<string | null>(null);

  // Form data
  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState('');
  const [tax, setTax] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculated total
  const calculatedTotal = (() => {
    const subtotal = parseFloat(amount) || 0;
    const taxAmount = parseFloat(tax) || 0;
    return subtotal + taxAmount;
  })();
  const [category, setCategory] = useState<ExpenseCategory>('meals');
  const [notes, setNotes] = useState('');

  const handleReceiptFilesChange = async (files: ReceiptFile[], originalFile?: File) => {
    setReceiptFiles(files);

    // If a new file was added, run OCR
    if (originalFile && files.length > receiptFiles.length) {
      const isPdf = originalFile.type === 'application/pdf';
      setIsOcrProcessing(true);
      setOcrMessage(isPdf ? 'Processing PDF...' : 'Scanning receipt with OCR...');

      // Transition to form step immediately so user sees the progress
      if (step === 'capture') {
        setStep('form');
      }

      try {
        const ocrResult = await extractReceiptData(originalFile);
        if (ocrResult.merchantName || ocrResult.amount || ocrResult.date) {
          setOcrMessage('Receipt data extracted!');
          handleOcrResult(ocrResult);
        } else {
          setOcrMessage('Could not extract data from receipt');
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error('OCR failed:', error);
        setOcrMessage('OCR failed - please enter details manually');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setIsOcrProcessing(false);
      setOcrMessage('');
    } else if (files.length > 0 && step === 'capture') {
      setStep('form');
    }
  };

  const handleOcrResult = (data: ExtractedReceiptData) => {
    // Auto-fill form fields from OCR results
    let newCategory: ExpenseCategory = category;

    if (data.merchantName) {
      let merchantNameToSet = data.merchantName;

      // If merchant name contains "anthropic", replace entire string with just "Anthropic"
      if (data.merchantName.toLowerCase().includes('anthropic')) {
        merchantNameToSet = 'Anthropic';
        newCategory = 'software';
        setCategory('software');
        setNotes('Advanced AI Tool Subscription');
      }

      setMerchantName(merchantNameToSet);
    }
    if (data.amount) {
      setAmount(data.amount.toString());
      // Run policy check with the new category (in case it was changed above)
      const numAmount = parseFloat(data.amount.toString());
      checkPolicyViolation(numAmount, newCategory);
    }
    if (data.tax) {
      setTax(data.tax.toString());
    }
    // Total is now calculated automatically from subtotal + tax
    if (data.date) {
      setExpenseDate(data.date.toISOString().split('T')[0]);
    }
  };

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

  const handleSubmit = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use calculated total (subtotal + tax) as the expense amount
    const numAmount = calculatedTotal;
    const newExpense = {
      userId: user?.id || '1',
      amount: numAmount,
      currency: 'USD',
      merchantName,
      expenseDate: new Date(expenseDate),
      category,
      expenseType,
      receiptFiles: receiptFiles.length > 0 ? receiptFiles : undefined,
      receiptImageUrl: receiptFiles.length > 0 && receiptFiles[0].type === 'image' ? receiptFiles[0].url : undefined,
      status: 'draft' as const,
      notes,
      policyViolations: policyWarning ? [policyWarning] : undefined,
    };

    addExpense(newExpense);

    // Check for special amounts (easter egg)
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

    // Use calculated total (subtotal + tax) as the expense amount
    const numAmount = calculatedTotal;

    // Company card expenses skip approval and are 'unmatched' until linked to card feed
    // Reimbursement expenses go through normal approval flow
    const status = isCompanyCard ? 'unmatched' as const : 'submitted' as const;

    const newExpense = {
      userId: user?.id || '1',
      amount: numAmount,
      currency: 'USD',
      merchantName,
      expenseDate: new Date(expenseDate),
      category,
      expenseType,
      receiptFiles: receiptFiles.length > 0 ? receiptFiles : undefined,
      receiptImageUrl: receiptFiles.length > 0 && receiptFiles[0].type === 'image' ? receiptFiles[0].url : undefined,
      status,
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
          <div>
            <h1 className="text-2xl font-bold text-white">New Expense</h1>
            <div
              className="flex items-center gap-2 mt-1 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', width: 'fit-content', paddingLeft: '5px', paddingRight: '5px', marginBottom: '15px' }}
            >
              {isCompanyCard ? (
                <CreditCard className="w-4 h-4 text-cyan-300" />
              ) : (
                <Wallet className="w-4 h-4 text-emerald-300" />
              )}
              <span className={`text-sm font-medium ${isCompanyCard ? 'text-cyan-300' : 'text-emerald-300'}`}>
                {isCompanyCard ? 'Company Card' : 'Reimbursement'}
              </span>
            </div>
          </div>
          <motion.button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)', padding: '1px' }}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Capture Receipt */}
          {step === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <GlassCard className="text-center">
                <Camera className="w-16 h-16 text-accent-primary mx-auto mb-4" style={{ marginLeft: '10px' }} />
                <h2 className="text-xl font-semibold text-white mb-2">
                  Snap Your Receipt
                </h2>
                <p className="text-white/60 mb-6" style={{ marginBottom: '5px' }}>
                  Take a photo and we'll auto-fill the details using OCR magic
                </p>

                <div className="space-y-3" style={{ marginTop: '20px' }}>
                  <div style={{ marginLeft: '15px', marginRight: '15px' }}>
                    <ReceiptUploader
                      files={receiptFiles}
                      onFilesChange={handleReceiptFilesChange}
                      required={false}
                      maxFiles={10}
                    />
                  </div>

                  <div style={{ marginLeft: '30px', marginRight: '30px', marginBottom: '25px', marginTop: '15px' }}>
                    <Button
                      variant="ghost"
                      fullWidth
                      onClick={() => setStep('form')}
                      icon={<FileText className="w-5 h-5" />}
                    >
                      Enter Manually
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 2: Form */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              {/* OCR Processing indicator */}
              {isOcrProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    boxShadow: [
                      '0 0 10px rgba(255, 0, 255, 0.3)',
                      '0 0 25px rgba(255, 0, 255, 0.6)',
                      '0 0 10px rgba(255, 0, 255, 0.3)',
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                  className="w-full py-4 rounded-[22px] bg-white/10"
                  style={{ marginTop: '25px', marginBottom: '25px' }}
                >
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-6 h-6 text-accent-primary mx-auto mb-2 animate-spin" />
                    <p className="text-accent-primary text-sm">{ocrMessage}</p>
                  </div>
                </motion.div>
              )}

              {/* Receipt preview/upload */}
              <GlassCard padding="md" className="mb-4 overflow-hidden" style={{ marginBottom: '20px', marginLeft: '20px', marginRight: '20px' }}>
                <div style={{ margin: '0 5px' }}>
                  <ReceiptUploader
                    files={receiptFiles}
                    onFilesChange={handleReceiptFilesChange}
                    required={true}
                    maxFiles={10}
                  />
                </div>
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
                      label="Subtotal"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      icon={<DollarSign className="w-5 h-5" />}
                    />
                  </div>

                  <div style={{ marginLeft: '15px', marginRight: '15px', marginTop: '10px' }}>
                    <Input
                      label="Tax"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      icon={<DollarSign className="w-5 h-5" />}
                    />
                  </div>

                  <div style={{ marginLeft: '15px', marginRight: '15px', marginTop: '10px' }}>
                    <Input
                      label="Total"
                      type="text"
                      value={calculatedTotal > 0 ? calculatedTotal.toFixed(2) : ''}
                      placeholder="0.00"
                      readOnly
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
                          style={{ backgroundColor: category === cat.value ? undefined : 'rgba(0, 0, 0, 0.10)' }}
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
                        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" style={{ marginTop: '5px', marginLeft: '5px' }} />
                        <div>
                          <p className="text-warning font-medium text-sm">
                            Policy Flag
                          </p>
                          <p className="text-white/70 text-sm" style={{ marginTop: '5px' }}>{policyWarning}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-4" style={{ marginLeft: '15px', marginRight: '15px', marginTop: '15px', marginBottom: '20px' }}>
                    <Button
                      variant="outline"
                      onClick={handleSubmit}
                      disabled={!merchantName || !amount || receiptFiles.length === 0 || isProcessing}
                      className="flex-1"
                    >
                      Save Draft
                    </Button>
                    <Button
                      onClick={handleSubmitForApproval}
                      disabled={!merchantName || !amount || receiptFiles.length === 0 || isProcessing}
                      loading={isProcessing}
                      className="flex-1"
                      icon={<Check className="w-5 h-5" />}
                    >
                      {isCompanyCard ? 'Save' : 'Submit'}
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
