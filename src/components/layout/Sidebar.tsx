import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Receipt,
  CheckSquare,
  LayoutDashboard,
  Settings,
  LogOut,
  Bell,
  FileText,
  CreditCard,
  Briefcase,
  Shield,
  Search,
  Users,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/expenses', icon: Receipt, label: 'My Expenses' },
  { path: '/approvals', icon: CheckSquare, label: 'Approvals' },
  { path: '/ap-dashboard', icon: LayoutDashboard, label: 'AP Dashboard', roles: ['finance', 'admin'] },
  { path: '/reports', icon: FileText, label: 'Reports', roles: ['finance', 'admin'] },
  { path: '/cards', icon: CreditCard, label: 'Card Feed' },
  { path: '/trips', icon: Briefcase, label: 'Trips' },
  { path: '/policy', icon: Shield, label: 'Policy' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/admin', icon: Users, label: 'Admin', roles: ['admin'] },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, notifications } = useStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || 'employee');
  });

  // Hide sidebar on certain pages
  const hiddenPaths = ['/login', '/onboarding'];
  if (hiddenPaths.some((p) => location.pathname.startsWith(p))) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col p-4 z-40"
    >
      <div
        className="flex-1 flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(30, 30, 50, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f5ff] to-[#00ddeb] flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">G</span>
            </div>
            <span className="text-xl font-bold text-white">Glass</span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-2.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
                  isActive
                    ? 'bg-[#00f5ff]/20 text-[#00f5ff]'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.path === '/notifications' && unreadCount > 0 && (
                  <span className="absolute right-4 py-1 bg-[#00f5ff] text-gray-900 text-xs font-bold rounded-full" style={{ paddingLeft: '2px', paddingRight: '2px' }}>
                    {unreadCount}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 w-1 h-8 rounded-r-full bg-[#00f5ff]"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              {user?.profilePhotoUrl ? (
                <img
                  src={user.profilePhotoUrl}
                  alt={user.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold">
                  {user?.fullName.split(' ').map((n) => n[0]).join('')}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.fullName}</p>
              <p className="text-white/50 text-sm truncate">{user?.department}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
