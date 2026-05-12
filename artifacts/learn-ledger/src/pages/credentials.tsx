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
    return <div className="min-h-screen flex items-center justify-center"><SkeletonLoader /></div>;
  }

  const displayCredentials = credentials.length > 0 ? credentials : mockCredentials;
  const totalViews = displayCredentials.reduce((sum, c) => sum + c.views, 0);

  return (
    <div className="min-h-screen space-y-12">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-4 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold">Your Credentials</h1>
          <p className="text-lg text-foreground/70 max-w-2xl">View and share your verified credentials. Click on any card to see the QR code.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Award className="w-5 h-5 text-white" />, iconBg: 'gradient-primary', label: 'Total Credentials', value: displayCredentials.length, delay: 0.1 },
            { icon: <Zap className="w-5 h-5 text-white" />, iconBg: 'gradient-accent', label: 'All Verified', value: displayCredentials.filter(c => c.isVerified).length, delay: 0.2 },
            { icon: <Eye className="w-5 h-5 text-primary" />, iconBg: 'glass-dark', label: 'Total Views', value: totalViews, delay: 0.3 },
          ].map(({ icon, iconBg, label, value, delay }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay }} className="glass p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${iconBg}`}>{icon}</div>
                <div>
                  <p className="text-foreground/60 text-sm">{label}</p>
                  <p className="text-3xl font-bold">{value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-bold mb-8 text-center">
          Share Your Success
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Easy Sharing', desc: 'Share credentials via QR code or unique URL' },
            { title: 'Blockchain Verified', desc: 'All credentials are securely verified' },
            { title: 'Instant Verification', desc: 'Employers can verify instantly with QR code' },
          ].map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass p-6 rounded-xl text-center">
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-foreground/60 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
