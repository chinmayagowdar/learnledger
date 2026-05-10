'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  delay?: number;
  gradient?: 'primary' | 'accent';
}

export default function StatsCard({
  icon,
  label,
  value,
  subtext,
  delay = 0,
  gradient = 'primary',
}: StatsCardProps) {
  const gradientClass = gradient === 'primary' ? 'gradient-primary' : 'gradient-accent';

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 4 }}
      whileInView={{ opacity: 1, translateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      className="glass p-5 rounded-md hover:border-primary/20 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-foreground/50 text-xs font-medium uppercase tracking-wider mb-1.5">{label}</p>
          <p className="text-2xl font-semibold text-foreground mb-0.5">{value}</p>
          {subtext && <p className="text-foreground/40 text-xs">{subtext}</p>}
        </div>
        <div className="text-primary p-2.5 rounded-md glass-dark">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
