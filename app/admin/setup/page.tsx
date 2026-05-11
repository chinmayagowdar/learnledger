'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export default function AdminSetupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [setupKey, setSetupKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    const checkAdminSetup = async () => {
      try {
        const response = await fetch('/api/admin/setup');
        const data = await response.json();
        setNeedsSetup(data.needsSetup);
      } catch (error) {
        console.error('Error checking admin setup:', error);
      } finally {
        setCheckingSetup(false);
      }
    };

    checkAdminSetup();
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in first');
      router.push('/login');
      return;
    }

    if (!setupKey.trim()) {
      toast.error('Please enter the setup key');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          setupKey: setupKey.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed');
      }

      setSetupComplete(true);
      toast.success('Admin setup complete! You are now an admin.');
      
      // Refresh the page after a delay to update auth state
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!needsSetup && !setupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-xl max-w-md w-full text-center space-y-4"
        >
          <CheckCircle className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Admin Already Exists</h2>
          <p className="text-foreground/60">
            An admin account has already been set up. Contact your administrator for role changes.
          </p>
          <Button className="w-full" onClick={() => router.push('/admin')}>
            Go to Admin Panel
          </Button>
        </motion.div>
      </div>
    );
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-xl max-w-md w-full text-center space-y-4"
        >
          <CheckCircle className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Setup Complete!</h2>
          <p className="text-foreground/60">
            You have been promoted to admin. Redirecting to admin panel...
          </p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-xl max-w-md w-full text-center space-y-4"
        >
          <AlertCircle className="w-12 h-12 text-accent mx-auto" />
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-foreground/60">
            Please sign in or create an account first before setting up admin access.
          </p>
          <div className="space-y-2">
            <Button className="w-full" onClick={() => router.push('/login')}>
              Sign In
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/signup')}>
              Create Account
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-xl max-w-md w-full space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Setup</h1>
          <p className="text-foreground/60 text-sm">
            Set up the first admin account for LearnLedger
          </p>
        </div>

        <div className="glass p-4 rounded-lg bg-accent/10 border border-accent/20">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-accent">Setup Key Required</p>
              <p className="text-foreground/60 mt-1">
                Enter the ADMIN_SETUP_KEY from your environment variables to complete setup.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSetup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Signed in as</Label>
            <Input
              id="email"
              type="email"
              value={user.email || ''}
              disabled
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setupKey">Setup Key</Label>
            <Input
              id="setupKey"
              type="password"
              placeholder="Enter your admin setup key"
              value={setupKey}
              onChange={(e) => setSetupKey(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Complete Admin Setup
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-center text-foreground/50">
          This page is only accessible when no admin exists in the system.
        </p>
      </motion.div>
    </div>
  );
}
