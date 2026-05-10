'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Award, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { useLearnLedgerStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { mockCredentials } from '@/lib/mock-data';
import SkillSelector from '@/components/SkillSelector';
import StatsCard from '@/components/stats-card';
import ModernChart from '@/components/modern-chart';
import SkeletonLoader from '@/components/skeleton-loader';

export default function Dashboard() {
  const { credentials, setCredentials, setCurrentSkill, setCurrentRound, setRoundResults, setCameraApproved } = useLearnLedgerStore();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCredentials(mockCredentials);
    setIsLoading(false);
  }, [setCredentials]);

  const handleSelectSkill = (skillId: string) => {
    setCurrentSkill(skillId);
    setCurrentRound(1);
    setRoundResults([]);
    setCameraApproved(false);
    router.push(`/assessments/${skillId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonLoader />
      </div>
    );
  }

  const totalCredentials = credentials.length || mockCredentials.length;

  const stats = [
    { icon: <Award className="w-5 h-5" />, label: 'Credentials Earned', value: String(totalCredentials), subtext: `${mockCredentials.length} verified`, delay: 0.05, gradient: 'primary' as const },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Skills Available', value: '8', subtext: 'Computer Engineering', delay: 0.1, gradient: 'accent' as const },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Overall Progress', value: '87%', subtext: 'Trending up', delay: 0.15, gradient: 'primary' as const },
    { icon: <Clock className="w-5 h-5" />, label: 'Learning Hours', value: '156', subtext: '+12h this week', delay: 0.2, gradient: 'accent' as const },
  ];

  return (
    <div className="min-h-screen space-y-10">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, translateY: 4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-3xl sm:text-4xl font-semibold">
            {user ? `Welcome back` : 'Verify skills. Instantly.'}
          </h1>
          <p className="text-foreground/60 max-w-xl">
            Complete 3 rounds of assessments in any skill to earn a blockchain-verified credential. No shortcuts, just excellence.
          </p>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Skill Selector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xl font-semibold mb-6"
        >
          Choose a Skill
        </motion.h2>
        <SkillSelector onSelectSkill={handleSelectSkill} />
      </section>

      {/* Chart Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ModernChart />
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xl font-semibold mb-6"
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Round 1: MCQ', desc: '5 multiple-choice questions, auto-graded', num: 1 },
            { title: 'Round 2: Coding', desc: '2 coding problems with code editor', num: 2 },
            { title: 'Round 3: Proctored', desc: 'AI-proctored assessment with webcam', num: 3 },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, translateY: 4 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass p-5 rounded-md relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                  {feature.num}
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
              </div>
              <p className="text-sm text-foreground/60 pl-10">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
