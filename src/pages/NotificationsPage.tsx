import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Check,
  AlertCircle,
  DollarSign,
  MessageSquare,
  X,
} from 'lucide-react';
import { GlassCard } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatRelativeTime } from '../utils/formatters';
import type { Notification } from '../types';

const notificationIcons: Record<Notification['type'], React.ReactNode> = {
  approval_needed: <AlertCircle className="w-5 h-5 text-yellow-400" />,
  reimbursed: <DollarSign className="w-5 h-5 text-success-primary" />,
  comment: <MessageSquare className="w-5 h-5 text-accent-primary" />,
  rejected: <X className="w-5 h-5 text-red-400" />,
  submitted: <Check className="w-5 h-5 text-accent-primary" />,
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead } = useStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

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
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-white/60 text-sm">{unreadCount} unread</p>
            )}
          </div>
        </motion.div>

        {/* Notifications list */}
        {notifications.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{ marginTop: '10px', marginBottom: '5px' }}
              >
                <GlassCard
                  padding="none"
                  className={`cursor-pointer transition-all ${
                    !notification.read ? 'border-accent-primary/50' : ''
                  }`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="p-4 flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !notification.read ? 'bg-accent-primary/20' : 'bg-white/10'
                      }`}
                      style={{ marginLeft: '10px' }}
                    >
                      {notificationIcons[notification.type]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3
                            className={`font-medium ${
                              !notification.read ? 'text-white' : 'text-white/70'
                            }`}
                            style={{ marginTop: '5px' }}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-white/60 text-sm mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-accent-primary flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-white/40 text-xs mt-2" style={{ marginBottom: '5px' }}>
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <GlassCard className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No notifications
            </h3>
            <p className="text-white/60">
              You're all caught up! Check back later.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
