'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock } from 'lucide-react';

interface RoundProgressProps {
  currentRound: number;
  totalRounds?: number;
  rounds?: Array<{
    round: number;
    completed: boolean;
    score?: number;
    percentage?: number;
  }>;
}

export default function RoundProgress({
  currentRound,
  totalRounds = 3,
  rounds = [],
}: RoundProgressProps) {
  const displayRounds = rounds.length > 0 ? rounds : Array.from({ length: totalRounds }, (_, i) => ({
    round: i + 1,
    completed: i < currentRound - 1,
    score: i < currentRound - 1 ? undefined : undefined,
  }));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Assessment Progress</h3>
        <span className="text-sm text-foreground/60">Round {currentRound} of {totalRounds}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${((currentRound - 1) / totalRounds) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
        />
      </div>

      {/* Rounds visualization */}
      <div className="grid grid-cols-3 gap-3">
        {displayRounds.map((round) => (
          <motion.div
            key={round.round}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: round.round * 0.1 }}
            className="relative"
          >
            <div className={`
              p-4 rounded-lg border-2 transition-all duration-300
              ${round.completed
                ? 'glass border-primary bg-primary/10'
                : round.round === currentRound
                ? 'glass border-accent bg-accent/10'
                : 'glass-dark border-foreground/10'
              }
            `}>
              <div className="flex flex-col items-center gap-2">
                {round.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                ) : round.round === currentRound ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"
                  >
                    <Clock className="w-4 h-4 text-white" />
                  </motion.div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground/50">
                    {round.round}
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-xs font-semibold">Round {round.round}</p>
                  {round.percentage !== undefined && (
                    <p className="text-xs text-foreground/60">
                      {round.percentage}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 text-xs text-foreground/60 space-y-1">
        <p>Complete all 3 rounds with 70%+ score to earn your credential</p>
      </div>
    </div>
  );
}
