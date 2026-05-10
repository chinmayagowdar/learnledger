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
    completed: <CheckCircle className="w-5 h-5 text-green-500" />,
    'in-progress': <Clock className="w-5 h-5 text-blue-500" />,
    pending: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  };

  const statusLabels = {
    completed: 'Completed',
    'in-progress': 'In Progress',
    pending: 'Not Started',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass p-6 rounded-xl hover:shadow-lg transition-all duration-300 group cursor-pointer"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
            <p className="text-foreground/60 text-sm">{description}</p>
          </div>
          <div className="flex-shrink-0">
            {statusIcons[status]}
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex gap-4 text-sm text-foreground/50">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div>
            <span>{questions} Questions</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground/70">Progress</span>
            <span className="text-xs font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: delay + 0.2 }}
              className="h-full gradient-primary"
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <span className="text-xs font-medium text-foreground/60">{statusLabels[status]}</span>
          <Link href={`/assessments/${id}/quiz`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs font-semibold text-primary hover:text-accent transition-colors"
            >
              {status === 'completed' ? 'View Result' : 'Take Assessment'}
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
