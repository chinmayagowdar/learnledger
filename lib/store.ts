import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Assessment {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalQuestions: number;
  completionTime: number;
  category: string;
  image?: string;
  status: 'pending' | 'in-progress' | 'completed';
  score?: number;
  completedAt?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Credential {
  id: string;
  title: string;
  issuer: string;
  credentialId: string;
  blockchainHash: string;
  date: string;
  image?: string;
  assessmentId: string;
  score: number;
  isVerified: boolean;
  views: number;
  shareCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
  totalCredentials: number;
  totalAssessments: number;
}

export interface RoundResult {
  round: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timestamp: string;
}

interface LearnLedgerStore {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Assessment state
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  assessmentQuestions: Question[];
  setAssessments: (assessments: Assessment[]) => void;
  setCurrentAssessment: (assessment: Assessment | null) => void;
  setAssessmentQuestions: (questions: Question[]) => void;
  updateAssessmentStatus: (assessmentId: string, status: Assessment['status'], score?: number) => void;

  // Credential state
  credentials: Credential[];
  setCredentials: (credentials: Credential[]) => void;
  addCredential: (credential: Credential) => void;
  incrementCredentialViews: (credentialId: string) => void;

  // Multi-round state
  currentSkill: string | null;
  currentRound: number;
  roundResults: RoundResult[];
  setCurrentSkill: (skill: string | null) => void;
  setCurrentRound: (round: number) => void;
  setRoundResults: (results: RoundResult[]) => void;
  addRoundResult: (result: RoundResult) => void;
  resetMultiRound: () => void;

  // Quiz state
  currentQuestionIndex: number;
  answers: number[];
  setCurrentQuestionIndex: (index: number) => void;
  setAnswers: (answers: number[]) => void;
  addAnswer: (answer: number) => void;
  resetQuiz: () => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useLearnLedgerStore = create<LearnLedgerStore>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Assessments
      assessments: [],
      currentAssessment: null,
      assessmentQuestions: [],
      setAssessments: (assessments) => set({ assessments }),
      setCurrentAssessment: (assessment) => set({ currentAssessment: assessment }),
      setAssessmentQuestions: (questions) => set({ assessmentQuestions: questions }),
      updateAssessmentStatus: (assessmentId, status, score) =>
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  status,
                  score,
                  completedAt: status === 'completed' ? new Date().toISOString() : a.completedAt,
                }
              : a
          ),
        })),

      // Credentials
      credentials: [],
      setCredentials: (credentials) => set({ credentials }),
      addCredential: (credential) =>
        set((state) => ({
          credentials: [...state.credentials, credential],
        })),
      incrementCredentialViews: (credentialId) =>
        set((state) => ({
          credentials: state.credentials.map((c) =>
            c.id === credentialId ? { ...c, views: c.views + 1 } : c
          ),
        })),

      // Multi-round
      currentSkill: null,
      currentRound: 1,
      roundResults: [],
      setCurrentSkill: (skill) => set({ currentSkill: skill }),
      setCurrentRound: (round) => set({ currentRound: round }),
      setRoundResults: (results) => set({ roundResults: results }),
      addRoundResult: (result) =>
        set((state) => ({
          roundResults: [...state.roundResults, result],
        })),
      resetMultiRound: () =>
        set({
          currentSkill: null,
          currentRound: 1,
          roundResults: [],
        }),

      // Quiz
      currentQuestionIndex: 0,
      answers: [],
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      setAnswers: (answers) => set({ answers }),
      addAnswer: (answer) =>
        set((state) => ({
          answers: [...state.answers, answer],
        })),
      resetQuiz: () =>
        set({
          currentQuestionIndex: 0,
          answers: [],
          currentAssessment: null,
          assessmentQuestions: [],
        }),

      // Loading
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'learnledger-store',
    }
  )
);
