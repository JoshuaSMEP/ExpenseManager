import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Users,
  Shield,
  Plug,
  Plus,
  Edit,
  Check,
  X,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { GlassCard, Button, Input } from '../components/ui';
import { useStore } from '../store/useStore';
import type { UserRole, PolicyRule } from '../types';

type TabType = 'users' | 'policy' | 'integrations';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

const mockAdminUsers: MockUser[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'employee', status: 'active' },
  { id: '2', name: 'Mike Chen', email: 'mike@company.com', role: 'manager', status: 'active' },
  { id: '3', name: 'Lisa Wang', email: 'lisa@company.com', role: 'finance', status: 'active' },
  { id: '4', name: 'Admin User', email: 'admin@company.com', role: 'admin', status: 'active' },
];

const mockPolicyRules: PolicyRule[] = [
  {
    id: 'p1',
    name: 'Daily Meal Limit',
    description: 'Maximum $75 per day for meals',
    category: 'meals',
    maxAmount: 75,
    requiresReceipt: true,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 'p2',
    name: 'Lodging Limit',
    description: 'Maximum $200 per night for hotels',
    category: 'lodging',
    maxAmount: 200,
    requiresReceipt: true,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 'p3',
    name: 'Receipt Threshold',
    description: 'Receipts required over $25',
    maxAmount: 25,
    requiresReceipt: true,
    requiresApproval: false,
    isActive: true,
  },
];

interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
  icon: string;
  description: string;
}

const mockIntegrations: Integration[] = [
  { id: 'qb', name: 'QuickBooks', status: 'disconnected', icon: '📊', description: 'Sync expenses to QuickBooks Online' },
  { id: 'vp', name: 'Viewpoint Vista', status: 'connected', icon: '🏗️', description: 'Export to construction accounting' },
  { id: 'xero', name: 'Xero', status: 'disconnected', icon: '💰', description: 'Connect to Xero accounting' },
  { id: 'slack', name: 'Slack', status: 'disconnected', icon: '💬', description: 'Get notifications in Slack' },
];

export function AdminPage() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<MockUser[]>(mockAdminUsers);
  const [policies, setPolicies] = useState<PolicyRule[]>(mockPolicyRules);
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('employee');

  // Check admin access
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen p-4 md:p-8 pb-32 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-white/60 mb-6">You don't have permission to access the admin panel.</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  const handleInviteUser = () => {
    if (!inviteEmail) return;
    const newUser: MockUser = {
      id: `user${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'active',
    };
    setUsers((prev) => [...prev, newUser]);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('employee');
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  const handleTogglePolicy = (policyId: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === policyId ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === integrationId
          ? { ...i, status: i.status === 'connected' ? 'disconnected' : 'connected' }
          : i
      )
    );
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
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-white/60 text-sm">Manage users, policies, and integrations</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {[
            { value: 'users' as TabType, icon: Users, label: 'Users' },
            { value: 'policy' as TabType, icon: Shield, label: 'Policy' },
            { value: 'integrations' as TabType, icon: Plug, label: 'Integrations' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.value
                  ? 'bg-accent-primary text-gray-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-white/60">{users.length} users</p>
              <Button onClick={() => setShowInviteModal(true)} icon={<Plus className="w-4 h-4" />}>
                Invite User
              </Button>
            </div>

            <GlassCard padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-white/60 text-sm font-medium">User</th>
                      <th className="text-left p-4 text-white/60 text-sm font-medium">Role</th>
                      <th className="text-center p-4 text-white/60 text-sm font-medium">Status</th>
                      <th className="text-center p-4 text-white/60 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {u.name.split(' ').map((n) => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{u.name}</p>
                              <p className="text-white/60 text-sm">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className="bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/20 text-sm"
                          >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="finance">Finance</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              u.status === 'active'
                                ? 'bg-success-primary/20 text-success-primary'
                                : 'bg-white/10 text-white/50'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Policy Tab */}
        {activeTab === 'policy' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-white/60">{policies.length} rules</p>
              <Button icon={<Plus className="w-4 h-4" />}>Add Rule</Button>
            </div>

            {policies.map((policy) => (
              <GlassCard key={policy.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{policy.name}</h3>
                      {!policy.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/50">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm mb-2">{policy.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {policy.maxAmount && (
                        <span className="px-2 py-1 rounded-lg bg-accent-primary/20 text-accent-primary text-xs">
                          Max ${policy.maxAmount}
                        </span>
                      )}
                      {policy.category && (
                        <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs capitalize">
                          {policy.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleTogglePolicy(policy.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        policy.isActive
                          ? 'bg-success-primary/20 text-success-primary'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {policy.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {integrations.map((integration) => (
              <GlassCard key={integration.id}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-3xl">
                    {integration.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{integration.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          integration.status === 'connected'
                            ? 'bg-success-primary/20 text-success-primary'
                            : 'bg-white/10 text-white/50'
                        }`}
                      >
                        {integration.status}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">{integration.description}</p>
                  </div>
                  <Button
                    variant={integration.status === 'connected' ? 'outline' : 'primary'}
                    onClick={() => handleToggleIntegration(integration.id)}
                  >
                    {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        )}

        {/* Invite User Modal */}
        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowInviteModal(false)}
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
                    <h2 className="text-xl font-bold text-white">Invite User</h2>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="user@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      icon={<Mail className="w-5 h-5" />}
                    />

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as UserRole)}
                        className="w-full bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20"
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="finance">Finance</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowInviteModal(false)}>
                        Cancel
                      </Button>
                      <Button className="flex-1" onClick={handleInviteUser} disabled={!inviteEmail}>
                        Send Invite
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
