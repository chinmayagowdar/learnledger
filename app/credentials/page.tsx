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
                <p className="text-3xl font-bold">{displayCredentials.length}</p>
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
                <p className="text-3xl font-bold">{displayCredentials.filter(c => c.isVerified).length}</p>
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
        <div className="space-y-12">
          {displayCredentials.map((credential, index) => (
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
