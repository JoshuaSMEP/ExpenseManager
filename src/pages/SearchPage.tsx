import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Search,
  Clock,
  FileText,
  User,
  CheckCircle,
  XCircle,
  Upload,
  Filter,
} from 'lucide-react';
import { GlassCard, Input, Badge } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { AuditLog } from '../types';

const mockAuditLogs: AuditLog[] = [
  {
    id: 'log1',
    userId: '1',
    userName: 'Sarah Johnson',
    action: 'Created expense',
    entityType: 'expense',
    entityId: '5',
    details: 'Starbucks - $25.50',
    timestamp: new Date(),
  },
  {
    id: 'log2',
    userId: '2',
    userName: 'Mike Chen',
    action: 'Approved expense',
    entityType: 'expense',
    entityId: '1',
    details: 'Uber - $124.50',
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: 'log3',
    userId: '3',
    userName: 'Lisa Wang',
    action: 'Exported batch',
    entityType: 'export',
    entityId: 'batch1',
    details: '15 expenses - $2,450.00',
    timestamp: new Date(Date.now() - 172800000),
  },
  {
    id: 'log4',
    userId: '2',
    userName: 'Mike Chen',
    action: 'Rejected expense',
    entityType: 'expense',
    entityId: '4',
    details: 'Marriott Hotel - $350.00 - Exceeded lodging limit',
    timestamp: new Date(Date.now() - 259200000),
  },
  {
    id: 'log5',
    userId: '4',
    userName: 'Admin User',
    action: 'Updated policy',
    entityType: 'policy',
    entityId: 'p1',
    details: 'Changed meal limit from $50 to $75',
    timestamp: new Date(Date.now() - 345600000),
  },
  {
    id: 'log6',
    userId: '1',
    userName: 'Sarah Johnson',
    action: 'Submitted expense',
    entityType: 'expense',
    entityId: '2',
    details: 'Office Depot - $45.99',
    timestamp: new Date(Date.now() - 432000000),
  },
];

type TabType = 'search' | 'audit';
type ActionFilter = 'all' | 'created' | 'approved' | 'rejected' | 'exported';

const getActionIcon = (action: string) => {
  if (action.includes('Created') || action.includes('Submitted')) return <FileText className="w-4 h-4" />;
  if (action.includes('Approved')) return <CheckCircle className="w-4 h-4 text-success-primary" />;
  if (action.includes('Rejected')) return <XCircle className="w-4 h-4 text-red-400" />;
  if (action.includes('Exported')) return <Upload className="w-4 h-4 text-accent-primary" />;
  return <Clock className="w-4 h-4" />;
};

const getActionColor = (action: string) => {
  if (action.includes('Approved')) return 'bg-success-primary/20 text-success-primary';
  if (action.includes('Rejected')) return 'bg-red-500/20 text-red-400';
  if (action.includes('Exported')) return 'bg-accent-primary/20 text-accent-primary';
  if (action.includes('Updated')) return 'bg-purple-500/20 text-purple-400';
  return 'bg-white/10 text-white/60';
};

export function SearchPage() {
  const navigate = useNavigate();
  const { expenses } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [recentSearches] = useState(['Uber', 'Starbucks', 'Conference']);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return expenses.filter(
      (exp) =>
        exp.merchantName.toLowerCase().includes(query) ||
        exp.notes?.toLowerCase().includes(query) ||
        exp.category.toLowerCase().includes(query) ||
        exp.amount.toString().includes(query)
    );
  }, [expenses, searchQuery]);

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    if (actionFilter === 'all') return mockAuditLogs;
    return mockAuditLogs.filter((log) =>
      log.action.toLowerCase().includes(actionFilter.toLowerCase())
    );
  }, [actionFilter]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
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
          <div>
            <h1 className="text-2xl font-bold text-white">Search & Audit</h1>
            <p className="text-white/60 text-sm">Find expenses and view activity history</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {(['search', 'audit'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-accent-primary text-gray-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tab === 'search' ? <Search className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              <span className="capitalize">{tab === 'search' ? 'Search Results' : 'Audit Log'}</span>
            </button>
          ))}
        </motion.div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <>
            {/* Search Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div
                className="relative"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)', borderRadius: '16px' }}
              >
                <Input
                  placeholder="Search by merchant, amount, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
            </motion.div>

            {/* Recent Searches */}
            {!searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <p className="text-white/60 text-sm mb-3">Recent Searches</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => setSearchQuery(search)}
                      className="px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                      <Clock className="w-3 h-3 text-white/50" />
                      {search}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Search Results */}
            <AnimatePresence mode="popLayout">
              {searchQuery && searchResults.length > 0 ? (
                <motion.div layout className="space-y-3">
                  <p className="text-white/60 text-sm">
                    Found {searchResults.length} results for "{searchQuery}"
                  </p>
                  {searchResults.map((expense, index) => (
                    <motion.div
                      key={expense.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GlassCard
                        padding="md"
                        className="cursor-pointer"
                        onClick={() => navigate(`/expense/${expense.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white/60" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold">{expense.merchantName}</h3>
                            <p className="text-white/60 text-sm">
                              {expense.category} · {formatDate(expense.expenseDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{formatCurrency(expense.amount)}</p>
                            <Badge status={expense.status} />
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </motion.div>
              ) : searchQuery ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <GlassCard>
                    <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                    <p className="text-white/60">Try a different search term</p>
                  </GlassCard>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <>
            {/* Action Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-6 overflow-x-auto pb-2"
            >
              <Filter className="w-4 h-4 text-white/60 flex-shrink-0" />
              {(['all', 'created', 'approved', 'rejected', 'exported'] as ActionFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActionFilter(filter)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    actionFilter === filter
                      ? 'bg-accent-primary text-gray-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </motion.div>

            {/* Audit Log Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard padding="none">
                <div className="divide-y divide-white/10">
                  {filteredAuditLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{log.userName}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getActionColor(
                                log.action
                              )}`}
                            >
                              {getActionIcon(log.action)}
                              {log.action}
                            </span>
                          </div>
                          {log.details && <p className="text-white/60 text-sm">{log.details}</p>}
                          <p className="text-white/40 text-xs mt-1">{formatTimeAgo(log.timestamp)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredAuditLogs.length === 0 && (
                  <div className="p-8 text-center">
                    <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No activity found for this filter</p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
