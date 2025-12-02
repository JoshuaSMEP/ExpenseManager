import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <motion.button
      className="floating-button"
      onClick={onClick}
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    >
      <motion.div
        variants={{
          hover: { rotate: 180, scale: 1.1 }
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Plus className="w-8 h-8 text-gray-900" strokeWidth={2.5} />
      </motion.div>
    </motion.button>
  );
}
