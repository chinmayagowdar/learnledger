import { Assessment, Question, Credential, User } from './store';
import { generateBlockchainHash } from './blockchain';

export const mockUser: User = {
  id: 'user-123',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  joinedAt: '2024-01-15',
  totalCredentials: 2,
  totalAssessments: 4,
};

export const mockAssessments: Assessment[] = [
  {
    id: 'react-advanced',
    title: 'React Advanced',
    description: 'Master advanced React patterns and hooks',
    difficulty: 'advanced',
    totalQuestions: 5,
    completionTime: 15,
    category: 'Frontend',
    status: 'completed',
    score: 92,
    completedAt: '2024-12-15T10:30:00Z',
  },
  {
    id: 'js-mastery',
    title: 'JavaScript Mastery',
    description: 'Deep dive into JavaScript fundamentals',
    difficulty: 'intermediate',
    totalQuestions: 5,
    completionTime: 20,
    category: 'Backend',
    status: 'completed',
    score: 88,
    completedAt: '2024-11-20T14:22:00Z',
  },
  {
    id: 'typescript-pro',
    title: 'TypeScript Pro',
    description: 'Advanced TypeScript patterns and types',
    difficulty: 'advanced',
    totalQuestions: 5,
    completionTime: 18,
    category: 'Frontend',
    status: 'in-progress',
  },
  {
    id: 'web-performance',
    title: 'Web Performance',
    description: 'Optimize web applications for speed',
    difficulty: 'intermediate',
    totalQuestions: 5,
    completionTime: 25,
    category: 'DevOps',
    status: 'pending',
  },
];

export const mockQuestions: Record<string, Question[]> = {
  'react-advanced': [
    {
      id: 'q1',
      question: 'What is the purpose of React.memo?',
      options: [
        'To memoize function results',
        'To prevent unnecessary re-renders of functional components',
        'To cache API responses',
        'To optimize bundle size',
      ],
      correctAnswer: 1,
      explanation: 'React.memo is a higher-order component that memoizes a functional component, preventing unnecessary re-renders when props haven\'t changed.',
    },
    {
      id: 'q2',
      question: 'Which hook would you use for side effects in functional components?',
      options: ['useState', 'useEffect', 'useContext', 'useReducer'],
      correctAnswer: 1,
      explanation: 'useEffect is the hook for handling side effects in functional components, replacing lifecycle methods from class components.',
    },
    {
      id: 'q3',
      question: 'What does the dependency array in useEffect control?',
      options: [
        'The return value of the effect',
        'When the effect runs',
        'The cleanup function',
        'Component rendering',
      ],
      correctAnswer: 1,
      explanation: 'The dependency array controls when the effect runs. An empty array means it runs once, and an array with values means it runs when those values change.',
    },
    {
      id: 'q4',
      question: 'How can you optimize list rendering in React?',
      options: [
        'Use map() without keys',
        'Use unique keys on list items',
        'Always use index as key',
        'Render all items at once',
      ],
      correctAnswer: 1,
      explanation: 'Using unique, stable keys on list items helps React identify which items have changed, improving performance and preventing bugs.',
    },
    {
      id: 'q5',
      question: 'What is a custom hook?',
      options: [
        'A built-in React hook',
        'A function that uses React hooks and returns state/logic',
        'A DOM manipulation library',
        'A CSS framework',
      ],
      correctAnswer: 1,
      explanation: 'A custom hook is a JavaScript function that uses React hooks internally to extract component logic into reusable functions.',
    },
  ],
  'js-mastery': [
    {
      id: 'q1',
      question: 'What is the difference between let and const?',
      options: [
        'let is for loops, const is for objects',
        'const cannot be reassigned, let can',
        'let has block scope, const is global',
        'They are identical',
      ],
      correctAnswer: 1,
      explanation: 'const variables cannot be reassigned after initialization, while let variables can be reassigned. Both have block scope.',
    },
    {
      id: 'q2',
      question: 'What does the spread operator do?',
      options: [
        'Creates a loop',
        'Spreads elements of an array or object',
        'Deletes elements',
        'Compresses data',
      ],
      correctAnswer: 1,
      explanation: 'The spread operator (...) spreads elements of an array or properties of an object into another array or object.',
    },
    {
      id: 'q3',
      question: 'What is a Promise?',
      options: [
        'A string value',
        'An object representing eventual completion of an async operation',
        'A function that returns a value',
        'An error type',
      ],
      correctAnswer: 1,
      explanation: 'A Promise is an object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value.',
    },
    {
      id: 'q4',
      question: 'What is async/await?',
      options: [
        'A new syntax for callbacks',
        'A way to write promises using synchronous-looking code',
        'A debugging tool',
        'A CSS property',
      ],
      correctAnswer: 1,
      explanation: 'async/await is syntactic sugar over promises that allows you to write asynchronous code in a synchronous-looking manner.',
    },
    {
      id: 'q5',
      question: 'What is destructuring?',
      options: [
        'Breaking something into pieces',
        'Extracting values from arrays or objects into variables',
        'Deleting array elements',
        'Creating new objects',
      ],
      correctAnswer: 1,
      explanation: 'Destructuring is a JavaScript feature that allows you to extract values from arrays or objects and assign them to variables in a concise way.',
    },
  ],
};

export const mockCredentials: Credential[] = [
  {
    id: 'cred-001',
    title: 'React Advanced',
    issuer: 'Tech Academy Pro',
    credentialId: 'REACT-ADV-20241215-001',
    blockchainHash: generateBlockchainHash({
      credentialId: 'REACT-ADV-20241215-001',
      userId: 'user-123',
      timestamp: '2024-12-15T10:30:00Z',
    }),
    date: '2024-12-15',
    assessmentId: 'react-advanced',
    score: 92,
    isVerified: true,
    views: 42,
    shareCount: 8,
  },
  {
    id: 'cred-002',
    title: 'JavaScript Mastery',
    issuer: 'Code Excellence',
    credentialId: 'JS-MSTR-20241120-002',
    blockchainHash: generateBlockchainHash({
      credentialId: 'JS-MSTR-20241120-002',
      userId: 'user-123',
      timestamp: '2024-11-20T14:22:00Z',
    }),
    date: '2024-11-20',
    assessmentId: 'js-mastery',
    score: 88,
    isVerified: true,
    views: 35,
    shareCount: 5,
  },
];
