'use client';

import { motion } from 'framer-motion';
import { SKILLS, Skill } from '@/lib/skills';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SkillSelectorProps {
  onSelectSkill: (skillId: string) => void;
  completedSkills?: string[];
}

export default function SkillSelector({ onSelectSkill, completedSkills = [] }: SkillSelectorProps) {
  const categories = [...new Set(SKILLS.map((s) => s.category))];

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/50 mb-4">
            {category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SKILLS.filter((s) => s.category === category).map((skill, index) => {
              const isCompleted = completedSkills.includes(skill.id);
              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, translateY: 4 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <button
                    onClick={() => onSelectSkill(skill.id)}
                    className="w-full text-left glass p-5 rounded-md hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{skill.icon}</span>
                      {isCompleted && (
                        <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{skill.name}</h4>
                    <p className="text-sm text-foreground/60 line-clamp-2">{skill.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                      <span className="text-xs text-foreground/50">{skill.rounds} rounds</span>
                      <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
