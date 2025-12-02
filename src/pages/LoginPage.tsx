import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2, Check } from 'lucide-react';
import { GlassCard, Button, Input } from '../components/ui';
import { useStore } from '../store/useStore';
import { triggerConfetti } from '../utils/confetti';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { login, isLoading } = useStore();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    // Simulate sending magic link
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSending(false);
    setIsSent(true);
    triggerConfetti();

    // Auto-login after "clicking the link"
    setTimeout(async () => {
      await login(email);
    }, 2000);
  };

  const handleSocialLogin = async (provider: string) => {
    await login(`demo@${provider}.com`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md text-center">
        {/* Logo */}
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-3xl font-bold text-gray-900">G</span>
        </motion.div>

        {/* App name */}
        <h1 className="text-3xl font-bold text-white mb-2">Glass</h1>

        {/* Welcome message */}
        <p className="text-lg text-white/80 mb-8">
          Welcome back! Let's ditch Excel forever.
        </p>

        {/* Social login buttons */}
        <div className="space-y-3 mb-6">
          <Button
            variant="outline"
            fullWidth
            onClick={() => handleSocialLogin('microsoft')}
            disabled={isLoading}
            icon={
              <svg className="w-5 h-5" viewBox="0 0 23 23" fill="currentColor">
                <path d="M0 0h11v11H0V0zm12 0h11v11H12V0zM0 12h11v11H0V12zm12 0h11v11H12V12z" />
              </svg>
            }
          >
            Continue with Microsoft
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-white/50 text-sm">or</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Magic link form */}
        <form onSubmit={handleMagicLink}>
          <Input
            type="email"
            placeholder="Enter your work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-5 h-5" />}
            disabled={isSending || isSent || isLoading}
            className="mb-4"
          />

          <Button
            type="submit"
            fullWidth
            disabled={!email || isSending || isSent || isLoading}
            variant={isSent ? 'success' : 'primary'}
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : isSent ? (
              <>
                <Check className="w-5 h-5" />
                Check your inbox!
              </>
            ) : (
              'Send Magic Link'
            )}
          </Button>
        </form>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-white/50 text-sm"
        >
          No passwords. Ever. We'll send you a secure login link
          <br />
          that expires in 10 minutes.
        </motion.p>

        {/* Version */}
        <p className="mt-4 text-white/30 text-xs">v1.0.1</p>
      </GlassCard>
    </div>
  );
}
