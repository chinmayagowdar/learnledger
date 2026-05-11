'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { SKILL_LIST } from '@/lib/skills';
import CredentialCard from '@/components/credential-card';
import { Award, Zap, Eye } from 'lucide-react';
import SkeletonLoader from '@/components/skeleton-loader';
import { useRouter } from 'next/navigation';

interface Credential {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  blockchainHash: string;
  isVerified: boolean;
  views: number;
}

export default function CredentialsPage() {
  const { user, isGuest, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCredentials() {
      if (!user || isGuest) {
        setIsLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from('credentials')
          .select('*')
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false });

        if (error) {
          console.error('Error fetching credentials:', error);
          return;
        }

        const formattedCredentials: Credential[] = (data || []).map((cred) => {
          const skillInfo = SKILL_LIST.find(s => s.id === cred.skill_id);
          return {
            id: cred.id,
            title: skillInfo?.name || cred.skill_id,
            issuer: 'LearnLedger',
            date: new Date(cred.issued_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            credentialId: cred.id,
            blockchainHash: cred.hash,
            isVerified: true,
            views: cred.views || 0,
          };
        });

        setCredentials(formattedCredentials);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      fetchCredentials();
    }
  }, [user, isGuest, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonLoader />
      </div>
    );
  }

  if (!user || isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view credentials</h2>
          <p className="text-muted-foreground mb-4">
            You need to be signed in to view your credentials.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="gradient-primary text-white px-6 py-2 rounded-lg font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const totalViews = credentials.reduce((sum, c) => sum + c.views, 0);

  return (
    <div className="min-h-screen space-y-12">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold">Your Credentials</h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            View and share your verified credentials. Click on any card to see the QR code.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass p-6 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg gradient-primary">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-foreground/60 text-sm">Total Credentials</p>
                <p className="text-3xl font-bold">{credentials.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass p-6 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg gradient-accent">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-foreground/60 text-sm">All Verified</p>
                <p className="text-3xl font-bold">{credentials.filter(c => c.isVerified).length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass p-6 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg glass-dark">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-foreground/60 text-sm">Total Views</p>
                <p className="text-3xl font-bold">{totalViews}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Credentials Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {credentials.length === 0 ? (
          <div className="text-center py-16">
            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No credentials yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete all 3 rounds of a skill assessment to earn your first credential.
            </p>
            <button
              onClick={() => router.push('/assessments')}
              className="gradient-primary text-white px-6 py-2 rounded-lg font-medium"
            >
              Start an Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {credentials.map((credential, index) => (
              <div key={credential.id} className="relative">
                <CredentialCard 
                  title={credential.title}
                  issuer={credential.issuer}
                  date={credential.date}
                  credentialId={credential.credentialId}
                  blockchainHash={credential.blockchainHash}
                  delay={index * 0.1}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8 text-center"
        >
          Share Your Success
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Easy Sharing',
              desc: 'Share credentials via QR code or unique URL',
            },
            {
              title: 'Blockchain Verified',
              desc: 'All credentials are securely verified',
            },
            {
              title: 'Instant Verification',
              desc: 'Employers can verify instantly with QR code',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-xl text-center"
            >
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-foreground/60 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
