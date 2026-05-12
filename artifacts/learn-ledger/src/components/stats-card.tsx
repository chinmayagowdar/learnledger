import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  delay?: number;
  gradient?: 'purple' | 'blue';
}

export default function StatsCard({ icon, label, value, subtext, delay = 0, gradient = 'purple' }: StatsCardProps) {
  const gradientClass = gradient === 'purple' ? 'gradient-primary' : 'gradient-accent';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass p-6 rounded-xl hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
    >
      <div className={`absolute inset-0 rounded-xl ${gradientClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`} />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-foreground/60 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
          {subtext && <p className="text-foreground/50 text-xs">{subtext}</p>}
        </div>
        <div className="text-primary p-3 rounded-lg glass-dark">{icon}</div>
      </div>
    </motion.div>
  );
}
