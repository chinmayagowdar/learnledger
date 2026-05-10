export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rounds: number;
  questionsPerRound: number;
  passThreshold: number;
}

export const SKILLS: Skill[] = [
  {
    id: 'python',
    name: 'Python',
    description: 'Core Python programming, data structures, and algorithms',
    category: 'Programming',
    icon: '🐍',
    rounds: 3,
    questionsPerRound: 5,
    passThreshold: 70,
  },
  {
    id: 'java',
    name: 'Java',
    description: 'Object-oriented programming, JVM, and enterprise development',
    category: 'Programming',
    icon: '☕',
    rounds: 3,
    questionsPerRound: 5,
    passThreshold: 70,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    description: 'Modern JS, async patterns, and web APIs',
    category: 'Programming',
    icon: '📜',
    rounds: 3,
    questionsPerRound: 5,
    passThreshold: 70,
  },
  {
    id: 'react',
    name: 'React',
    description: 'Component architecture, hooks, and state management',
    category: 'Frontend',
    icon: '⚛️',
    rounds: 3,
    questionsPerRound: 5,
    passThreshold: 70,
  },
  {
    id: 'sql',
    name: 'SQL',
    description: 'Database queries, optimization, and schema design',
    category: 'Database',
    icon: '🗃️',
    rounds: 3,
    questionsPerRound: 5,
    passThreshold: 70,
  },
  {
    id: 'docker',
    name: 'Docker',
    description: 'Containerization, orchestration, and DevOps practices',
    category: 'DevOps',
    icon: '🐳',
    rounds: 3,
    questionsPerRound: 5,
    passThreshold: 70,
  },
  {
    id: 'dsa-arrays',
    name: 'DSA (Arrays)',
    description: 'Data structures and algorithms focused on arrays',
    category: 'Algorithms',
    icon: '🧮',
    rounds: 3,
    questionsPerRound: 5,
    passThreshold: 70,
  },
  {
    id: 'os',
    name: 'Operating Systems',
    description: 'Process management, memory, and file systems',
    category: 'Systems',
    icon: '💻',
    rounds: 3,
    questionsPerRound: 5,
    passThreshold: 70,
  },
];

export const ROUND_TYPES = {
  1: 'mcq' as const,
  2: 'coding' as const,
  3: 'proctored' as const,
};

export const ROUND_LABELS: Record<number, string> = {
  1: 'MCQ Assessment',
  2: 'Coding Problems',
  3: 'AI-Proctored Test',
};

export const ROUND_DESCRIPTIONS: Record<number, string> = {
  1: '5 multiple-choice questions, auto-graded. 70% to pass.',
  2: '2 coding problems with code editor, auto-graded. 70% to pass.',
  3: 'AI-proctored assessment with webcam monitoring. 70% to pass.',
};

export const ROUND_TIME_LIMITS: Record<number, number> = {
  1: 10 * 60,
  2: 20 * 60,
  3: 15 * 60,
};
