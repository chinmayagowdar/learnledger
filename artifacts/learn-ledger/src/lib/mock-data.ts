import { Assessment, Question, Credential, User } from './store';
import { generateBlockchainHash } from './blockchain';

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
    totalQuestions: 15,
    completionTime: 30,
    category: 'Frontend',
    status: 'completed',
    score: 92,
    completedAt: '2024-12-15T10:30:00Z',
  },
  {
    id: 'js-mastery',
    title: 'JavaScript Mastery',
    description: 'Deep dive into JavaScript fundamentals and engine internals',
    difficulty: 'intermediate',
    totalQuestions: 15,
    completionTime: 35,
    category: 'Backend',
    status: 'completed',
    score: 88,
    completedAt: '2024-11-20T14:22:00Z',
  },
  {
    id: 'typescript-pro',
    title: 'TypeScript Pro',
    description: 'Advanced TypeScript patterns and type system mastery',
    difficulty: 'advanced',
    totalQuestions: 15,
    completionTime: 35,
    category: 'Frontend',
    status: 'in-progress',
  },
  {
    id: 'web-performance',
    title: 'Web Performance',
    description: 'Optimize web applications for speed and Core Web Vitals',
    difficulty: 'intermediate',
    totalQuestions: 15,
    completionTime: 40,
    category: 'DevOps',
    status: 'pending',
  },
];

// ─────────────────────────────────────────────────────────────
// 3 rounds × 5 questions per assessment.
// Round 1 = Intermediate, Round 2 = Advanced, Round 3 = Expert
// ─────────────────────────────────────────────────────────────

export type RoundKey = 1 | 2 | 3;

export const mockQuestionsByRound: Record<string, Record<RoundKey, Question[]>> = {

  // ══════════════════════════════════════════════════════════
  // REACT ADVANCED
  // ══════════════════════════════════════════════════════════
  'react-advanced': {
    1: [
      {
        id: 'ra-1-1',
        question: 'What is the primary purpose of React.memo?',
        options: [
          'Cache the return value of an expensive function',
          'Prevent unnecessary re-renders of a functional component when its props have not changed',
          'Memoize DOM nodes to avoid re-mounting',
          'Enable server-side rendering for functional components',
        ],
        correctAnswer: 1,
        explanation: 'React.memo is a higher-order component that shallowly compares previous and next props. If they are equal, it skips re-rendering the wrapped component.',
      },
      {
        id: 'ra-1-2',
        question: 'Which hook should you use to run a function after every render that depends on a specific variable?',
        options: [
          'useLayoutEffect with an empty array',
          'useEffect with that variable in the dependency array',
          'useMemo with the variable as the only dependency',
          'useCallback with no dependencies',
        ],
        correctAnswer: 1,
        explanation: 'useEffect re-runs whenever any value in its dependency array changes. Listing the variable there causes the effect to run after every render in which that variable changed.',
      },
      {
        id: 'ra-1-3',
        question: 'What is the correct way to update state based on its previous value in React?',
        options: [
          'setState(state + 1)',
          'setState(prev => prev + 1)',
          'state = state + 1',
          'useEffect(() => setState(state + 1))',
        ],
        correctAnswer: 1,
        explanation: 'State updates may be batched. Passing an updater function ensures you always work with the most recent state rather than a potentially stale closure value.',
      },
      {
        id: 'ra-1-4',
        question: 'What does the key prop do when rendering lists?',
        options: [
          'It styles the element uniquely',
          'It helps React identify which items changed, were added, or removed between renders',
          'It maps an array index to a component type',
          'It passes a secret identifier to the DOM',
        ],
        correctAnswer: 1,
        explanation: 'React uses the key to match children in the current tree with children in the previous tree, enabling efficient reconciliation.',
      },
      {
        id: 'ra-1-5',
        question: 'What distinguishes a custom hook from a regular function?',
        options: [
          'Custom hooks can only be written in TypeScript',
          'Custom hooks call other React hooks internally and must start with "use"',
          'Custom hooks cannot accept parameters',
          'Custom hooks always return JSX',
        ],
        correctAnswer: 1,
        explanation: 'A custom hook is any function whose name starts with "use" and that may call built-in React hooks. This convention lets React\'s linter enforce the rules of hooks.',
      },
    ],
    2: [
      {
        id: 'ra-2-1',
        question: 'What is the key difference between useMemo and useCallback?',
        options: [
          'useMemo is for class components, useCallback is for functional components',
          'useMemo memoizes a computed value; useCallback memoizes a function reference',
          'useCallback re-runs on every render; useMemo never does',
          'They are interchangeable — useMemo(fn, deps) === useCallback(fn(), deps)',
        ],
        correctAnswer: 1,
        explanation: 'useMemo(fn, deps) calls fn and caches the result. useCallback(fn, deps) caches fn itself. useCallback(fn, deps) is equivalent to useMemo(() => fn, deps).',
      },
      {
        id: 'ra-2-2',
        question: 'When does useLayoutEffect run relative to the browser paint cycle?',
        options: [
          'After the browser has painted the screen',
          'Before the browser paints, synchronously after all DOM mutations',
          'Asynchronously before the component renders',
          'Only on the server during SSR',
        ],
        correctAnswer: 1,
        explanation: 'useLayoutEffect fires synchronously after all DOM mutations but before the browser paints. This makes it suitable for reading layout metrics or synchronously mutating the DOM.',
      },
      {
        id: 'ra-2-3',
        question: 'A component re-renders even though its parent\'s state changed but no props were passed to it. What is the most likely cause?',
        options: [
          'The component subscribes to a global context that changed',
          'React always re-renders the full subtree',
          'The component uses useRef which triggers renders',
          'React batches all updates, causing cascading renders',
        ],
        correctAnswer: 0,
        explanation: 'By default, any change to a context value causes every consumer of that context to re-render, regardless of whether the consumed value actually changed.',
      },
      {
        id: 'ra-2-4',
        question: 'Which statement about React Portals is correct?',
        options: [
          'Portal children are rendered outside the React component tree entirely',
          'A portal renders a child into a different DOM node but the child still participates in the React tree',
          'Portals bypass React\'s event system and attach native listeners',
          'Portals can only be used inside class components',
        ],
        correctAnswer: 1,
        explanation: 'ReactDOM.createPortal places the child\'s DOM in a different container, but React event bubbling and context still flow through the React component hierarchy, not the DOM hierarchy.',
      },
      {
        id: 'ra-2-5',
        question: 'What does an Error Boundary NOT catch?',
        options: [
          'Errors thrown in the render method of child components',
          'Errors thrown in lifecycle methods of child components',
          'Errors thrown in event handlers',
          'Errors thrown in constructors of child components',
        ],
        correctAnswer: 2,
        explanation: 'Error Boundaries catch errors during rendering, in lifecycle methods, and constructors of the whole tree below them — but NOT inside event handlers. Use try/catch in event handlers.',
      },
    ],
    3: [
      {
        id: 'ra-3-1',
        question: 'In React 18 concurrent rendering, what does useTransition do?',
        options: [
          'Animates component mount and unmount transitions',
          'Marks a state update as non-urgent so React can interrupt it to handle higher-priority updates',
          'Defers rendering until after the next browser frame',
          'Replaces Suspense for data fetching',
        ],
        correctAnswer: 1,
        explanation: 'useTransition returns [isPending, startTransition]. Updates wrapped in startTransition are marked low-priority; React may interrupt them to respond to user input, then resume.',
      },
      {
        id: 'ra-3-2',
        question: 'What causes "tearing" in React concurrent mode and how does useSyncExternalStore prevent it?',
        options: [
          'Tearing occurs when keys conflict; useSyncExternalStore validates keys synchronously',
          'Tearing occurs when a render is interrupted and different components read different snapshots of external state; useSyncExternalStore forces reads to be synchronous and consistent',
          'Tearing is a CSS issue; useSyncExternalStore repaints during transitions',
          'Tearing only occurs with class components; useSyncExternalStore is the hooks equivalent of forceUpdate',
        ],
        correctAnswer: 1,
        explanation: 'During concurrent rendering React may pause and resume renders, causing components to read different versions of external store state (tearing). useSyncExternalStore ensures a consistent snapshot across one render.',
      },
      {
        id: 'ra-3-3',
        question: 'In React\'s Fiber architecture, what is a "work loop" and what is "yielding"?',
        options: [
          'A work loop processes the entire VDOM synchronously; yielding is never needed',
          'The work loop processes Fiber units of work incrementally and can yield control back to the browser between units to keep the UI responsive',
          'The work loop is the reconciler for class components; functional components use a separate loop',
          'Yielding refers to passing props down to children',
        ],
        correctAnswer: 1,
        explanation: 'React Fiber breaks rendering into small units (fibers). The work loop processes them one at a time and checks a deadline; if time is up it yields to the browser, enabling interruption and prioritization.',
      },
      {
        id: 'ra-3-4',
        question: 'You call setState three times in a row inside an event handler. How many re-renders occur in React 18?',
        options: [
          'Three re-renders, one per setState call',
          'One re-render, because React 18 automatically batches all state updates inside event handlers and async code',
          'Two re-renders due to React\'s reconciliation algorithm',
          'Zero re-renders until the component is unmounted and remounted',
        ],
        correctAnswer: 1,
        explanation: 'React 18 introduced automatic batching: all state updates — even in setTimeout, promises, and native event handlers — are batched into a single re-render.',
      },
      {
        id: 'ra-3-5',
        question: 'During server-side rendering with React 18 streaming (renderToPipeableStream), what is a "shell" and what happens if it throws?',
        options: [
          'The shell is the entire HTML document; an error causes a 500 with no output',
          'The shell is the part of the tree outside any Suspense boundaries; if it throws the stream is aborted and you fall back to a client-rendered response',
          'The shell is a Suspense boundary placeholder; an error shows the fallback',
          'The shell is the head element; an error in it is silently swallowed',
        ],
        correctAnswer: 1,
        explanation: 'In React 18 SSR streaming, the shell is everything rendered before the first Suspense boundary. If the shell errors, no HTML can be sent — you must fall back to client rendering. Errors inside Suspense boundaries only affect that subtree.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // JAVASCRIPT MASTERY
  // ══════════════════════════════════════════════════════════
  'js-mastery': {
    1: [
      {
        id: 'js-1-1',
        question: 'What is the difference between == and === in JavaScript?',
        options: [
          '== checks reference equality; === checks value equality',
          '== performs type coercion before comparing; === compares value and type without coercion',
          'They are identical for primitive types',
          '=== is only available in strict mode',
        ],
        correctAnswer: 1,
        explanation: '== converts operands to the same type before comparing (type coercion), which can lead to surprising results like 0 == false being true. === never coerces and requires both value and type to match.',
      },
      {
        id: 'js-1-2',
        question: 'What does the spread operator (...) do when used with an object?',
        options: [
          'Deeply clones the object and all nested objects',
          'Creates a shallow copy of the object\'s own enumerable properties',
          'Merges the object into the global scope',
          'Converts the object to an array of key-value pairs',
        ],
        correctAnswer: 1,
        explanation: 'The spread operator creates a shallow copy — nested objects are still shared by reference. For a deep clone use structuredClone() or JSON.parse(JSON.stringify()).',
      },
      {
        id: 'js-1-3',
        question: 'What is the output of: console.log(typeof null)?',
        options: [
          '"null"',
          '"object"',
          '"undefined"',
          '"symbol"',
        ],
        correctAnswer: 1,
        explanation: 'typeof null === "object" is a well-known historical bug in JavaScript. It was present in the first version and kept for backward compatibility.',
      },
      {
        id: 'js-1-4',
        question: 'What is a closure in JavaScript?',
        options: [
          'A function that has no return value',
          'A function that retains access to variables from its outer (enclosing) scope even after that scope has finished executing',
          'A method that is bound to a class instance',
          'A self-invoking function that runs immediately',
        ],
        correctAnswer: 1,
        explanation: 'When a function is defined inside another function, it closes over the outer function\'s variables. Those variables remain accessible even after the outer function has returned.',
      },
      {
        id: 'js-1-5',
        question: 'What is the event loop responsible for in JavaScript?',
        options: [
          'Compiling JavaScript to bytecode',
          'Monitoring the call stack and moving tasks from the callback queue to the stack when it is empty',
          'Managing memory allocation and garbage collection',
          'Handling synchronous code execution',
        ],
        correctAnswer: 1,
        explanation: 'The event loop continuously checks whether the call stack is empty. When it is, it takes the first task from the callback queue and pushes it onto the stack for execution.',
      },
    ],
    2: [
      {
        id: 'js-2-1',
        question: 'What is the difference between microtasks and macrotasks in the JavaScript event loop?',
        options: [
          'Microtasks are smaller macrotasks split for performance',
          'Microtasks (Promise callbacks, queueMicrotask) run after each macrotask and before the next macrotask — draining the entire microtask queue first',
          'Macrotasks run before microtasks in every tick',
          'setTimeout always creates a microtask',
        ],
        correctAnswer: 1,
        explanation: 'After each macrotask (setTimeout, setInterval, I/O), the engine drains the entire microtask queue (resolved Promises, MutationObserver) before picking the next macrotask. This means many microtasks can block the next render.',
      },
      {
        id: 'js-2-2',
        question: 'What does Object.create(null) produce, and why might you use it?',
        options: [
          'An empty array with no prototype',
          'A plain object with no prototype chain — useful as a pure map that has no inherited properties like toString or hasOwnProperty',
          'An object whose prototype is Object.prototype, same as {}',
          'A frozen, immutable empty object',
        ],
        correctAnswer: 1,
        explanation: 'Object.create(null) creates an object with a null prototype. It has no inherited properties, making it safe to use as a dictionary where keys like "constructor" or "toString" won\'t shadow built-ins.',
      },
      {
        id: 'js-2-3',
        question: 'What is a WeakMap and when should you prefer it over a Map?',
        options: [
          'WeakMap allows any type as key; Map only allows strings',
          'WeakMap holds weak references to its keys — when the key object is garbage-collected the entry is removed automatically, preventing memory leaks',
          'WeakMap is faster because it skips hash computation',
          'WeakMap is an immutable version of Map',
        ],
        correctAnswer: 1,
        explanation: 'WeakMap keys must be objects and are held weakly. If no other reference to the key exists, the garbage collector can reclaim it and the WeakMap entry is automatically removed — ideal for caching per-object data without causing leaks.',
      },
      {
        id: 'js-2-4',
        question: 'What is the output of this code?\n\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
        options: [
          '0, 1, 2',
          '3, 3, 3',
          '0, 0, 0',
          'undefined, undefined, undefined',
        ],
        correctAnswer: 1,
        explanation: 'var is function-scoped so all three closures share the same i variable. By the time the setTimeout callbacks execute, the loop has completed and i === 3. Using let (block-scoped) would print 0, 1, 2.',
      },
      {
        id: 'js-2-5',
        question: 'What is a Generator function and what makes it different from a regular function?',
        options: [
          'A generator is a function that always returns a Promise',
          'A generator function can pause execution at yield expressions and resume later, allowing lazy iteration and cooperative multitasking',
          'A generator creates a new function scope on each call',
          'A generator compiles to async/await at the babel level',
        ],
        correctAnswer: 1,
        explanation: 'Generator functions (function*) return an iterator. Each call to .next() runs the body until the next yield, pausing execution and returning the yielded value. This enables pull-based lazy sequences.',
      },
    ],
    3: [
      {
        id: 'js-3-1',
        question: 'How does the Proxy object differ from Object.defineProperty for intercepting property access?',
        options: [
          'Proxy only works with arrays; defineProperty works with any object',
          'Proxy intercepts operations on the entire object through traps (get, set, has, deleteProperty, etc.) and works on dynamic keys; defineProperty intercepts a single, predefined property',
          'defineProperty is always faster so Proxy is never used in production',
          'Proxy requires the target to be frozen; defineProperty does not',
        ],
        correctAnswer: 1,
        explanation: 'Object.defineProperty patches a single known property. Proxy wraps the whole object and intercepts any operation through traps — including dynamic property creation, in checks, and function application — making it far more powerful for meta-programming.',
      },
      {
        id: 'js-3-2',
        question: 'What is the difference between structuredClone() and JSON.parse(JSON.stringify(obj))?',
        options: [
          'They are identical in all situations',
          'structuredClone handles Dates, RegExps, Maps, Sets, circular references, and typed arrays correctly; JSON roundtrip loses Dates (converts to strings), strips undefined and functions, and throws on circular references',
          'JSON.parse(JSON.stringify()) is the only standard deep clone',
          'structuredClone creates a shallow clone only',
        ],
        correctAnswer: 1,
        explanation: 'JSON serialization cannot represent many JS types and throws on circular refs. structuredClone is the modern standard for deep cloning and correctly handles most built-in types, though it still cannot clone functions or class instances with methods.',
      },
      {
        id: 'js-3-3',
        question: 'What does the [[Prototype]] chain do during property lookup, and how does Object.getPrototypeOf differ from __proto__?',
        options: [
          'They are identical; both access the same slot',
          'During lookup JS walks the [[Prototype]] chain until it finds the property or hits null. Object.getPrototypeOf is the standard ES6 API; __proto__ is a legacy accessor that some environments do not support',
          'Object.getPrototypeOf returns the constructor; __proto__ returns the prototype',
          '__proto__ traverses two levels of the chain; Object.getPrototypeOf only one',
        ],
        correctAnswer: 1,
        explanation: 'Property lookup walks up [[Prototype]] links. __proto__ was an unofficial accessor added by browsers before ES6 standardized Object.getPrototypeOf/setPrototypeOf. Both ultimately access the same internal slot, but the standard API is preferred.',
      },
      {
        id: 'js-3-4',
        question: 'What is a "hidden class" (or "shape") in V8 and why does it matter for performance?',
        options: [
          'A hidden class is a CSS class injected by the browser for animations',
          'V8 creates an internal hidden class (shape) for each unique property layout. Objects with the same layout share a hidden class enabling fast inline property lookup. Adding properties in different orders creates different hidden classes, causing de-optimization',
          'Hidden classes store private fields that are inaccessible from JavaScript',
          'Hidden classes are used only during JIT compilation and have no runtime effect',
        ],
        correctAnswer: 1,
        explanation: 'V8\'s JIT compiler optimizes property access by assuming a fixed object shape. When you add properties in inconsistent order across instances, each gets a different hidden class, preventing inline cache (IC) hits and degrading performance significantly.',
      },
      {
        id: 'js-3-5',
        question: 'What is the temporal dead zone (TDZ) and which declarations does it affect?',
        options: [
          'The TDZ is the time between parsing and execution; it affects all declarations',
          'The TDZ is the region between the start of a block scope and a let/const/class declaration where the binding exists but is uninitialized — accessing it throws a ReferenceError',
          'The TDZ applies only to class declarations',
          'The TDZ is another name for hoisting applied to var declarations',
        ],
        correctAnswer: 1,
        explanation: 'let, const, and class declarations are hoisted to the top of their block but not initialized. The temporal dead zone is the period from the block start to the declaration line — accessing the variable there throws a ReferenceError, unlike var which is initialized to undefined.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // TYPESCRIPT PRO
  // ══════════════════════════════════════════════════════════
  'typescript-pro': {
    1: [
      {
        id: 'ts-1-1',
        question: 'What is a TypeScript generic and why is it useful?',
        options: [
          'A generic is a type that can only be used with arrays',
          'A generic is a type parameter that lets you write reusable, type-safe code that works across multiple types without sacrificing type information',
          'A generic creates runtime type checks automatically',
          'A generic is another name for the any type',
        ],
        correctAnswer: 1,
        explanation: 'Generics act as placeholders for types. Instead of writing the same logic for string, number, etc., you write it once with <T> and TypeScript infers or enforces the concrete type at each call site.',
      },
      {
        id: 'ts-1-2',
        question: 'What does the keyof operator produce?',
        options: [
          'The keys of an object at runtime as an array',
          'A union type of all property names (keys) of a given type',
          'A type that removes all keys from an object',
          'A record of key-to-boolean entries',
        ],
        correctAnswer: 1,
        explanation: 'keyof T produces a union of string/number/symbol literal types corresponding to all keys of T. For { a: number; b: string } keyof produces "a" | "b".',
      },
      {
        id: 'ts-1-3',
        question: 'When should you prefer an interface over a type alias?',
        options: [
          'Always — interfaces are faster to compile',
          'When you need declaration merging or want to model an object/class shape that others can extend',
          'When you need a union or intersection type',
          'When you are using generics',
        ],
        correctAnswer: 1,
        explanation: 'Interfaces support declaration merging (you can re-open an interface across files) and extend naturally. Type aliases are more flexible for unions, intersections, and mapped types, but cannot be merged.',
      },
      {
        id: 'ts-1-4',
        question: 'What makes a union "discriminated"?',
        options: [
          'It uses only primitive types',
          'Each member of the union has a common property with a unique literal type that TypeScript can use to narrow the type in conditionals',
          'It is created with the & operator instead of |',
          'It has exactly two members',
        ],
        correctAnswer: 1,
        explanation: 'A discriminated union uses a shared "discriminant" field (e.g., type: "circle" | "square"). TypeScript narrows the union in switch/if blocks by checking that field.',
      },
      {
        id: 'ts-1-5',
        question: 'What does Readonly<T> do?',
        options: [
          'Prevents the variable from being reassigned at runtime',
          'Constructs a type where all properties of T are marked as readonly, preventing reassignment at compile time',
          'Freezes the object using Object.freeze at the type level',
          'Makes all properties optional',
        ],
        correctAnswer: 1,
        explanation: 'Readonly<T> is a mapped type that prefixes every property with readonly. It only affects TypeScript\'s type-checking — it has no runtime effect.',
      },
    ],
    2: [
      {
        id: 'ts-2-1',
        question: 'What does the infer keyword do inside a conditional type?',
        options: [
          'It forces TypeScript to infer the type of a variable at the call site',
          'It introduces a type variable that TypeScript infers from within the structure being matched in a conditional type, letting you extract and use parts of a type',
          'It is shorthand for unknown in generic constraints',
          'It replaces generics inside utility types',
        ],
        correctAnswer: 1,
        explanation: 'infer is only valid inside conditional types (T extends SomeType ? A : B). It captures a portion of the matched type into a new type variable. Example: type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never.',
      },
      {
        id: 'ts-2-2',
        question: 'What is a mapped type? Give an example of what { [K in keyof T]: boolean } produces.',
        options: [
          'A type that iterates over an array at runtime',
          'A type that iterates over all keys of T and creates a new type where every property is boolean — similar to Partial but replacing values instead of making them optional',
          'A type that maps string keys to any values',
          'A utility type that converts object types to tuples',
        ],
        correctAnswer: 1,
        explanation: 'Mapped types transform each property of an existing type. { [K in keyof T]: boolean } produces a type with the same keys as T but all values set to boolean.',
      },
      {
        id: 'ts-2-3',
        question: 'What is the difference between unknown and any?',
        options: [
          'They are identical — both disable type checking',
          'unknown is type-safe: you cannot perform operations on it without first narrowing its type. any disables type checking entirely, opting out of TypeScript\'s safety guarantees',
          'unknown is a newer alias for any',
          'any is stricter than unknown',
        ],
        correctAnswer: 1,
        explanation: 'unknown forces you to check the type before using it (e.g., if (typeof x === "string")), whereas any lets you do anything without checks. Use unknown when you don\'t know the type but still want safety.',
      },
      {
        id: 'ts-2-4',
        question: 'What do template literal types enable in TypeScript?',
        options: [
          'Runtime string interpolation with type safety',
          'Constructing new string literal types by combining existing string literals using template literal syntax — e.g., type EventName<T extends string> = `on${Capitalize<T>}`',
          'Type-safe tagged template literals that call a parsing function',
          'Replacing string enums with unions automatically',
        ],
        correctAnswer: 1,
        explanation: 'Template literal types (`${}` in type position) let you create new string literal union types by combining and transforming other string literals at the type level, enabling precise API modeling (e.g., `get${Capitalize<K>}` for accessor names).',
      },
      {
        id: 'ts-2-5',
        question: 'What does the Extract<T, U> utility type do?',
        options: [
          'Extracts a property from an object type',
          'From a union type T, constructs a type consisting of only those members that are assignable to U',
          'Removes U from T (opposite of Exclude)',
          'Picks the U-th element from a tuple type T',
        ],
        correctAnswer: 1,
        explanation: 'Extract<T, U> = T extends U ? T : never applied distributively over T. It keeps only the union members of T that extend U. It is the dual of Exclude.',
      },
    ],
    3: [
      {
        id: 'ts-3-1',
        question: 'What does it mean for a generic type to be covariant vs contravariant, and where does TypeScript enforce this?',
        options: [
          'Covariant means readonly input; contravariant means writeonly output',
          'A covariant position preserves subtype relationships (you can use a subtype where a supertype is expected) — function return types. A contravariant position reverses them — function parameter types. TypeScript checks this for function types, catching unsafe assignments.',
          'Covariance applies only to arrays; contravariance only to functions',
          'TypeScript treats all generics as invariant by default',
        ],
        correctAnswer: 1,
        explanation: 'If Dog extends Animal, a ()=>Dog is assignable to ()=>Animal (covariant return). But (dog: Dog)=>void is NOT assignable to (animal: Animal)=>void (contravariant parameters) — the stricter type cannot be used where looser is expected. TypeScript uses bivariant method checking but strict function type checking with --strictFunctionTypes.',
      },
      {
        id: 'ts-3-2',
        question: 'How do you write a recursive conditional type that deeply makes all properties of an object optional (deep Partial)?',
        options: [
          'type DeepPartial<T> = Partial<T>',
          'type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T',
          'type DeepPartial<T> = { [K in keyof T]: T[K] | undefined }',
          'type DeepPartial<T> = Partial<Partial<T>>',
        ],
        correctAnswer: 1,
        explanation: 'The conditional branch checks if T is an object. If so, it maps over its keys making them optional (?:) and recursively applies DeepPartial to their values. Primitives fall through to the else branch, returning T unchanged.',
      },
      {
        id: 'ts-3-3',
        question: 'What is a "type predicate" and when is it necessary?',
        options: [
          'A compile-time assertion that a value is not null',
          'A function with a return type of the form "paramName is Type" that teaches TypeScript to narrow the type of a variable in the scope where the predicate returns true',
          'A generic constraint that limits a type to primitives',
          'A decorator that validates types at runtime',
        ],
        correctAnswer: 1,
        explanation: 'function isString(x: unknown): x is string { return typeof x === "string"; } When called, TypeScript narrows x to string in the true branch. Necessary when inference cannot narrow automatically, e.g., with runtime data.',
      },
      {
        id: 'ts-3-4',
        question: 'What does the NoInfer<T> utility type (introduced in TypeScript 5.4) do?',
        options: [
          'It prevents TypeScript from inferring any type, defaulting to unknown',
          'It blocks a type parameter from being used as an inference site, forcing TypeScript to infer the type from other positions and then check the NoInfer position against the inferred result',
          'It is an alias for never',
          'It removes inference from return types only',
        ],
        correctAnswer: 1,
        explanation: 'Without NoInfer<T>, TypeScript may infer T from a "default value" parameter instead of the primary argument, widening the type unexpectedly. Wrapping the default in NoInfer<T> tells TypeScript to ignore that position for inference and only use it for checking.',
      },
      {
        id: 'ts-3-5',
        question: 'In TypeScript, what does the satisfies operator do differently from a type annotation?',
        options: [
          'satisfies is identical to a type annotation but with better error messages',
          'satisfies validates that an expression matches a type without widening the inferred type of the variable — you keep the precise literal types while still getting type-checking against the constraint',
          'satisfies casts the value to the given type at runtime',
          'satisfies only works with interface types, not type aliases',
        ],
        correctAnswer: 1,
        explanation: 'const palette = { red: [255,0,0], green: "#00ff00" } satisfies Record<string, string|number[]> — TypeScript checks all keys match the constraint but infers palette.red as [number,number,number] (tuple), not string|number[]. A type annotation would widen it.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // WEB PERFORMANCE
  // ══════════════════════════════════════════════════════════
  'web-performance': {
    1: [
      {
        id: 'wp-1-1',
        question: 'What does Largest Contentful Paint (LCP) measure?',
        options: [
          'The time from navigation start to the first byte of the response',
          'When the largest image or text block visible in the viewport finishes rendering',
          'The total number of layout shifts on the page',
          'The time the main thread is blocked',
        ],
        correctAnswer: 1,
        explanation: 'LCP is a Core Web Vital that measures perceived load speed. A good LCP is under 2.5 seconds. It tracks the render time of the largest element visible in the viewport (typically a hero image or heading).',
      },
      {
        id: 'wp-1-2',
        question: 'What is code splitting and which webpack/Vite feature enables it most easily in React?',
        options: [
          'Compressing JS with gzip; enabled by the terser plugin',
          'Breaking the JS bundle into smaller chunks loaded on demand; enabled by React.lazy() + import() dynamic imports',
          'Separating CSS into a different file; enabled by MiniCssExtractPlugin',
          'Tree-shaking unused exports; enabled by side-effects: false in package.json',
        ],
        correctAnswer: 1,
        explanation: 'Code splitting defers loading of non-critical code. React.lazy(() => import(\'./Component\')) combined with Suspense creates a split point; the chunk is fetched only when the component is first rendered.',
      },
      {
        id: 'wp-1-3',
        question: 'What is the purpose of the loading="lazy" attribute on an <img> tag?',
        options: [
          'It compresses the image on the fly',
          'It defers fetching and decoding the image until it enters (or is near) the viewport',
          'It converts the image to WebP automatically',
          'It prevents the image from blocking the DOMContentLoaded event',
        ],
        correctAnswer: 1,
        explanation: 'loading="lazy" is a native browser hint that tells the parser to skip fetching the image until it is close to the viewport, reducing initial payload and speeding up LCP for above-the-fold content.',
      },
      {
        id: 'wp-1-4',
        question: 'What HTTP response header tells a CDN to cache a resource for 1 year and serve stale content while revalidating?',
        options: [
          'Cache-Control: no-cache',
          'Cache-Control: max-age=31536000, stale-while-revalidate=86400',
          'Expires: 1y',
          'Pragma: cache',
        ],
        correctAnswer: 1,
        explanation: 'max-age=31536000 caches for one year. stale-while-revalidate=86400 allows the CDN to serve the cached version for an additional day while asynchronously revalidating in the background.',
      },
      {
        id: 'wp-1-5',
        question: 'What does a Service Worker allow you to do that a regular web worker cannot?',
        options: [
          'Run CPU-intensive tasks off the main thread',
          'Intercept and handle network requests, enabling offline support, background sync, and push notifications',
          'Access the DOM directly from a background thread',
          'Execute WebAssembly modules',
        ],
        correctAnswer: 1,
        explanation: 'A Service Worker is a network proxy that runs between the browser and the server. It intercepts fetch events, enabling caching strategies, offline support, and background sync — things a regular worker cannot do.',
      },
    ],
    2: [
      {
        id: 'wp-2-1',
        question: 'What is Cumulative Layout Shift (CLS) and what is the most common cause?',
        options: [
          'CLS measures JS execution time; caused by long tasks',
          'CLS measures unexpected layout shifts during the page\'s lifetime; the most common cause is images and ads without explicit width/height dimensions that shift content as they load',
          'CLS measures the number of DOM nodes; caused by deeply nested HTML',
          'CLS measures network requests; caused by uncached third-party scripts',
        ],
        correctAnswer: 1,
        explanation: 'CLS (a Core Web Vital, target <0.1) sums the product of impact fraction × distance fraction for each unexpected shift. Always set width and height on images so the browser reserves space before the image loads.',
      },
      {
        id: 'wp-2-2',
        question: 'What do the rel="preconnect" and rel="dns-prefetch" resource hints do, and when should you use each?',
        options: [
          'Both do the same thing; preconnect is newer',
          'preconnect performs the DNS lookup, TCP handshake, and TLS negotiation early for a cross-origin; dns-prefetch only does the DNS lookup. Use preconnect for critical third-party origins, dns-prefetch for less critical ones as preconnect is more expensive',
          'dns-prefetch pre-downloads the resource; preconnect only resolves the hostname',
          'preconnect is for same-origin; dns-prefetch is for cross-origin',
        ],
        correctAnswer: 1,
        explanation: 'preconnect is more aggressive (full handshake) and consumes more resources, so it should be limited to 1-2 critical origins. dns-prefetch is cheap and suitable for origins you may use later.',
      },
      {
        id: 'wp-2-3',
        question: 'What is the Critical Rendering Path and which step is most commonly the bottleneck?',
        options: [
          'The path from server to CDN; bottleneck is DNS resolution',
          'The sequence: parse HTML → build DOM, parse CSS → build CSSOM, combine to Render Tree → Layout → Paint → Composite. Render-blocking CSS and JS in <head> are the most common bottleneck',
          'The path from JS execution to first paint; bottleneck is garbage collection',
          'Only the layout and paint phases; JS has no effect',
        ],
        correctAnswer: 1,
        explanation: 'CSS is render-blocking: the browser cannot paint until the CSSOM is built. Scripts without defer/async also block HTML parsing. Minimizing render-blocking resources is key to improving First Contentful Paint.',
      },
      {
        id: 'wp-2-4',
        question: 'What is "Long Animation Frame" (LoAF) in Chrome DevTools and why does it replace Long Tasks?',
        options: [
          'LoAF measures CSS animation duration; Long Tasks measured JS duration',
          'Long Tasks flagged main-thread blocks >50ms but missed total frame time (style/layout/paint). LoAF (>50ms frame) captures the full rendering pipeline bottleneck including style recalculation and presentation delay',
          'LoAF is the same metric with a renamed API',
          'Long Tasks still exist; LoAF is additive for GPU frames',
        ],
        correctAnswer: 1,
        explanation: 'Long Tasks only counted JS execution. LoAF encompasses the full frame: script execution + style + layout + paint + commit. This gives a more accurate picture of jank and correlates better with INP (Interaction to Next Paint).',
      },
      {
        id: 'wp-2-5',
        question: 'What is the difference between defer and async on a <script> tag?',
        options: [
          'async downloads in parallel and executes after DOMContentLoaded; defer executes immediately',
          'Both download in parallel without blocking HTML parsing. async executes as soon as downloaded (may be out of order, may block parsing). defer executes in order after the HTML is fully parsed, just before DOMContentLoaded',
          'defer is for ES modules; async is for classic scripts',
          'They are identical in modern browsers',
        ],
        correctAnswer: 1,
        explanation: 'async scripts run as soon as they download — useful for independent scripts like analytics. defer scripts maintain document order and run after parsing — safer for scripts that depend on each other or the DOM.',
      },
    ],
    3: [
      {
        id: 'wp-3-1',
        question: 'How does HTTP/3 (QUIC) improve performance over HTTP/2 for lossy networks?',
        options: [
          'HTTP/3 compresses headers more aggressively than HPACK',
          'HTTP/2 multiplexes streams over a single TCP connection — one lost packet stalls all streams (head-of-line blocking at TCP level). HTTP/3 runs over QUIC (UDP), where packet loss only affects the stream it belongs to, eliminating TCP-level HOL blocking',
          'HTTP/3 removes TLS to reduce connection setup time',
          'HTTP/3 eliminates DNS lookups using embedded IP addresses',
        ],
        correctAnswer: 1,
        explanation: 'QUIC implements streams at the transport layer, so TCP head-of-line blocking is gone. Each stream\'s lost packets are retransmitted independently. QUIC also supports 0-RTT connection resumption for returning visitors.',
      },
      {
        id: 'wp-3-2',
        question: 'What is "memory pressure" in the browser, how do you detect it, and what causes web app memory leaks most often?',
        options: [
          'Memory pressure is CPU usage above 80%; detected with the Performance timeline',
          'Memory pressure occurs when a page consumes too much heap, triggering GC pauses or tab killing. Detected with Chrome DevTools heap snapshots or the performance.memory API. Common leaks: detached DOM nodes held by JS references, uncleaned event listeners, and closures capturing large scopes',
          'Memory pressure only affects mobile; desktop browsers have unlimited heap',
          'Memory pressure is the same as layout thrashing',
        ],
        correctAnswer: 1,
        explanation: 'Use DevTools Memory tab → heap snapshots before/after actions to find retained objects. Detached DOM nodes (removed from DOM but referenced in JS), global event listeners without cleanup, and timers that capture large closures are the most frequent sources of leaks in SPAs.',
      },
      {
        id: 'wp-3-3',
        question: 'What is "layout thrashing" and how do you fix it?',
        options: [
          'Layout thrashing is CSS animation jank caused by transform instead of top/left',
          'Layout thrashing occurs when JavaScript alternately reads then writes layout properties (e.g., offsetWidth, then style.width) in a loop, forcing the browser to recalculate layout synchronously on every read. Fix by batching all reads first, then all writes, or using requestAnimationFrame',
          'Layout thrashing is caused by too many CSS selectors',
          'Layout thrashing is the same as reflow; prevent it with will-change',
        ],
        correctAnswer: 1,
        explanation: 'Each time you read a layout property (offsetTop, getBoundingClientRect) after a write (style change), the browser must synchronously flush pending layout. Reading dozens of properties in a loop causes O(n) forced layouts. Batch reads then writes, or use the FastDOM library.',
      },
      {
        id: 'wp-3-4',
        question: 'What is Real User Monitoring (RUM) and how does it differ from synthetic lab testing?',
        options: [
          'RUM is a browser DevTools feature; synthetic testing uses Lighthouse',
          'RUM collects performance data from actual users\' devices and networks via the PerformanceObserver API, reflecting real-world variability. Synthetic tests run in controlled lab conditions (fixed CPU, network throttling) and are reproducible but don\'t capture real-user diversity',
          'RUM measures server-side metrics; synthetic testing measures client-side',
          'They are the same methodology with different tooling',
        ],
        correctAnswer: 1,
        explanation: 'Both matter: lab tests (Lighthouse, WebPageTest) give reproducible baselines and catch regressions in CI. RUM (via tools like web-vitals.js + analytics) captures p75/p95 real-world Core Web Vitals, which is what Google\'s ranking signal uses.',
      },
      {
        id: 'wp-3-5',
        question: 'What is "edge rendering" (also called edge SSR) and what performance problem does it solve compared to origin-server SSR?',
        options: [
          'Edge rendering moves rendering to the GPU; it solves CSS animation jank',
          'Edge rendering runs SSR at CDN edge nodes geographically close to the user, reducing Time to First Byte (TTFB) compared to origin SSR where every request crosses the globe. The trade-off is limited runtime APIs at the edge (no Node.js built-ins, limited memory)',
          'Edge rendering is client-side rendering with a CDN in front',
          'Edge rendering caches the fully-rendered HTML at the CDN; it is identical to static site generation',
        ],
        correctAnswer: 1,
        explanation: 'Origin SSR can have high TTFB for geographically distant users. Edge SSR (Vercel Edge Functions, Cloudflare Workers) renders HTML at the CDN PoP closest to the user, dramatically reducing TTFB. The constraints are a stripped-down runtime (no fs, limited CPU).',
      },
    ],
  },
};

// Flat question bank for backwards-compat (used by older code paths)
export const mockQuestions: Record<string, Question[]> = Object.fromEntries(
  Object.entries(mockQuestionsByRound).map(([id, rounds]) => [
    id,
    [...rounds[1], ...rounds[2], ...rounds[3]],
  ])
);

export const mockCredentials: Credential[] = [
  {
    id: 'cred-001',
    title: 'React Advanced',
    issuer: 'Tech Academy Pro',
    credentialId: 'REACT-ADV-20241215-001',
    blockchainHash: generateBlockchainHash({ credentialId: 'REACT-ADV-20241215-001', userId: 'user-123', timestamp: '2024-12-15T10:30:00Z' }),
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
    blockchainHash: generateBlockchainHash({ credentialId: 'JS-MSTR-20241120-002', userId: 'user-123', timestamp: '2024-11-20T14:22:00Z' }),
    date: '2024-11-20',
    assessmentId: 'js-mastery',
    score: 88,
    isVerified: true,
    views: 35,
    shareCount: 5,
  },
];
