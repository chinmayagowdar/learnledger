import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchCredentials } from '@/lib/supabase-data';
import CredentialCard from '@/components/credential-card';
import { Award, Zap, Eye, RefreshCw } from 'lucide-react';
import SkeletonLoader from '@/components/skeleton-loader';
import { Button } from '@/components/ui/button';
import type { Credential } from '@/lib/store';

export default function CredentialsPage() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setIsLoading(true);
    const data = await fetchCredentials(user.id);
    setCredentials(data);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><SkeletonLoader /></div>;
  }

  const totalViews = credentials.reduce((sum, c) => sum + c.views, 0);

  return (
    <div className="min-h-screen space-y-12">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold">Your Credentials</h1>
            <p className="text-lg text-foreground/70 max-w-2xl mt-2">View and share your verified credentials. Click on any card to see the QR code.</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="rounded-lg gap-2 mt-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Award className="w-5 h-5 text-white" />, iconBg: 'gradient-primary', label: 'Total Credentials', value: credentials.length, delay: 0.1 },
            { icon: <Zap className="w-5 h-5 text-white" />, iconBg: 'gradient-accent', label: 'All Verified', value: credentials.filter(c => c.isVerified).length, delay: 0.2 },
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
        {credentials.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-16 rounded-2xl text-center">
            <Award className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
            <h2 className="text-xl font-bold mb-2">No credentials yet</h2>
            <p className="text-foreground/60 text-sm">Complete an assessment to earn your first blockchain-verified credential.</p>
            <Button onClick={() => window.location.href = '/assessments'} className="mt-6 bg-gradient-to-r from-primary to-accent text-white rounded-xl">
              Browse Assessments
            </Button>
          </motion.div>
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
