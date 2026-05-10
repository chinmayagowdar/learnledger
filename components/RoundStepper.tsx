'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { ROUND_LABELS, ROUND_DESCRIPTIONS } from '@/lib/skills';

interface RoundStepperProps {
  currentRound: number;
  completedRounds: number[];
  skillName: string;
}

export default function RoundStepper({ currentRound, completedRounds, skillName }: RoundStepperProps) {
  const rounds = [1, 2, 3];

  const getRoundState = (round: number): 'completed' | 'current' | 'locked' => {
    if (completedRounds.includes(round)) return 'completed';
    if (round === currentRound) return 'current';
    return 'locked';
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/50">
          {skillName} - Assessment Progress
        </h3>
        <span className="text-sm text-foreground/60">
          Round {currentRound} of 3
        </span>
      </div>

      <div className="flex items-center gap-2">
        {rounds.map((round, index) => {
          const state = getRoundState(round);
          return (
            <div key={round} className="flex items-center flex-1">
              <motion.div
                initial={{ opacity: 0, translateY: 4 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex items-center gap-3 p-3 rounded-md flex-1 transition-colors duration-200
                  ${state === 'completed'
                    ? 'bg-accent/10 border border-accent/30'
                    : state === 'current'
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-muted/50 border border-border/50 opacity-50'
                  }
                `}
              >
                <div className="flex-shrink-0">
                  {state === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                  ) : state === 'current' ? (
                    <PlayCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <Lock className="w-5 h-5 text-foreground/30" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${
                    state === 'completed' ? 'text-accent' : state === 'current' ? 'text-primary' : 'text-foreground/40'
                  }`}>
                    Round {round}
                  </p>
                  <p className="text-xs text-foreground/50 truncate">
                    {ROUND_LABELS[round]}
                  </p>
                </div>
              </motion.div>
              {index < rounds.length - 1 && (
                <div className={`w-6 h-px flex-shrink-0 ${
                  state === 'completed' ? 'bg-accent/50' : 'bg-border'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-foreground/50">
        {ROUND_DESCRIPTIONS[currentRound]}
      </p>
    </div>
  );
}
