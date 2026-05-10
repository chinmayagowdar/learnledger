'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLearnLedgerStore } from '@/lib/store';
import { mockCredentials } from '@/lib/mock-data';
import CredentialCard from '@/components/credential-card';
import { Award, Zap, Eye } from 'lucide-react';
import SkeletonLoader from '@/components/skeleton-loader';

export default function CredentialsPage() {
  const { credentials, setCredentials } = useLearnLedgerStore();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setCredentials(mockCredentials);
    setIsLoading(false);
  }, [setCredentials]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonLoader />
      </div>
    );
  }

  const displayCredentials = credentials.length > 0 ? credentials : mockCredentials;
  const totalViews = displayCredentials.reduce((sum, c) => sum + c.views, 0);

  const filteredCredentials = filter === 'all'
    ? displayCredentials
    : displayCredentials.filter((c) => c.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="min-h-screen space-y-8">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, translateY: 4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3 mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-semibold">Your Credentials</h1>
          <p className="text-foreground/60 max-w-xl">
            View and share your verified credentials. Click on any card to see the QR code.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, translateY: 4 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 0.05 }}
            className="glass p-5 rounded-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md gradient-primary">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-foreground/50 text-xs uppercase tracking-wider">Total Credentials</p>
                <p className="text-2xl font-semibold">{displayCredentials.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, translateY: 4 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-5 rounded-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md gradient-accent">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-foreground/50 text-xs uppercase tracking-wider">All Verified</p>
                <p className="text-2xl font-semibold">{displayCredentials.filter(c => c.isVerified).length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, translateY: 4 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 0.15 }}
            className="glass p-5 rounded-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md glass-dark">
                <Eye className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-foreground/50 text-xs uppercase tracking-wider">Total Views</p>
                <p className="text-2xl font-semibold">{totalViews}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCredentials.map((credential, index) => (
            <CredentialCard
              key={credential.id}
              title={credential.title}
              issuer={credential.issuer}
              date={credential.date}
              credentialId={credential.credentialId}
              blockchainHash={credential.blockchainHash}
              score={credential.score}
              delay={index * 0.05}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
