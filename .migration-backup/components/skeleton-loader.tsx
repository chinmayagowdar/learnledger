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
            'rounded-lg bg-gradient-to-r from-muted via-background to-muted',
            'animate-shimmer bg-[length:1000px_100%]',
            className
          )}
        />
      ))}
    </>
  );
}
