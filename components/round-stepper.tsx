'use client';

import { motion } from 'framer-motion';
import { Lock, CheckCircle, Play, FileQuestion, Code2, Video } from 'lucide-react';
import { type Skill, type RoundConfig, isRoundUnlocked } from '@/lib/skills';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RoundStepperProps {
  skill: Skill;
  completedRounds: number[];
  currentRound?: number;
  onStartRound: (roundNumber: 1 | 2 | 3) => void;
}

const roundIcons = {
  mcq: FileQuestion,
  coding: Code2,
  proctored: Video,
};

export default function RoundStepper({
  skill,
  completedRounds,
  currentRound,
  onStartRound,
}: RoundStepperProps) {
  const rounds = [
    { number: 1 as const, config: skill.rounds[1] },
    { number: 2 as const, config: skill.rounds[2] },
    { number: 3 as const, config: skill.rounds[3] },
  ];

  return (
    <div className="space-y-4">
      {rounds.map(({ number, config }, index) => {
        const isCompleted = completedRounds.includes(number);
        const isUnlocked = isRoundUnlocked(completedRounds, number);
        const isCurrent = currentRound === number;
        const Icon = roundIcons[config.type];

        return (
          <motion.div
            key={number}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300',
              'glass',
              isCompleted && 'border-green-500/50',
              isCurrent && 'ring-2 ring-primary',
              !isUnlocked && 'opacity-60'
            )}
          >
            {/* Connector line */}
            {index < rounds.length - 1 && (
              <div
                className={cn(
                  'absolute left-8 top-full w-0.5 h-4 -translate-x-1/2',
                  completedRounds.includes(number) ? 'bg-green-500' : 'bg-muted'
                )}
              />
            )}

            {/* Round indicator */}
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0',
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isUnlocked
                    ? 'gradient-primary text-white'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <CheckCircle className="w-6 h-6" />
              ) : isUnlocked ? (
                <Icon className="w-6 h-6" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>

            {/* Round info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">Round {number}</h3>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    config.type === 'mcq' && 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
                    config.type === 'coding' && 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
                    config.type === 'proctored' && 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                  )}
                >
                  {config.type.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground/80">{config.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>Time: {config.timeLimit} min</span>
                <span>Pass: {config.passingScore}%</span>
                {config.questionCount && <span>Questions: {config.questionCount}</span>}
                {config.problemCount && <span>Problems: {config.problemCount}</span>}
              </div>
            </div>

            {/* Action button */}
            <div className="flex-shrink-0">
              {isCompleted ? (
                <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium">
                  Completed
                </span>
              ) : isUnlocked ? (
                <Button
                  onClick={() => onStartRound(number)}
                  className="gradient-primary text-white"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Locked
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
