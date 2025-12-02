import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function GlassCard({
  children,
  className,
  hoverable = true,
  padding = 'lg',
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={clsx(
        'glass-card',
        paddingClasses[padding],
        className
      )}
      whileHover={
        hoverable
          ? {
              scale: 1.02,
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
