'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
  onTick?: (remainingSeconds: number) => void;
  warningThreshold?: number; // seconds remaining to show warning
  className?: string;
}

export default function Timer({
  initialMinutes,
  onTimeUp,
  onTick,
  warningThreshold = 60,
  className,
}: TimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);

  const formatTime = useCallback((totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;

        if (newValue <= warningThreshold && !isWarning) {
          setIsWarning(true);
        }

        if (onTick) {
          onTick(newValue);
        }

        if (newValue <= 0) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }

        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, onTimeUp, onTick, warningThreshold, isWarning]);

  const progress = (remainingSeconds / (initialMinutes * 60)) * 100;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2 rounded-xl glass',
        isWarning && 'border-destructive/50 animate-pulse',
        className
      )}
    >
      {isWarning ? (
        <AlertTriangle className="w-5 h-5 text-destructive animate-bounce" />
      ) : (
        <Clock className="w-5 h-5 text-muted-foreground" />
      )}

      <div className="flex flex-col gap-1 min-w-[80px]">
        <span
          className={cn(
            'font-mono text-lg font-bold',
            isWarning ? 'text-destructive' : 'text-foreground'
          )}
        >
          {formatTime(remainingSeconds)}
        </span>

        {/* Progress bar */}
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-1000 rounded-full',
              isWarning ? 'bg-destructive' : 'bg-primary'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isWarning && (
        <span className="text-xs text-destructive font-medium">Time running out!</span>
      )}
    </div>
  );
}
