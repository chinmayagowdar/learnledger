'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  cta?: {
    text: string;
    href: string;
  };
}

export default function HeroSection({
  title = 'Verify skills. Instantly. Fraud-proof.',
  subtitle = 'Complete 3 rounds of assessments in any skill to earn a blockchain-verified credential.',
  cta = { text: 'Start Assessing', href: '/assessments' },
}: HeroSectionProps) {
  return (
    <div className="relative flex items-center overflow-hidden py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, translateY: 4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-5"
        >
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-balance leading-tight">
              {title}
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-foreground/60 max-w-xl mx-auto text-balance"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, translateY: 4 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-2"
          >
            <Link href={cta.href}>
              <Button
                size="lg"
                className="gradient-primary text-white rounded-md group"
              >
                {cta.text}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3 max-w-sm mx-auto mt-8 text-center"
          >
            <div className="glass p-3 rounded-md">
              <p className="text-xl font-semibold text-primary">3</p>
              <p className="text-[10px] text-foreground/50 mt-0.5">Rounds</p>
            </div>
            <div className="glass p-3 rounded-md">
              <p className="text-xl font-semibold text-accent">15</p>
              <p className="text-[10px] text-foreground/50 mt-0.5">Questions</p>
            </div>
            <div className="glass p-3 rounded-md">
              <p className="text-xl font-semibold text-primary">70%</p>
              <p className="text-[10px] text-foreground/50 mt-0.5">Pass Rate</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
