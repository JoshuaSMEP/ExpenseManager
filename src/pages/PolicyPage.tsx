import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Shield,
  Search,
  DollarSign,
  Receipt,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { GlassCard, Input } from '../components/ui';
import type { PolicyRule, ExpenseCategory } from '../types';

const mockPolicyRules: PolicyRule[] = [
  {
    id: 'p1',
    name: 'Daily Meal Limit',
    description: 'Maximum $75 per day for meals. Receipts required for all meal expenses.',
    category: 'meals',
    maxAmount: 75,
    requiresReceipt: true,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 'p2',
    name: 'Lodging Limit',
    description: 'Maximum $200 per night for hotels. Pre-approval required for amounts over $150.',
    category: 'lodging',
    maxAmount: 200,
    requiresReceipt: true,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 'p3',
    name: 'Receipt Requirement',
    description: 'Receipts are required for all expenses over $25.',
    maxAmount: 25,
    requiresReceipt: true,
    requiresApproval: false,
    isActive: true,
  },
  {
    id: 'p4',
    name: 'Transportation Policy',
    description: 'Use economy class for flights under 4 hours. Business class requires pre-approval.',
    category: 'transportation',
    requiresReceipt: true,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 'p5',
    name: 'Travel Per Diem',
    description: 'Maximum $50 per day for incidental travel expenses (tips, snacks, etc.)',
    category: 'travel',
    maxAmount: 50,
    requiresReceipt: false,
    requiresApproval: false,
    isActive: true,
  },
  {
    id: 'p6',
    name: 'Entertainment Limit',
    description: 'Client entertainment limited to $150 per person. Manager approval required.',
    category: 'entertainment',
    maxAmount: 150,
    requiresReceipt: true,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 'p7',
    name: 'Office Supplies',
    description: 'Individual purchases under $100 do not require pre-approval.',
    category: 'supplies',
    maxAmount: 100,
    requiresReceipt: true,
    requiresApproval: false,
    isActive: true,
  },
  {
    id: 'p8',
    name: 'Approval Threshold',
    description: 'All expenses over $500 require VP-level approval.',
    maxAmount: 500,
    requiresReceipt: true,
    requiresApproval: true,
    isActive: true,
  },
];

const categoryIcons: Record<ExpenseCategory, string> = {
  meals: '🍽️',
  travel: '✈️',
  supplies: '📦',
  entertainment: '🎭',
  lodging: '🏨',
  transportation: '🚗',
  other: '📋',
};

export function PolicyPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');

  const categories: (ExpenseCategory | 'all')[] = [
    'all',
    'meals',
    'travel',
    'transportation',
    'lodging',
    'supplies',
    'entertainment',
    'other',
  ];

  const filteredRules = mockPolicyRules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
    return matchesSearch && matchesCategory && rule.isActive;
  });

  // Group rules by category
  const groupedRules = filteredRules.reduce((acc, rule) => {
    const cat = rule.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(rule);
    return acc;
  }, {} as Record<string, PolicyRule[]>);

  // General rules (no category)
  const generalRules = filteredRules.filter((rule) => !rule.category);

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
            <h1 className="text-2xl font-bold text-white">Expense Policy</h1>
            <p className="text-white/60 text-sm">Company expense guidelines and limits</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-accent-primary" />
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)', borderRadius: '12px' }}>
            <Input
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === cat
                  ? 'bg-accent-primary text-gray-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {cat !== 'all' && <span>{categoryIcons[cat]}</span>}
              <span className="capitalize">{cat === 'all' ? 'All Rules' : cat}</span>
            </button>
          ))}
        </motion.div>

        {/* General Rules */}
        {generalRules.length > 0 && selectedCategory === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent-primary" />
              General Policies
            </h2>
            <div className="space-y-3">
              {generalRules.map((rule) => (
                <PolicyRuleCard key={rule.id} rule={rule} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Category-Grouped Rules */}
        {Object.entries(groupedRules)
          .filter(([cat]) => cat !== 'other' || selectedCategory !== 'all')
          .map(([category, rules], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="mb-6"
            >
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">{categoryIcons[category as ExpenseCategory]}</span>
                <span className="capitalize">{category}</span>
              </h2>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <PolicyRuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            </motion.div>
          ))}

        {/* Empty State */}
        {filteredRules.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <GlassCard>
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">No policies found</h3>
              <p className="text-white/60">Try adjusting your search or filter</p>
            </GlassCard>
          </motion.div>
        )}

        {/* Quick Reference Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="mt-8">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Quick Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-white/60 text-sm mb-1">Receipt Required Over</p>
                <p className="text-white font-bold text-xl">$25</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-white/60 text-sm mb-1">VP Approval Over</p>
                <p className="text-white font-bold text-xl">$500</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-white/60 text-sm mb-1">Daily Meal Limit</p>
                <p className="text-white font-bold text-xl">$75</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-white/60 text-sm mb-1">Nightly Lodging Limit</p>
                <p className="text-white font-bold text-xl">$200</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

function PolicyRuleCard({ rule }: { rule: PolicyRule }) {
  return (
    <GlassCard padding="md" hoverable>
      <div className="flex items-start gap-4">
        {/* Limit indicator */}
        {rule.maxAmount && (
          <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-accent-primary" />
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">{rule.name}</h3>
          <p className="text-white/60 text-sm mb-3">{rule.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {rule.maxAmount && (
              <span className="px-2 py-1 rounded-lg bg-accent-primary/20 text-accent-primary text-xs font-medium">
                Max ${rule.maxAmount}
              </span>
            )}
            {rule.requiresReceipt && (
              <span className="px-2 py-1 rounded-lg bg-warning/20 text-warning text-xs font-medium flex items-center gap-1">
                <Receipt className="w-3 h-3" />
                Receipt Required
              </span>
            )}
            {rule.requiresApproval && (
              <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Approval Required
              </span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
