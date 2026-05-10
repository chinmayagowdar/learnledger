'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award } from 'lucide-react';
import SkillSelector from '@/components/skill-selector';
import RoundStepper from '@/components/round-stepper';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { type Skill, getAllRoundsCompleted, SKILL_LIST } from '@/lib/skills';

export default function AssessmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const getSkillProgress = (skillId: string) => {
    if (!user || !user.skills) return [];
    const progress = user.skills[skillId];
    return progress?.roundsCompleted || [];
  };

  const completedSkillsCount = SKILL_LIST.filter((skill) => {
    const completedRounds = getSkillProgress(skill.id);
    return getAllRoundsCompleted(completedRounds);
  }).length;

  const inProgressCount = SKILL_LIST.filter((skill) => {
    const completedRounds = getSkillProgress(skill.id);
    return completedRounds.length > 0 && !getAllRoundsCompleted(completedRounds);
  }).length;

  const handleStartRound = (roundNumber: 1 | 2 | 3) => {
    if (!selectedSkill) return;
    router.push(`/assessments/${selectedSkill.id}/round/${roundNumber}`);
  };

  return (
    <div className="min-h-screen space-y-8">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 mb-8"
        >
          <div className="flex items-center gap-4">
            {selectedSkill && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSkill(null)}
                className="rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                {selectedSkill ? selectedSkill.name : 'Skill Assessments'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {selectedSkill
                  ? selectedSkill.description
                  : 'Select a skill to begin your assessment journey'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {!selectedSkill && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Completed Skills</p>
                  <p className="text-2xl font-bold text-foreground">{completedSkillsCount}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-lg font-bold text-muted-foreground">{SKILL_LIST.length}</span>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Skills</p>
                  <p className="text-2xl font-bold text-foreground">{SKILL_LIST.length}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          {selectedSkill ? (
            <motion.div
              key="rounds"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Skill header */}
              <div className="glass p-6 rounded-xl mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${selectedSkill.color}`}
                  >
                    <selectedSkill.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedSkill.name}</h2>
                    <p className="text-muted-foreground">{selectedSkill.description}</p>
                  </div>
                </div>
              </div>

              {/* Round stepper */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Assessment Rounds</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete all 3 rounds to earn your {selectedSkill.name} credential
                </p>
                <RoundStepper
                  skill={selectedSkill}
                  completedRounds={getSkillProgress(selectedSkill.id)}
                  onStartRound={handleStartRound}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="skills"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Select a Skill</h3>
              <SkillSelector
                onSelectSkill={setSelectedSkill}
                selectedSkillId={selectedSkill?.id}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
