import { useState, FormEvent } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [, navigate] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) { setError(error); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass p-10 rounded-2xl text-center space-y-4"
        >
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-foreground/60 text-sm">
            We sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>.
            Click it to activate your account and then sign in.
          </p>
          <Button onClick={() => navigate('/sign-in')} className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold">
            Go to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
              L
            </div>
            <span className="text-2xl font-bold">LearnLedger</span>
          </div>
          <h1 className="text-3xl font-black">Create your account</h1>
          <p className="text-foreground/60 mt-1">Start earning blockchain credentials today</p>
        </div>

        <div className="glass p-8 rounded-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                required
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-muted/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold py-3 hover:opacity-90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-sm text-foreground/60">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/sign-in')}
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
