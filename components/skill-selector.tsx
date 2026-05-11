'use client';

import { motion } from 'framer-motion';
import { Lock, CheckCircle } from 'lucide-react';
import { SKILL_LIST, type Skill, isRoundUnlocked, getAllRoundsCompleted } from '@/lib/skills';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface SkillSelectorProps {
  onSelectSkill: (skill: Skill) => void;
  selectedSkillId?: string;
}

export default function SkillSelector({ onSelectSkill, selectedSkillId }: SkillSelectorProps) {
  const { user } = useAuth();

  const getSkillProgress = (skillId: string) => {
    if (!user || !user.skillsProgress) return { completedRounds: [], isComplete: false };
    const progress = user.skillsProgress[skillId];
    if (!progress) return { completedRounds: [], isComplete: false };
    return {
      completedRounds: progress.roundsCompleted || [],
      isComplete: getAllRoundsCompleted(progress.roundsCompleted || []),
    };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {SKILL_LIST.map((skill, index) => {
        const Icon = skill.icon;
        const { completedRounds, isComplete } = getSkillProgress(skill.id);
        const isSelected = selectedSkillId === skill.id;

        return (
          <motion.button
            key={skill.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectSkill(skill)}
            className={cn(
              'group relative p-6 rounded-xl text-left transition-all duration-300',
              'glass hover:shadow-lg',
              isSelected && 'ring-2 ring-primary',
              isComplete && 'border-green-500/50'
            )}
          >
            {/* Completion badge */}
            {isComplete && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}

            {/* Icon */}
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                'bg-gradient-to-br',
                skill.color
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Title & Description */}
            <h3 className="font-semibold text-lg text-foreground mb-1">{skill.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{skill.description}</p>

            {/* Round progress */}
            <div className="flex gap-2 mt-4">
              {[1, 2, 3].map((roundNum) => {
                const isCompleted = completedRounds.includes(roundNum);
                const isUnlocked = isRoundUnlocked(completedRounds, roundNum);

                return (
                  <div
                    key={roundNum}
                    className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium',
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isUnlocked
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : isUnlocked ? (
                      roundNum
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
