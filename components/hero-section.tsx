'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TypewriterText from '@/components/typewriter-text';
import ParticleBackground from '@/components/particle-background';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  cta?: {
    text: string;
    href: string;
  };
}

export default function HeroSection({
  title = 'Verify skills. Instantly. Fraud‑proof.',
  subtitle = 'Complete 3 rounds of assessments in any skill to earn a blockchain-verified credential. No shortcuts, just excellence.',
  cta = { text: 'Start Assessing', href: '/assessments' },
}: HeroSectionProps) {
  return (
    <div className="relative min-h-[600px] flex items-center overflow-hidden">
      <ParticleBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Web3 Verified Credentials</span>
          </motion.div>

          {/* Main title with typewriter */}
          <div className="space-y-4">
            <TypewriterText
              text={title}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance leading-tight"
            />
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto text-balance"
          >
            {subtitle}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-4"
          >
            <Link href={cta.href}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-lg group"
              >
                {cta.text}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-12 text-center"
          >
            <div className="glass p-4 rounded-lg">
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-xs text-foreground/60 mt-1">Rounds per Skill</p>
            </div>
            <div className="glass p-4 rounded-lg">
              <p className="text-2xl font-bold text-accent">15</p>
              <p className="text-xs text-foreground/60 mt-1">Questions Total</p>
            </div>
            <div className="glass p-4 rounded-lg">
              <p className="text-2xl font-bold text-primary">70%</p>
              <p className="text-xs text-foreground/60 mt-1">Pass Threshold</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
