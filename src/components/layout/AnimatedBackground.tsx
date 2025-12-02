import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

export function AnimatedBackground() {
  const { animatedBackground } = useStore();

  // Static gradient background
  if (!animatedBackground) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #16213e 100%)',
          }}
        />
        {/* Subtle static overlay for depth */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(102, 126, 234, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(118, 75, 162, 0.15) 0%, transparent 50%)',
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(-45deg, #667eea, #764ba2, #4facfe, #00f2fe)',
            'linear-gradient(-45deg, #764ba2, #4facfe, #00f2fe, #667eea)',
            'linear-gradient(-45deg, #4facfe, #00f2fe, #667eea, #764ba2)',
            'linear-gradient(-45deg, #00f2fe, #667eea, #764ba2, #4facfe)',
            'linear-gradient(-45deg, #667eea, #764ba2, #4facfe, #00f2fe)',
          ],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '400% 400%',
        }}
      />

      {/* Floating orbs for extra visual interest */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(0,245,255,0.4) 0%, transparent 70%)',
          top: '10%',
          left: '20%',
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(118,75,162,0.5) 0%, transparent 70%)',
          bottom: '20%',
          right: '15%',
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(0,245,160,0.4) 0%, transparent 70%)',
          top: '50%',
          left: '60%',
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
