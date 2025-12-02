import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Receipt, CheckSquare, Settings, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/expenses', icon: Receipt, label: 'Expenses' },
  { path: '/approvals', icon: CheckSquare, label: 'Approvals' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  // Use all nav items
  const filteredNavItems = navItems;

  // Hide navigation on certain pages
  const hiddenPaths = ['/login', '/onboarding', '/expense/new'];
  if (hiddenPaths.some((p) => location.pathname.startsWith(p))) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      <div className="glass-card flex items-center justify-around py-3 px-3">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors relative ${
                isActive
                  ? 'text-[#00f5ff]'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-1.5">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#00f5ff]"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
