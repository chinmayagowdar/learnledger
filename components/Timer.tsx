'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

export default function Timer({ initialSeconds, onTimeUp, isRunning }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const percentage = (secondsLeft / initialSeconds) * 100;
  const isUrgent = secondsLeft < 60;

  return (
    <div className="flex items-center gap-3">
      <Clock className={`w-4 h-4 ${isUrgent ? 'text-destructive' : 'text-foreground/50'}`} />
      <div className="flex items-center gap-2">
        <span className={`text-sm font-mono font-medium ${isUrgent ? 'text-destructive' : 'text-foreground/70'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isUrgent ? 'bg-destructive' : 'bg-primary'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
