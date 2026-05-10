'use client';

import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export default function SkeletonLoader({ className = '', count = 1 }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-md bg-muted/50 animate-pulse',
            className
          )}
        />
      ))}
    </>
  );
}
