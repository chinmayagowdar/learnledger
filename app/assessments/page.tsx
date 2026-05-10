'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SKILLS } from '@/lib/skills';
import { useLearnLedgerStore } from '@/lib/store';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AssessmentsPage() {
  const router = useRouter();
  const { setCurrentSkill, setCurrentRound, setRoundResults, setCameraApproved, roundResults } = useLearnLedgerStore();

  const handleSelectSkill = (skillId: string) => {
    setCurrentSkill(skillId);
    setCurrentRound(1);
    setRoundResults([]);
    setCameraApproved(false);
    router.push(`/assessments/${skillId}`);
  };

  const categories = [...new Set(SKILLS.map((s) => s.category))];

  return (
    <div className="min-h-screen space-y-8">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, translateY: 4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3 mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-semibold">Assessments</h1>
          <p className="text-foreground/60 max-w-xl">
            Select a skill to begin the 3-round assessment. Pass all rounds with 70%+ to earn your credential.
          </p>
        </motion.div>

        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/50 mb-4">
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SKILLS.filter((s) => s.category === category).map((skill, index) => {
                const skillResults = roundResults.filter((r) => r.round === 1);
                const hasProgress = skillResults.length > 0;

                return (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, translateY: 4 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => handleSelectSkill(skill.id)}
                      className="w-full text-left glass p-5 rounded-md hover:border-primary/30 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{skill.icon}</span>
                        <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{skill.name}</h3>
                      <p className="text-sm text-foreground/60 line-clamp-2">{skill.description}</p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                        <span className="text-xs text-foreground/50">{skill.rounds} rounds</span>
                        <span className="text-xs text-foreground/50">{skill.passThreshold}% to pass</span>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
