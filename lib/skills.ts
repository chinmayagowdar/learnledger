import type { LucideIcon } from 'lucide-react';
import {
  Code2,
  Coffee,
  Braces,
  Atom,
  Database,
  Container,
  Network,
  Cpu,
} from 'lucide-react';

export type SkillId = 'python' | 'java' | 'javascript' | 'react' | 'sql' | 'docker' | 'dsa' | 'os';

export type RoundType = 'mcq' | 'coding' | 'proctored';

export interface RoundConfig {
  type: RoundType;
  questionCount?: number;
  problemCount?: number;
  passingScore: number;
  timeLimit: number; // in minutes
  title: string;
  description: string;
}

export interface Skill {
  id: SkillId;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  rounds: {
    1: RoundConfig;
    2: RoundConfig;
    3: RoundConfig;
  };
}

export const SKILLS: Record<SkillId, Skill> = {
  python: {
    id: 'python',
    name: 'Python',
    icon: Code2,
    description: 'Core Python programming concepts and syntax',
    color: 'from-yellow-500 to-blue-600',
    rounds: {
      1: {
        type: 'mcq',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 10,
        title: 'Python Fundamentals',
        description: 'Test your knowledge of Python basics, data types, and control flow',
      },
      2: {
        type: 'coding',
        problemCount: 2,
        passingScore: 60,
        timeLimit: 20,
        title: 'Python Coding Challenge',
        description: 'Solve Python programming problems with code execution',
      },
      3: {
        type: 'proctored',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 15,
        title: 'Proctored Assessment',
        description: 'Camera-monitored comprehensive assessment',
      },
    },
  },
  java: {
    id: 'java',
    name: 'Java',
    icon: Coffee,
    description: 'Object-oriented programming with Java',
    color: 'from-red-500 to-orange-600',
    rounds: {
      1: {
        type: 'mcq',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 10,
        title: 'Java Fundamentals',
        description: 'Test your knowledge of Java OOP, classes, and inheritance',
      },
      2: {
        type: 'coding',
        problemCount: 2,
        passingScore: 60,
        timeLimit: 20,
        title: 'Java Coding Challenge',
        description: 'Solve Java programming problems with code execution',
      },
      3: {
        type: 'proctored',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 15,
        title: 'Proctored Assessment',
        description: 'Camera-monitored comprehensive assessment',
      },
    },
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    icon: Braces,
    description: 'Modern JavaScript and ES6+ features',
    color: 'from-yellow-400 to-yellow-600',
    rounds: {
      1: {
        type: 'mcq',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 10,
        title: 'JavaScript Fundamentals',
        description: 'Test your knowledge of JS syntax, closures, and async patterns',
      },
      2: {
        type: 'coding',
        problemCount: 2,
        passingScore: 60,
        timeLimit: 20,
        title: 'JavaScript Coding Challenge',
        description: 'Solve JavaScript programming problems with code execution',
      },
      3: {
        type: 'proctored',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 15,
        title: 'Proctored Assessment',
        description: 'Camera-monitored comprehensive assessment',
      },
    },
  },
  react: {
    id: 'react',
    name: 'React',
    icon: Atom,
    description: 'React library and component architecture',
    color: 'from-cyan-400 to-blue-500',
    rounds: {
      1: {
        type: 'mcq',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 10,
        title: 'React Fundamentals',
        description: 'Test your knowledge of React hooks, state, and lifecycle',
      },
      2: {
        type: 'coding',
        problemCount: 2,
        passingScore: 60,
        timeLimit: 20,
        title: 'React Coding Challenge',
        description: 'Build React components and solve problems',
      },
      3: {
        type: 'proctored',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 15,
        title: 'Proctored Assessment',
        description: 'Camera-monitored comprehensive assessment',
      },
    },
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    icon: Database,
    description: 'Database queries and management',
    color: 'from-blue-500 to-indigo-600',
    rounds: {
      1: {
        type: 'mcq',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 10,
        title: 'SQL Fundamentals',
        description: 'Test your knowledge of SQL queries, joins, and indexes',
      },
      2: {
        type: 'coding',
        problemCount: 2,
        passingScore: 60,
        timeLimit: 20,
        title: 'SQL Query Challenge',
        description: 'Write SQL queries to solve database problems',
      },
      3: {
        type: 'proctored',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 15,
        title: 'Proctored Assessment',
        description: 'Camera-monitored comprehensive assessment',
      },
    },
  },
  docker: {
    id: 'docker',
    name: 'Docker',
    icon: Container,
    description: 'Containerization and Docker basics',
    color: 'from-blue-400 to-cyan-500',
    rounds: {
      1: {
        type: 'mcq',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 10,
        title: 'Docker Fundamentals',
        description: 'Test your knowledge of containers, images, and Dockerfiles',
      },
      2: {
        type: 'coding',
        problemCount: 2,
        passingScore: 60,
        timeLimit: 20,
        title: 'Docker Configuration Challenge',
        description: 'Write Dockerfiles and compose configurations',
      },
      3: {
        type: 'proctored',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 15,
        title: 'Proctored Assessment',
        description: 'Camera-monitored comprehensive assessment',
      },
    },
  },
  dsa: {
    id: 'dsa',
    name: 'DSA (Arrays)',
    icon: Network,
    description: 'Data structures and algorithms with arrays',
    color: 'from-purple-500 to-pink-500',
    rounds: {
      1: {
        type: 'mcq',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 10,
        title: 'DSA Fundamentals',
        description: 'Test your knowledge of array algorithms and complexity',
      },
      2: {
        type: 'coding',
        problemCount: 2,
        passingScore: 60,
        timeLimit: 20,
        title: 'Algorithm Coding Challenge',
        description: 'Implement array-based algorithms',
      },
      3: {
        type: 'proctored',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 15,
        title: 'Proctored Assessment',
        description: 'Camera-monitored comprehensive assessment',
      },
    },
  },
  os: {
    id: 'os',
    name: 'Operating Systems',
    icon: Cpu,
    description: 'Operating system concepts and processes',
    color: 'from-gray-600 to-slate-700',
    rounds: {
      1: {
        type: 'mcq',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 10,
        title: 'OS Fundamentals',
        description: 'Test your knowledge of processes, memory, and scheduling',
      },
      2: {
        type: 'coding',
        problemCount: 2,
        passingScore: 60,
        timeLimit: 20,
        title: 'OS Concepts Challenge',
        description: 'Solve problems related to OS concepts',
      },
      3: {
        type: 'proctored',
        questionCount: 5,
        passingScore: 70,
        timeLimit: 15,
        title: 'Proctored Assessment',
        description: 'Camera-monitored comprehensive assessment',
      },
    },
  },
};

export const SKILL_LIST = Object.values(SKILLS);

export function getSkillById(id: string): Skill | undefined {
  return SKILLS[id as SkillId];
}

export function getRoundConfig(skillId: SkillId, roundNumber: 1 | 2 | 3): RoundConfig {
  return SKILLS[skillId].rounds[roundNumber];
}

export function isRoundUnlocked(
  completedRounds: number[],
  roundNumber: number
): boolean {
  if (roundNumber === 1) return true;
  return completedRounds.includes(roundNumber - 1);
}

export function getAllRoundsCompleted(completedRounds: number[]): boolean {
  return [1, 2, 3].every((r) => completedRounds.includes(r));
}
