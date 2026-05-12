import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { useLearnLedgerStore } from '@/lib/store';
import { mockCredentials, mockAssessments } from '@/lib/mock-data';
import HeroSection from '@/components/hero-section';
import StatsCard from '@/components/stats-card';
import ModernChart from '@/components/modern-chart';
import SkeletonLoader from '@/components/skeleton-loader';

export default function Dashboard() {
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

  const completedAssessments = mockAssessments.filter((a) => a.status === 'completed').length;
  const totalCredentials = credentials.length || mockCredentials.length;

  const stats = [
    { icon: <Award className="w-5 h-5" />, label: 'Credentials Earned', value: String(totalCredentials), subtext: `${mockCredentials.length} verified`, delay: 0.1, gradient: 'purple' as const },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Assessments Completed', value: String(completedAssessments), subtext: '100% pass rate', delay: 0.2, gradient: 'blue' as const },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Overall Progress', value: '87%', subtext: 'Trending up', delay: 0.3, gradient: 'purple' as const },
    { icon: <Clock className="w-5 h-5" />, label: 'Learning Hours', value: '156', subtext: '+12h this week', delay: 0.4, gradient: 'blue' as const },
  ];

  return (
    <div className="min-h-screen space-y-12">
      <HeroSection
        title="Verify skills. Instantly. Fraud‑proof."
        subtitle="Complete 3 rounds of assessments in any skill to earn a blockchain-verified credential."
        cta={{ text: 'Start Assessing', href: '/assessments' }}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8"
        >
          Your Progress at a Glance
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ModernChart />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8 text-center"
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Take 3 Rounds', desc: 'Complete progressively difficult assessments', num: 1 },
            { title: 'Score 70%+', desc: 'Pass each round with a strong performance', num: 2 },
            { title: 'Earn Credential', desc: 'Receive a blockchain-verified certificate', num: 3 },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-xl text-center relative"
            >
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold">
                {feature.num}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-foreground/60">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
