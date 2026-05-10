'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
}

export default function AnimatedCounter({
  from,
  to,
  duration = 2,
  delay = 0,
  suffix = '',
  prefix = '',
}: AnimatedCounterProps) {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = countRef.current;
    if (!element) return;

    let startTimestamp: number | null = null;
    const startTime = Date.now() + delay * 1000;

    const animate = (timestamp: number) => {
      if (timestamp < startTime) {
        requestAnimationFrame(animate);
        return;
      }

      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const current = Math.floor(from + (to - from) * progress);
      element.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [from, to, duration, delay, suffix, prefix]);

  return <span ref={countRef}>{prefix}{to}{suffix}</span>;
}
