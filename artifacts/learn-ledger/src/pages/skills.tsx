import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLearnLedgerStore } from '@/lib/store';

const skills = [
  { id: 'react-advanced', name: 'React Advanced', description: 'Master advanced React patterns, hooks, and optimization techniques', level: 'Advanced', rounds: 3, questionsPerRound: 5 },
  { id: 'js-mastery', name: 'JavaScript Mastery', description: 'Deep dive into JavaScript fundamentals, async patterns, and modern ES6+', level: 'Advanced', rounds: 3, questionsPerRound: 5 },
  { id: 'typescript-pro', name: 'TypeScript Pro', description: 'Advanced TypeScript concepts, generics, conditional types, and patterns', level: 'Advanced', rounds: 3, questionsPerRound: 5 },
];

export default function SkillsPage() {
  const { setCurrentSkill, setCurrentRound, setRoundResults } = useLearnLedgerStore();

  const handleSelectSkill = (skillId: string) => {
    setCurrentSkill(skillId);
    setCurrentRound(1);
    setRoundResults([]);
  };

  return (
    <div className="min-h-screen space-y-12 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold">Choose a Skill</h1>
          <p className="text-lg text-foreground/70 max-w-2xl">Select a skill to begin the 3-round assessment. Pass all rounds with 70%+ to earn your credential.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => (
            <motion.div key={skill.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group">
              <div className="glass rounded-xl p-6 h-full flex flex-col justify-between border border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-2xl font-bold">{skill.name}</h3>
                    <p className="text-sm text-primary font-semibold uppercase tracking-wider">{skill.level}</p>
                  </div>
                  <p className="text-foreground/70">{skill.description}</p>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-foreground/10">
                    <div>
                      <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold mb-1">Rounds</p>
                      <p className="text-lg font-bold">{skill.rounds}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold mb-1">Questions</p>
                      <p className="text-lg font-bold">{skill.questionsPerRound}</p>
                    </div>
                  </div>
                </div>
                <Link href={`/assessments/${skill.id}/quiz`} onClick={() => handleSelectSkill(skill.id)} className="w-full mt-6 block">
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-lg">
                    Start Assessment <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mt-12 glass p-8 rounded-xl">
          <div className="flex gap-4">
            <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-2">Assessment Format</h3>
              <ul className="space-y-2 text-foreground/70">
                <li>• Each skill has 3 rounds of increasing difficulty: Intermediate, Advanced, Expert</li>
                <li>• 5 questions per round with detailed explanations after completion</li>
                <li>• 70% or higher score required to pass each round</li>
                <li>• Pass all 3 rounds to earn a blockchain-verified credential</li>
                <li>• Unlimited attempts - retake any round as many times as you need</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
