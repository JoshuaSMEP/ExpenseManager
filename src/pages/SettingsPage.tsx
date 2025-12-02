import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  User,
  Bell,
  Moon,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  CreditCard,
  Building,
  Sparkles,
} from 'lucide-react';
import { GlassCard, Button } from '../components/ui';
import { useStore } from '../store/useStore';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, isDarkMode, toggleDarkMode, animatedBackground, toggleAnimatedBackground } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          description: 'Manage your personal information',
          onClick: () => {},
        },
        {
          icon: CreditCard,
          label: 'Reimbursement Details',
          description: 'Bank account for direct deposit',
          onClick: () => {},
        },
        {
          icon: Building,
          label: 'Department',
          description: user?.department || 'Not set',
          onClick: () => {},
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Push notifications and email alerts',
          onClick: () => {},
        },
        {
          icon: Sparkles,
          label: 'Animated Background',
          description: animatedBackground ? 'Enabled' : 'Disabled',
          toggle: true,
          checked: animatedBackground,
          onToggle: toggleAnimatedBackground,
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          description: isDarkMode ? 'Enabled' : 'Disabled',
          toggle: true,
          checked: isDarkMode,
          onToggle: toggleDarkMode,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: Shield,
          label: 'Privacy & Security',
          description: 'Data protection and permissions',
          onClick: () => {},
        },
        {
          icon: HelpCircle,
          label: 'Help & Support',
          description: 'FAQs and contact support',
          onClick: () => {},
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 md:pb-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </motion.div>

        {/* User card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center" style={{ marginLeft: '15px', marginTop: '15px', marginBottom: '15px' }}>
                {user?.profilePhotoUrl ? (
                  <img
                    src={user.profilePhotoUrl}
                    alt={user.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-900">
                    {user?.fullName.split(' ').map((n) => n[0]).join('')}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {user?.fullName}
                </h2>
                <p className="text-white/60">{user?.email}</p>
                <p className="text-accent-primary text-sm capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Settings sections */}
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (sectionIndex + 2) }}
            className="mb-6"
          >
            <h3 className="text-white/80 text-sm font-medium uppercase tracking-wider mb-3 px-2" style={{ marginTop: '20px' }}>
              {section.title}
            </h3>
            <GlassCard padding="none" className="divide-y divide-white/10">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.toggle ? item.onToggle : item.onClick}
                  className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center" style={{ marginLeft: '5px', marginTop: '5px', marginBottom: '5px' }}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-white/50 text-sm truncate">
                      {item.description}
                    </p>
                  </div>
                  {item.toggle ? (
                    <div
                      className="w-12 h-7 rounded-full transition-colors"
                      style={{
                        marginRight: '15px',
                        background: item.checked
                          ? 'linear-gradient(135deg, #00f5ff, #00d4aa)'
                          : 'rgba(255, 255, 255, 0.2)',
                        boxShadow: item.checked ? '0 0 12px rgba(0, 245, 255, 0.4)' : 'none',
                      }}
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full bg-white shadow-lg"
                        animate={{ x: item.checked ? 26 : 4, y: 4 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  )}
                </button>
              ))}
            </GlassCard>
          </motion.div>
        ))}

        {/* Logout button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: '30px' }}
        >
          <Button
            variant="outline"
            fullWidth
            onClick={handleLogout}
            className="!border-red-500/50 hover:!bg-red-500/20 !text-red-400"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)', textShadow: '0 0 8px rgba(0, 0, 0, 0.3)' }}
            icon={<LogOut className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.3))' }} />}
          >
            Log Out
          </Button>
        </motion.div>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-white/30 text-sm mt-8"
        >
          Glass v1.0.1
        </motion.p>
      </div>
    </div>
  );
}
