'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface AssessmentCardProps {
  id?: string;
  title: string;
  description: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'pending';
  duration: string;
  questions: number;
  delay?: number;
}

export default function AssessmentCard({
  id = 'default',
  title,
  description,
  progress,
  status,
  duration,
  questions,
  delay = 0,
}: AssessmentCardProps) {
  const statusIcons = {
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    'in-progress': <Clock className="w-4 h-4 text-primary" />,
    pending: <AlertCircle className="w-4 h-4 text-foreground/30" />,
  };

  const statusLabels = {
    completed: 'Completed',
    'in-progress': 'In Progress',
    pending: 'Not Started',
  };

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 4 }}
      whileInView={{ opacity: 1, translateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      className="glass p-5 rounded-md hover:border-primary/20 transition-colors duration-150 group"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm mb-0.5">{title}</h3>
            <p className="text-foreground/50 text-xs line-clamp-2">{description}</p>
          </div>
          <div className="flex-shrink-0 ml-2">
            {statusIcons[status]}
          </div>
        </div>

        <div className="flex gap-3 text-xs text-foreground/40">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
          <span>{questions} Questions</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-medium text-foreground/50 uppercase tracking-wider">Progress</span>
            <span className="text-xs font-semibold text-primary">{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: delay + 0.1 }}
              className="h-full gradient-primary"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border/50">
          <span className="text-[10px] font-medium text-foreground/40 uppercase tracking-wider">{statusLabels[status]}</span>
          <Link href={`/assessments/${id}/quiz`}>
            <span className="text-xs font-medium text-primary hover:text-accent transition-colors">
              {status === 'completed' ? 'View Result' : 'Take Assessment'}
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
