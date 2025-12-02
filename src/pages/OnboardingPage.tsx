import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, FileSpreadsheet, Camera, Banknote } from 'lucide-react';
import { GlassCard, Button } from '../components/ui';
import { useStore } from '../store/useStore';

const slides = [
  {
    icon: FileSpreadsheet,
    title: 'Welcome!',
    subtitle: 'Say goodbye to Excel forever.',
    description:
      'No more emailing spreadsheets, no more version chaos, no more broken formulas.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Camera,
    title: 'Snap receipts in seconds',
    subtitle: 'OCR magic at your fingertips.',
    description:
      'Take a photo → AI reads merchant, date, amount → expense is 95% pre-filled.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Banknote,
    title: 'Get paid in 1-3 days',
    subtitle: 'Lightning-fast reimbursements.',
    description:
      'Submit → Approve → Pay. The entire process, streamlined and delightful.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding } = useStore();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-lg text-center relative overflow-hidden">
        {/* Skip button */}
        <button
          onClick={skipOnboarding}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-sm transition-colors"
        >
          Skip
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="py-8"
          >
            {/* Icon */}
            <motion.div
              className={`w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {(() => {
                const Icon = slides[currentSlide].icon;
                return <Icon className="w-12 h-12 text-white" />;
              })()}
            </motion.div>

            {/* Content */}
            <h1 className="text-3xl font-bold text-white mb-2">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl text-accent-primary mb-4">
              {slides[currentSlide].subtitle}
            </p>
            <p className="text-white/70 mb-8 max-w-sm mx-auto">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-accent-primary'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Next button */}
        <Button
          onClick={nextSlide}
          size="lg"
          fullWidth
          className="group"
        >
          {currentSlide < slides.length - 1 ? 'Next' : "Let's Go!"}
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </GlassCard>
    </div>
  );
}
