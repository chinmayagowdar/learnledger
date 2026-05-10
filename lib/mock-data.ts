import { Assessment, Question, Credential, User } from './store';
import { generateBlockchainHash } from './blockchain';
import type { SkillId } from './skills';

export const mockUser: User = {
  id: 'user-123',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  joinedAt: '2024-01-15',
  totalCredentials: 4,
  totalAssessments: 6,
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

// Questions for each skill - Round 1 (MCQ) and Round 3 (Proctored MCQ)
export interface SkillQuestion extends Question {
  round: 1 | 3;
}

export const skillQuestions: Record<SkillId, SkillQuestion[]> = {
  python: [
    // Round 1 Questions
    {
      id: 'py-r1-q1',
      round: 1,
      question: 'What is the output of print(type([]))?',
      options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"],
      correctAnswer: 0,
      explanation: 'In Python, [] creates an empty list, so type([]) returns <class "list">.',
    },
    {
      id: 'py-r1-q2',
      round: 1,
      question: 'Which keyword is used to define a function in Python?',
      options: ['func', 'function', 'def', 'define'],
      correctAnswer: 2,
      explanation: 'The "def" keyword is used to define functions in Python.',
    },
    {
      id: 'py-r1-q3',
      round: 1,
      question: 'What does the "self" keyword represent in a Python class?',
      options: ['The class itself', 'The instance of the class', 'A static method', 'A module'],
      correctAnswer: 1,
      explanation: '"self" refers to the instance of the class, allowing access to instance attributes and methods.',
    },
    {
      id: 'py-r1-q4',
      round: 1,
      question: 'What is a list comprehension?',
      options: ['A way to loop', 'A concise way to create lists', 'A sorting algorithm', 'A data structure'],
      correctAnswer: 1,
      explanation: 'List comprehension is a concise way to create lists using a single line of code.',
    },
    {
      id: 'py-r1-q5',
      round: 1,
      question: 'How do you handle exceptions in Python?',
      options: ['if-else', 'try-except', 'catch-throw', 'handle-error'],
      correctAnswer: 1,
      explanation: 'Python uses try-except blocks to handle exceptions.',
    },
    // Round 3 Questions
    {
      id: 'py-r3-q1',
      round: 3,
      question: 'What is the difference between "is" and "==" in Python?',
      options: ['No difference', '"is" checks identity, "==" checks equality', '"==" checks identity, "is" checks equality', '"is" is for strings only'],
      correctAnswer: 1,
      explanation: '"is" checks if two objects are the same object in memory, while "==" checks if they have the same value.',
    },
    {
      id: 'py-r3-q2',
      round: 3,
      question: 'What is a decorator in Python?',
      options: ['A design pattern', 'A function that modifies another function', 'A class method', 'A loop construct'],
      correctAnswer: 1,
      explanation: 'A decorator is a function that takes another function and extends its behavior without modifying it.',
    },
    {
      id: 'py-r3-q3',
      round: 3,
      question: 'What does *args represent in a function?',
      options: ['Keyword arguments', 'Variable positional arguments', 'Required arguments', 'Default arguments'],
      correctAnswer: 1,
      explanation: '*args allows a function to accept any number of positional arguments as a tuple.',
    },
    {
      id: 'py-r3-q4',
      round: 3,
      question: 'What is a generator in Python?',
      options: ['A loop', 'A function that returns an iterator', 'A class', 'A module'],
      correctAnswer: 1,
      explanation: 'A generator is a function that uses yield to return values one at a time, creating an iterator.',
    },
    {
      id: 'py-r3-q5',
      round: 3,
      question: 'What is the Global Interpreter Lock (GIL)?',
      options: ['A security feature', 'A mutex that prevents multiple threads from executing Python bytecode simultaneously', 'A package manager', 'A debugging tool'],
      correctAnswer: 1,
      explanation: 'The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once.',
    },
  ],
  java: [
    // Round 1 Questions
    {
      id: 'java-r1-q1',
      round: 1,
      question: 'What is the main method signature in Java?',
      options: ['public void main()', 'public static void main(String[] args)', 'static main()', 'void main(String args)'],
      correctAnswer: 1,
      explanation: 'The correct main method signature is "public static void main(String[] args)".',
    },
    {
      id: 'java-r1-q2',
      round: 1,
      question: 'What is inheritance in Java?',
      options: ['Creating new classes', 'A class acquiring properties of another class', 'Method overloading', 'Interface implementation'],
      correctAnswer: 1,
      explanation: 'Inheritance is a mechanism where one class acquires the properties and behaviors of another class.',
    },
    {
      id: 'java-r1-q3',
      round: 1,
      question: 'Which keyword is used to prevent inheritance?',
      options: ['static', 'final', 'private', 'const'],
      correctAnswer: 1,
      explanation: 'The "final" keyword prevents a class from being inherited.',
    },
    {
      id: 'java-r1-q4',
      round: 1,
      question: 'What is an interface in Java?',
      options: ['A class', 'A blueprint of a class with abstract methods', 'A variable', 'A package'],
      correctAnswer: 1,
      explanation: 'An interface is a reference type that contains abstract methods that classes must implement.',
    },
    {
      id: 'java-r1-q5',
      round: 1,
      question: 'What is the difference between == and .equals()?',
      options: ['No difference', '== compares references, .equals() compares values', '== compares values, .equals() compares references', '== is faster'],
      correctAnswer: 1,
      explanation: '== compares object references, while .equals() compares the actual values of objects.',
    },
    // Round 3 Questions
    {
      id: 'java-r3-q1',
      round: 3,
      question: 'What is polymorphism in Java?',
      options: ['Multiple inheritance', 'One interface, multiple implementations', 'Code duplication', 'Static methods'],
      correctAnswer: 1,
      explanation: 'Polymorphism allows objects to be treated as instances of their parent class while maintaining their specific behaviors.',
    },
    {
      id: 'java-r3-q2',
      round: 3,
      question: 'What is the purpose of the "synchronized" keyword?',
      options: ['Improve performance', 'Prevent thread interference', 'Enable inheritance', 'Create constants'],
      correctAnswer: 1,
      explanation: '"synchronized" ensures that only one thread can access a block of code or method at a time.',
    },
    {
      id: 'java-r3-q3',
      round: 3,
      question: 'What is garbage collection in Java?',
      options: ['Deleting files', 'Automatic memory management', 'Error handling', 'Code optimization'],
      correctAnswer: 1,
      explanation: 'Garbage collection automatically frees memory by removing objects that are no longer referenced.',
    },
    {
      id: 'java-r3-q4',
      round: 3,
      question: 'What is an abstract class?',
      options: ['A class that cannot be instantiated', 'A class without methods', 'A final class', 'A static class'],
      correctAnswer: 0,
      explanation: 'An abstract class cannot be instantiated directly and may contain abstract methods.',
    },
    {
      id: 'java-r3-q5',
      round: 3,
      question: 'What is exception handling?',
      options: ['Ignoring errors', 'Managing runtime errors gracefully', 'Debugging code', 'Compiling code'],
      correctAnswer: 1,
      explanation: 'Exception handling allows programs to catch and manage runtime errors without crashing.',
    },
  ],
  javascript: [
    // Round 1 Questions
    {
      id: 'js-r1-q1',
      round: 1,
      question: 'What is the difference between let and const?',
      options: ['No difference', 'const cannot be reassigned', 'let is global', 'const is faster'],
      correctAnswer: 1,
      explanation: 'const variables cannot be reassigned after initialization, while let variables can.',
    },
    {
      id: 'js-r1-q2',
      round: 1,
      question: 'What is a closure?',
      options: ['A loop', 'A function with access to outer scope', 'An array method', 'A class'],
      correctAnswer: 1,
      explanation: 'A closure is a function that has access to variables from its outer scope even after the outer function has returned.',
    },
    {
      id: 'js-r1-q3',
      round: 1,
      question: 'What does the === operator do?',
      options: ['Assignment', 'Strict equality comparison', 'Loose equality', 'Type conversion'],
      correctAnswer: 1,
      explanation: '=== performs strict equality comparison without type coercion.',
    },
    {
      id: 'js-r1-q4',
      round: 1,
      question: 'What is the purpose of async/await?',
      options: ['Create loops', 'Handle asynchronous operations', 'Define classes', 'Import modules'],
      correctAnswer: 1,
      explanation: 'async/await provides a cleaner syntax for handling promises and asynchronous operations.',
    },
    {
      id: 'js-r1-q5',
      round: 1,
      question: 'What is the spread operator (...)?',
      options: ['Division', 'Expands arrays/objects', 'Comparison', 'Assignment'],
      correctAnswer: 1,
      explanation: 'The spread operator expands an iterable into individual elements.',
    },
    // Round 3 Questions
    {
      id: 'js-r3-q1',
      round: 3,
      question: 'What is the event loop in JavaScript?',
      options: ['A for loop', 'A mechanism for handling async operations', 'A UI component', 'A testing tool'],
      correctAnswer: 1,
      explanation: 'The event loop handles asynchronous callbacks and manages the execution of code in JavaScript.',
    },
    {
      id: 'js-r3-q2',
      round: 3,
      question: 'What is prototypal inheritance?',
      options: ['Class-based inheritance', 'Objects inheriting from other objects', 'Module pattern', 'Function composition'],
      correctAnswer: 1,
      explanation: 'Prototypal inheritance allows objects to inherit properties and methods from other objects.',
    },
    {
      id: 'js-r3-q3',
      round: 3,
      question: 'What is the purpose of "use strict"?',
      options: ['Improve performance', 'Enable stricter parsing and error handling', 'Define types', 'Create modules'],
      correctAnswer: 1,
      explanation: '"use strict" enables strict mode which catches common coding mistakes and unsafe actions.',
    },
    {
      id: 'js-r3-q4',
      round: 3,
      question: 'What is a Promise?',
      options: ['A loop', 'An object representing eventual completion of async operation', 'A class', 'A module'],
      correctAnswer: 1,
      explanation: 'A Promise represents the eventual completion or failure of an asynchronous operation.',
    },
    {
      id: 'js-r3-q5',
      round: 3,
      question: 'What is hoisting?',
      options: ['Moving code', 'Variables/functions moved to top of scope', 'Error handling', 'Module loading'],
      correctAnswer: 1,
      explanation: 'Hoisting is JavaScript behavior where variable and function declarations are moved to the top of their scope.',
    },
  ],
  react: [
    // Round 1 Questions
    {
      id: 'react-r1-q1',
      round: 1,
      question: 'What is the purpose of React.memo?',
      options: ['Memoize functions', 'Prevent unnecessary re-renders', 'Cache API responses', 'Optimize bundle size'],
      correctAnswer: 1,
      explanation: 'React.memo memoizes a functional component, preventing re-renders when props have not changed.',
    },
    {
      id: 'react-r1-q2',
      round: 1,
      question: 'Which hook is used for side effects?',
      options: ['useState', 'useEffect', 'useContext', 'useReducer'],
      correctAnswer: 1,
      explanation: 'useEffect is used to handle side effects like data fetching, subscriptions, and DOM manipulation.',
    },
    {
      id: 'react-r1-q3',
      round: 1,
      question: 'What is the Virtual DOM?',
      options: ['A database', 'A lightweight copy of the actual DOM', 'A testing tool', 'A routing system'],
      correctAnswer: 1,
      explanation: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM for efficient updates.',
    },
    {
      id: 'react-r1-q4',
      round: 1,
      question: 'What are React hooks?',
      options: ['CSS styles', 'Functions that let you use state in functional components', 'Event handlers', 'API calls'],
      correctAnswer: 1,
      explanation: 'Hooks are functions that let you use React features like state and lifecycle in functional components.',
    },
    {
      id: 'react-r1-q5',
      round: 1,
      question: 'What is JSX?',
      options: ['A database', 'A syntax extension for JavaScript', 'A CSS framework', 'A testing library'],
      correctAnswer: 1,
      explanation: 'JSX is a syntax extension that allows you to write HTML-like code in JavaScript.',
    },
    // Round 3 Questions
    {
      id: 'react-r3-q1',
      round: 3,
      question: 'What is the useCallback hook used for?',
      options: ['Managing state', 'Memoizing callback functions', 'Creating effects', 'Handling context'],
      correctAnswer: 1,
      explanation: 'useCallback returns a memoized version of a callback function to prevent unnecessary re-renders.',
    },
    {
      id: 'react-r3-q2',
      round: 3,
      question: 'What is React Context?',
      options: ['A routing system', 'A way to pass data through component tree', 'A testing framework', 'A build tool'],
      correctAnswer: 1,
      explanation: 'Context provides a way to pass data through the component tree without prop drilling.',
    },
    {
      id: 'react-r3-q3',
      round: 3,
      question: 'What is the purpose of keys in React lists?',
      options: ['Styling', 'Help React identify which items changed', 'Create loops', 'Handle events'],
      correctAnswer: 1,
      explanation: 'Keys help React identify which items have changed, been added, or removed in lists.',
    },
    {
      id: 'react-r3-q4',
      round: 3,
      question: 'What is a controlled component?',
      options: ['A styled component', 'A component whose state is controlled by React', 'A class component', 'A HOC'],
      correctAnswer: 1,
      explanation: 'A controlled component has its form element values controlled by React state.',
    },
    {
      id: 'react-r3-q5',
      round: 3,
      question: 'What is the useMemo hook?',
      options: ['For state', 'For memoizing expensive calculations', 'For effects', 'For refs'],
      correctAnswer: 1,
      explanation: 'useMemo memoizes the result of an expensive calculation to prevent unnecessary recalculations.',
    },
  ],
  sql: [
    // Round 1 Questions
    {
      id: 'sql-r1-q1',
      round: 1,
      question: 'What does SQL stand for?',
      options: ['Standard Query Language', 'Structured Query Language', 'Simple Query Language', 'System Query Language'],
      correctAnswer: 1,
      explanation: 'SQL stands for Structured Query Language.',
    },
    {
      id: 'sql-r1-q2',
      round: 1,
      question: 'Which clause is used to filter records?',
      options: ['SELECT', 'WHERE', 'FROM', 'ORDER BY'],
      correctAnswer: 1,
      explanation: 'The WHERE clause is used to filter records based on conditions.',
    },
    {
      id: 'sql-r1-q3',
      round: 1,
      question: 'What is a PRIMARY KEY?',
      options: ['A foreign key', 'A unique identifier for each record', 'An index', 'A constraint'],
      correctAnswer: 1,
      explanation: 'A PRIMARY KEY is a unique identifier for each record in a table.',
    },
    {
      id: 'sql-r1-q4',
      round: 1,
      question: 'What does JOIN do?',
      options: ['Deletes data', 'Combines rows from multiple tables', 'Creates tables', 'Updates records'],
      correctAnswer: 1,
      explanation: 'JOIN combines rows from two or more tables based on a related column.',
    },
    {
      id: 'sql-r1-q5',
      round: 1,
      question: 'What is the difference between DELETE and TRUNCATE?',
      options: ['No difference', 'DELETE can use WHERE, TRUNCATE removes all', 'TRUNCATE is slower', 'DELETE is faster'],
      correctAnswer: 1,
      explanation: 'DELETE removes specific rows with conditions, TRUNCATE removes all rows quickly.',
    },
    // Round 3 Questions
    {
      id: 'sql-r3-q1',
      round: 3,
      question: 'What is normalization?',
      options: ['Data encryption', 'Organizing data to reduce redundancy', 'Indexing', 'Backup'],
      correctAnswer: 1,
      explanation: 'Normalization organizes database tables to minimize data redundancy.',
    },
    {
      id: 'sql-r3-q2',
      round: 3,
      question: 'What is an INDEX used for?',
      options: ['Storing data', 'Speeding up query execution', 'Creating backups', 'Encryption'],
      correctAnswer: 1,
      explanation: 'An INDEX improves the speed of data retrieval operations.',
    },
    {
      id: 'sql-r3-q3',
      round: 3,
      question: 'What is a FOREIGN KEY?',
      options: ['A primary key', 'A key that links two tables', 'An index', 'A constraint'],
      correctAnswer: 1,
      explanation: 'A FOREIGN KEY is a column that references the PRIMARY KEY of another table.',
    },
    {
      id: 'sql-r3-q4',
      round: 3,
      question: 'What does GROUP BY do?',
      options: ['Sorts data', 'Groups rows with same values', 'Filters data', 'Joins tables'],
      correctAnswer: 1,
      explanation: 'GROUP BY groups rows that have the same values in specified columns.',
    },
    {
      id: 'sql-r3-q5',
      round: 3,
      question: 'What is a subquery?',
      options: ['A main query', 'A query nested inside another query', 'A view', 'A procedure'],
      correctAnswer: 1,
      explanation: 'A subquery is a query nested inside another SQL query.',
    },
  ],
  docker: [
    // Round 1 Questions
    {
      id: 'docker-r1-q1',
      round: 1,
      question: 'What is a Docker container?',
      options: ['A virtual machine', 'A lightweight isolated environment', 'A database', 'A network'],
      correctAnswer: 1,
      explanation: 'A container is a lightweight, isolated environment for running applications.',
    },
    {
      id: 'docker-r1-q2',
      round: 1,
      question: 'What is a Dockerfile?',
      options: ['A log file', 'A text file with instructions to build an image', 'A configuration file', 'A script'],
      correctAnswer: 1,
      explanation: 'A Dockerfile contains instructions for building a Docker image.',
    },
    {
      id: 'docker-r1-q3',
      round: 1,
      question: 'What is a Docker image?',
      options: ['A running container', 'A read-only template for containers', 'A volume', 'A network'],
      correctAnswer: 1,
      explanation: 'A Docker image is a read-only template used to create containers.',
    },
    {
      id: 'docker-r1-q4',
      round: 1,
      question: 'What command starts a container?',
      options: ['docker build', 'docker run', 'docker create', 'docker start'],
      correctAnswer: 1,
      explanation: 'The "docker run" command creates and starts a container from an image.',
    },
    {
      id: 'docker-r1-q5',
      round: 1,
      question: 'What is Docker Compose?',
      options: ['An image', 'A tool for defining multi-container apps', 'A network', 'A volume'],
      correctAnswer: 1,
      explanation: 'Docker Compose is a tool for defining and running multi-container applications.',
    },
    // Round 3 Questions
    {
      id: 'docker-r3-q1',
      round: 3,
      question: 'What is a Docker volume?',
      options: ['A container', 'Persistent storage for containers', 'An image layer', 'A network'],
      correctAnswer: 1,
      explanation: 'A volume provides persistent storage that survives container restarts.',
    },
    {
      id: 'docker-r3-q2',
      round: 3,
      question: 'What is container orchestration?',
      options: ['Building images', 'Managing container lifecycle at scale', 'Networking', 'Logging'],
      correctAnswer: 1,
      explanation: 'Container orchestration automates deployment, scaling, and management of containers.',
    },
    {
      id: 'docker-r3-q3',
      round: 3,
      question: 'What is a Docker network?',
      options: ['A volume', 'Communication layer between containers', 'An image', 'A Dockerfile'],
      correctAnswer: 1,
      explanation: 'Docker networks allow containers to communicate with each other.',
    },
    {
      id: 'docker-r3-q4',
      round: 3,
      question: 'What does the EXPOSE instruction do?',
      options: ['Opens a port', 'Documents which ports are intended to be published', 'Creates a network', 'Builds an image'],
      correctAnswer: 1,
      explanation: 'EXPOSE documents which ports the container listens on (does not actually publish them).',
    },
    {
      id: 'docker-r3-q5',
      round: 3,
      question: 'What is a multi-stage build?',
      options: ['Building multiple images', 'Using multiple FROM statements to optimize image size', 'Parallel builds', 'Caching'],
      correctAnswer: 1,
      explanation: 'Multi-stage builds use multiple FROM statements to create smaller, optimized images.',
    },
  ],
  dsa: [
    // Round 1 Questions
    {
      id: 'dsa-r1-q1',
      round: 1,
      question: 'What is the time complexity of accessing an array element by index?',
      options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
      correctAnswer: 1,
      explanation: 'Array access by index is O(1) because elements are stored in contiguous memory.',
    },
    {
      id: 'dsa-r1-q2',
      round: 1,
      question: 'What is Big O notation?',
      options: ['A data structure', 'A way to describe algorithm efficiency', 'A programming language', 'A sorting algorithm'],
      correctAnswer: 1,
      explanation: 'Big O notation describes the upper bound of an algorithm time or space complexity.',
    },
    {
      id: 'dsa-r1-q3',
      round: 1,
      question: 'What is the time complexity of linear search?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
      correctAnswer: 1,
      explanation: 'Linear search checks each element one by one, giving O(n) complexity.',
    },
    {
      id: 'dsa-r1-q4',
      round: 1,
      question: 'What is a two-pointer technique?',
      options: ['A sorting algorithm', 'Using two indices to traverse an array', 'A data structure', 'A search method'],
      correctAnswer: 1,
      explanation: 'Two-pointer technique uses two indices moving through an array to solve problems efficiently.',
    },
    {
      id: 'dsa-r1-q5',
      round: 1,
      question: 'What is the space complexity of an in-place algorithm?',
      options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
      correctAnswer: 1,
      explanation: 'In-place algorithms use constant extra space, O(1).',
    },
    // Round 3 Questions
    {
      id: 'dsa-r3-q1',
      round: 3,
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
      correctAnswer: 1,
      explanation: 'Binary search halves the search space each step, giving O(log n) complexity.',
    },
    {
      id: 'dsa-r3-q2',
      round: 3,
      question: 'What is the sliding window technique?',
      options: ['A data structure', 'A method to process subarrays/substrings', 'A sorting algorithm', 'A search method'],
      correctAnswer: 1,
      explanation: 'Sliding window maintains a window that slides across data to process subarrays efficiently.',
    },
    {
      id: 'dsa-r3-q3',
      round: 3,
      question: 'What is the best case time complexity of Quick Sort?',
      options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
      correctAnswer: 1,
      explanation: 'Quick Sort has O(n log n) best and average case when pivots divide evenly.',
    },
    {
      id: 'dsa-r3-q4',
      round: 3,
      question: 'What is a prefix sum array?',
      options: ['A sorted array', 'An array where each element is sum of all previous', 'A rotated array', 'A matrix'],
      correctAnswer: 1,
      explanation: 'Prefix sum array stores cumulative sums for efficient range queries.',
    },
    {
      id: 'dsa-r3-q5',
      round: 3,
      question: 'What is the Dutch National Flag algorithm used for?',
      options: ['Searching', 'Sorting an array with 3 distinct values', 'Graph traversal', 'String matching'],
      correctAnswer: 1,
      explanation: 'Dutch National Flag algorithm sorts arrays with three distinct values in O(n) time.',
    },
  ],
  os: [
    // Round 1 Questions
    {
      id: 'os-r1-q1',
      round: 1,
      question: 'What is an operating system?',
      options: ['A compiler', 'Software that manages hardware and software resources', 'A database', 'A network protocol'],
      correctAnswer: 1,
      explanation: 'An OS manages computer hardware and software resources and provides services.',
    },
    {
      id: 'os-r1-q2',
      round: 1,
      question: 'What is a process?',
      options: ['A file', 'A program in execution', 'A thread', 'A CPU'],
      correctAnswer: 1,
      explanation: 'A process is an instance of a program that is being executed.',
    },
    {
      id: 'os-r1-q3',
      round: 1,
      question: 'What is virtual memory?',
      options: ['RAM', 'A technique to use disk as extension of RAM', 'Cache', 'Register'],
      correctAnswer: 1,
      explanation: 'Virtual memory uses disk space to extend available memory beyond physical RAM.',
    },
    {
      id: 'os-r1-q4',
      round: 1,
      question: 'What is a thread?',
      options: ['A process', 'A lightweight unit of execution within a process', 'A file', 'A memory segment'],
      correctAnswer: 1,
      explanation: 'A thread is the smallest unit of execution that can be scheduled by the OS.',
    },
    {
      id: 'os-r1-q5',
      round: 1,
      question: 'What is CPU scheduling?',
      options: ['Memory management', 'Deciding which process gets CPU time', 'File management', 'Networking'],
      correctAnswer: 1,
      explanation: 'CPU scheduling determines which process runs at any given time.',
    },
    // Round 3 Questions
    {
      id: 'os-r3-q1',
      round: 3,
      question: 'What is a deadlock?',
      options: ['A fast process', 'Processes waiting indefinitely for resources held by each other', 'Memory leak', 'CPU overload'],
      correctAnswer: 1,
      explanation: 'Deadlock occurs when processes are blocked waiting for resources held by each other.',
    },
    {
      id: 'os-r3-q2',
      round: 3,
      question: 'What is paging?',
      options: ['File system', 'Memory management scheme dividing memory into fixed-size blocks', 'Networking', 'Scheduling'],
      correctAnswer: 1,
      explanation: 'Paging divides memory into fixed-size pages to manage memory efficiently.',
    },
    {
      id: 'os-r3-q3',
      round: 3,
      question: 'What is a context switch?',
      options: ['Changing users', 'Saving and restoring process state', 'Memory allocation', 'File transfer'],
      correctAnswer: 1,
      explanation: 'Context switch saves the state of one process and loads another process state.',
    },
    {
      id: 'os-r3-q4',
      round: 3,
      question: 'What is a semaphore?',
      options: ['A process', 'A synchronization primitive', 'A memory unit', 'A file type'],
      correctAnswer: 1,
      explanation: 'A semaphore is a variable used to control access to shared resources.',
    },
    {
      id: 'os-r3-q5',
      round: 3,
      question: 'What is thrashing?',
      options: ['Fast processing', 'Excessive paging causing performance degradation', 'Memory leak', 'CPU optimization'],
      correctAnswer: 1,
      explanation: 'Thrashing occurs when the system spends more time paging than executing.',
    },
  ],
};

// Coding problems for Round 2
export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode: Record<string, string>;
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }>;
  hints: string[];
}

export const codingProblems: Record<SkillId, CodingProblem[]> = {
  python: [
    {
      id: 'py-code-1',
      title: 'Two Sum',
      description: 'Given an array of integers and a target, return indices of the two numbers that add up to the target.',
      difficulty: 'easy',
      starterCode: {
        python: 'def two_sum(nums, target):\n    # Your code here\n    pass',
      },
      testCases: [
        { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' },
        { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]' },
        { input: '[3, 3], 6', expectedOutput: '[0, 1]', isHidden: true },
      ],
      hints: ['Use a dictionary to store seen values', 'Check if complement exists'],
    },
    {
      id: 'py-code-2',
      title: 'Palindrome Check',
      description: 'Write a function to check if a string is a palindrome (reads same forwards and backwards).',
      difficulty: 'easy',
      starterCode: {
        python: 'def is_palindrome(s):\n    # Your code here\n    pass',
      },
      testCases: [
        { input: '"racecar"', expectedOutput: 'True' },
        { input: '"hello"', expectedOutput: 'False' },
        { input: '"A man a plan a canal Panama"', expectedOutput: 'True', isHidden: true },
      ],
      hints: ['Consider case sensitivity', 'Ignore non-alphanumeric characters'],
    },
  ],
  java: [
    {
      id: 'java-code-1',
      title: 'Reverse Array',
      description: 'Write a function to reverse an integer array in place.',
      difficulty: 'easy',
      starterCode: {
        java: 'public static void reverseArray(int[] arr) {\n    // Your code here\n}',
      },
      testCases: [
        { input: '[1, 2, 3, 4, 5]', expectedOutput: '[5, 4, 3, 2, 1]' },
        { input: '[1, 2]', expectedOutput: '[2, 1]' },
      ],
      hints: ['Use two pointers from start and end', 'Swap elements'],
    },
    {
      id: 'java-code-2',
      title: 'Find Maximum',
      description: 'Write a function to find the maximum element in an array.',
      difficulty: 'easy',
      starterCode: {
        java: 'public static int findMax(int[] arr) {\n    // Your code here\n    return 0;\n}',
      },
      testCases: [
        { input: '[3, 7, 2, 9, 1]', expectedOutput: '9' },
        { input: '[-1, -5, -2]', expectedOutput: '-1' },
      ],
      hints: ['Initialize max with first element', 'Iterate and compare'],
    },
  ],
  javascript: [
    {
      id: 'js-code-1',
      title: 'FizzBuzz',
      description: 'Print numbers 1 to n. For multiples of 3 print "Fizz", for 5 print "Buzz", for both print "FizzBuzz".',
      difficulty: 'easy',
      starterCode: {
        javascript: 'function fizzBuzz(n) {\n  // Your code here\n  return [];\n}',
      },
      testCases: [
        { input: '15', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' },
        { input: '5', expectedOutput: '["1","2","Fizz","4","Buzz"]' },
      ],
      hints: ['Check divisibility by 15 first', 'Use modulo operator'],
    },
    {
      id: 'js-code-2',
      title: 'Remove Duplicates',
      description: 'Write a function to remove duplicate values from an array.',
      difficulty: 'easy',
      starterCode: {
        javascript: 'function removeDuplicates(arr) {\n  // Your code here\n  return [];\n}',
      },
      testCases: [
        { input: '[1, 2, 2, 3, 4, 4, 5]', expectedOutput: '[1, 2, 3, 4, 5]' },
        { input: '[1, 1, 1]', expectedOutput: '[1]' },
      ],
      hints: ['Use Set', 'Or use filter with indexOf'],
    },
  ],
  react: [
    {
      id: 'react-code-1',
      title: 'Counter Component',
      description: 'Create a counter component with increment and decrement buttons.',
      difficulty: 'easy',
      starterCode: {
        javascript: 'function Counter() {\n  // Use useState hook\n  // Return JSX with count display and buttons\n  return null;\n}',
      },
      testCases: [
        { input: 'initial render', expectedOutput: 'Count: 0' },
        { input: 'after increment', expectedOutput: 'Count: 1' },
      ],
      hints: ['Use useState hook', 'Create onClick handlers'],
    },
    {
      id: 'react-code-2',
      title: 'Toggle Component',
      description: 'Create a toggle component that shows/hides content.',
      difficulty: 'easy',
      starterCode: {
        javascript: 'function Toggle({ children }) {\n  // Use useState for visibility\n  // Toggle button and conditional rendering\n  return null;\n}',
      },
      testCases: [
        { input: 'initial', expectedOutput: 'Content hidden' },
        { input: 'after toggle', expectedOutput: 'Content visible' },
      ],
      hints: ['Use boolean state', 'Conditional rendering with &&'],
    },
  ],
  sql: [
    {
      id: 'sql-code-1',
      title: 'Select with Condition',
      description: 'Write a query to select all employees with salary greater than 50000.',
      difficulty: 'easy',
      starterCode: {
        sql: '-- Write your SQL query here\n-- Table: employees (id, name, salary, department)',
      },
      testCases: [
        { input: 'employees table', expectedOutput: 'Employees with salary > 50000' },
      ],
      hints: ['Use WHERE clause', 'Use > operator'],
    },
    {
      id: 'sql-code-2',
      title: 'Join Tables',
      description: 'Write a query to join employees and departments tables to show employee names with department names.',
      difficulty: 'medium',
      starterCode: {
        sql: '-- Write your SQL query here\n-- Tables: employees (id, name, dept_id), departments (id, dept_name)',
      },
      testCases: [
        { input: 'joined tables', expectedOutput: 'Employee names with department names' },
      ],
      hints: ['Use INNER JOIN', 'Match on dept_id and id'],
    },
  ],
  docker: [
    {
      id: 'docker-code-1',
      title: 'Basic Dockerfile',
      description: 'Write a Dockerfile for a Node.js application.',
      difficulty: 'easy',
      starterCode: {
        dockerfile: '# Write your Dockerfile here',
      },
      testCases: [
        { input: 'Node.js app', expectedOutput: 'Working container' },
      ],
      hints: ['Start with FROM node', 'Use COPY and RUN commands'],
    },
    {
      id: 'docker-code-2',
      title: 'Docker Compose',
      description: 'Write a docker-compose.yml for a web app with a database.',
      difficulty: 'medium',
      starterCode: {
        yaml: '# Write your docker-compose.yml here',
      },
      testCases: [
        { input: 'web + db', expectedOutput: 'Multi-container setup' },
      ],
      hints: ['Define services', 'Use depends_on for ordering'],
    },
  ],
  dsa: [
    {
      id: 'dsa-code-1',
      title: 'Binary Search',
      description: 'Implement binary search to find a target in a sorted array. Return -1 if not found.',
      difficulty: 'easy',
      starterCode: {
        python: 'def binary_search(arr, target):\n    # Your code here\n    return -1',
        javascript: 'function binarySearch(arr, target) {\n  // Your code here\n  return -1;\n}',
      },
      testCases: [
        { input: '[1, 2, 3, 4, 5], 3', expectedOutput: '2' },
        { input: '[1, 2, 3, 4, 5], 6', expectedOutput: '-1' },
      ],
      hints: ['Use two pointers (left, right)', 'Compare with middle element'],
    },
    {
      id: 'dsa-code-2',
      title: 'Maximum Subarray Sum',
      description: "Find the contiguous subarray with the largest sum (Kadane's algorithm).",
      difficulty: 'medium',
      starterCode: {
        python: 'def max_subarray_sum(arr):\n    # Your code here\n    return 0',
        javascript: 'function maxSubarraySum(arr) {\n  // Your code here\n  return 0;\n}',
      },
      testCases: [
        { input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', expectedOutput: '6' },
        { input: '[1]', expectedOutput: '1' },
      ],
      hints: ['Track current sum and max sum', "Reset current sum if it goes negative"],
    },
  ],
  os: [
    {
      id: 'os-code-1',
      title: 'Process Scheduling - FCFS',
      description: 'Implement First Come First Serve scheduling. Return average waiting time.',
      difficulty: 'medium',
      starterCode: {
        python: 'def fcfs_scheduling(processes):\n    # processes: list of (arrival_time, burst_time)\n    # Return average waiting time\n    return 0.0',
      },
      testCases: [
        { input: '[(0, 5), (1, 3), (2, 8)]', expectedOutput: '5.0' },
      ],
      hints: ['Process in order of arrival', 'Waiting time = start time - arrival time'],
    },
    {
      id: 'os-code-2',
      title: "Banker's Algorithm",
      description: "Implement the Banker's algorithm to check if a system is in a safe state.",
      difficulty: 'hard',
      starterCode: {
        python: 'def is_safe_state(available, max_need, allocation):\n    # Return True if safe state exists\n    return False',
      },
      testCases: [
        { input: 'safe state scenario', expectedOutput: 'True' },
        { input: 'unsafe state scenario', expectedOutput: 'False' },
      ],
      hints: ['Find a safe sequence', 'Simulate resource allocation'],
    },
  ],
};

// Legacy mock questions for existing assessments
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

// Helper function to get questions for a skill and round
export function getSkillQuestionsForRound(skillId: SkillId, round: 1 | 3): Question[] {
  const questions = skillQuestions[skillId] || [];
  return questions
    .filter((q) => q.round === round)
    .map(({ round: _round, ...rest }) => rest);
}

// Helper function to get coding problems for a skill
export function getCodingProblemsForSkill(skillId: SkillId): CodingProblem[] {
  return codingProblems[skillId] || [];
}
