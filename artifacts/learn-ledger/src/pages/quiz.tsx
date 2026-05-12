import { useEffect, useReducer, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, Trophy, Zap } from 'lucide-react';
import { useLearnLedgerStore } from '@/lib/store';
import QuizCard from '@/components/quiz-card';
import SkeletonLoader from '@/components/skeleton-loader';
import { Button } from '@/components/ui/button';
import { mockAssessments, mockQuestionsByRound } from '@/lib/mock-data';
import { saveCredential, saveRoundResult, upsertAssessmentStatus } from '@/lib/supabase-data';
import { useAuth } from '@/lib/auth-context';
import confetti from 'canvas-confetti';
import type { Question } from '@/lib/store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoundResult {
  round: number;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
}

type Phase = 'intro' | 'quiz' | 'round-complete' | 'final';

interface State {
  phase: Phase;
  currentRound: 1 | 2 | 3;
  currentQuestionIndex: number;
  /** answers collected for the current round */
  roundAnswers: number[];
  /** submitted flag — true after user clicks "Submit Answer" */
  answerSubmitted: boolean;
  selectedAnswer: number | null;
  /** accumulated results per completed round */
  completedRounds: RoundResult[];
}

type Action =
  | { type: 'START_ROUND' }
  | { type: 'SELECT_ANSWER'; payload: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'FINISH_ROUND'; payload: RoundResult }
  | { type: 'NEXT_ROUND' }
  | { type: 'RETRY_ROUND' }
  | { type: 'SHOW_FINAL' };

const TOTAL_ROUNDS = 3;
const PASS_THRESHOLD = 0.7;

const ROUND_LABELS: Record<number, string> = {
  1: 'Round 1 — Intermediate',
  2: 'Round 2 — Advanced',
  3: 'Round 3 — Expert',
};

const ROUND_COLORS: Record<number, string> = {
  1: 'from-blue-500 to-cyan-400',
  2: 'from-primary to-accent',
  3: 'from-orange-500 to-rose-500',
};

const DIFFICULTY_BADGES: Record<number, { label: string; class: string }> = {
  1: { label: 'Intermediate', class: 'bg-blue-500/20 text-blue-400 border border-blue-400/30' },
  2: { label: 'Advanced', class: 'bg-primary/20 text-primary border border-primary/30' },
  3: { label: 'Expert', class: 'bg-orange-500/20 text-orange-400 border border-orange-400/30' },
};

function initialState(): State {
  return {
    phase: 'intro',
    currentRound: 1,
    currentQuestionIndex: 0,
    roundAnswers: [],
    answerSubmitted: false,
    selectedAnswer: null,
    completedRounds: [],
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_ROUND':
      return { ...state, phase: 'quiz', currentQuestionIndex: 0, roundAnswers: [], answerSubmitted: false, selectedAnswer: null };
    case 'SELECT_ANSWER':
      // Ignore re-clicks after answer is already submitted
      if (state.answerSubmitted) return state;
      // Selecting an answer immediately submits it (reveals explanation + enables Next)
      return {
        ...state,
        selectedAnswer: action.payload,
        answerSubmitted: true,
        roundAnswers: [...state.roundAnswers, action.payload],
      };
    case 'NEXT_QUESTION':
      return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1, answerSubmitted: false, selectedAnswer: null };
    case 'FINISH_ROUND':
      return { ...state, phase: 'round-complete', completedRounds: [...state.completedRounds, action.payload] };
    case 'NEXT_ROUND':
      return {
        ...state,
        phase: 'intro',
        currentRound: (state.currentRound + 1) as 1 | 2 | 3,
        currentQuestionIndex: 0,
        roundAnswers: [],
        answerSubmitted: false,
        selectedAnswer: null,
      };
    case 'RETRY_ROUND':
      return {
        ...state,
        phase: 'quiz',
        currentQuestionIndex: 0,
        roundAnswers: [],
        answerSubmitted: false,
        selectedAnswer: null,
        // Remove last round result so retry replaces it
        completedRounds: state.completedRounds.filter((r) => r.round !== state.currentRound),
      };
    case 'SHOW_FINAL':
      return { ...state, phase: 'final' };
    default:
      return state;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoundStepBar({ currentRound, completedRounds }: { currentRound: number; completedRounds: RoundResult[] }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex items-center justify-between gap-2">
        {[1, 2, 3].map((r) => {
          const done = completedRounds.find((c) => c.round === r);
          const active = r === currentRound && !done;
          return (
            <div key={r} className="flex-1 flex flex-col items-center gap-2">
              <div className={`w-full h-1.5 rounded-full transition-all duration-500 ${done ? 'bg-gradient-to-r from-primary to-accent' : active ? 'bg-primary/40' : 'bg-muted'}`} />
              <div className="flex items-center gap-1.5">
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <div className={`w-4 h-4 rounded-full border-2 ${active ? 'border-primary bg-primary/20' : 'border-foreground/20'}`} />
                )}
                <span className={`text-xs font-medium ${done ? 'text-primary' : active ? 'text-foreground' : 'text-foreground/40'}`}>
                  Round {r}
                  {done && <span className="ml-1 text-foreground/50">({done.percentage}%)</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoundIntro({ round, onStart, assessmentTitle }: { round: number; onStart: () => void; assessmentTitle: string }) {
  const badge = DIFFICULTY_BADGES[round];
  const tips: Record<number, string[]> = {
    1: ['Covers fundamental concepts and common patterns', '5 questions — 70% needed to advance', 'Take your time, read each option carefully'],
    2: ['Questions test real-world application and edge cases', 'Expect nuance — some answers may seem similar', 'You must pass Round 1 before advancing here'],
    3: ['Expert-level: internals, performance, gotchas', 'These questions separate practitioners from masters', 'Pass all 3 rounds to earn your verified credential'],
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="w-full max-w-2xl mx-auto text-center space-y-8"
    >
      <div className="glass p-10 rounded-2xl space-y-6">
        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${badge.class}`}>
          {badge.label}
        </span>
        <div>
          <h2 className={`text-5xl font-black bg-gradient-to-r ${ROUND_COLORS[round]} bg-clip-text text-transparent`}>
            Round {round}
          </h2>
          <p className="text-foreground/60 mt-2">{assessmentTitle}</p>
        </div>

        <ul className="space-y-3 text-left">
          {tips[round].map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-foreground/70">
              <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 bg-gradient-to-r ${ROUND_COLORS[round]} bg-clip-text text-transparent`} style={{ filter: 'none' }} />
              {tip}
            </li>
          ))}
        </ul>

        <Button
          onClick={onStart}
          size="lg"
          className={`w-full bg-gradient-to-r ${ROUND_COLORS[round]} text-white rounded-xl font-bold text-base hover:opacity-90`}
        >
          Start Round {round} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function RoundComplete({
  result,
  round,
  onNext,
  onRetry,
  isLastRound,
}: {
  result: RoundResult;
  round: number;
  onNext: () => void;
  onRetry: () => void;
  isLastRound: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result.passed && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
        colors: ['#5499ff', '#9370db', '#60f5ff'],
        disableForReducedMotion: true,
      });
    }
  }, [result.passed]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="glass p-10 rounded-2xl text-center space-y-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
          {result.passed ? (
            <CheckCircle2 className="w-20 h-20 mx-auto text-green-500 drop-shadow-lg" />
          ) : (
            <XCircle className="w-20 h-20 mx-auto text-red-500 drop-shadow-lg" />
          )}
        </motion.div>

        <div>
          <h2 className="text-3xl font-bold">
            {result.passed ? `Round ${round} Passed!` : `Round ${round} Failed`}
          </h2>
          <p className="text-foreground/60 mt-1">
            {result.passed
              ? isLastRound ? 'Outstanding! You have completed all rounds.' : 'Great work — ready for the next challenge?'
              : 'You need 70% to advance. Review the explanations and try again.'}
          </p>
        </div>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.35, type: 'spring' }}>
          <div className={`text-7xl font-black bg-gradient-to-r ${ROUND_COLORS[round]} bg-clip-text text-transparent`}>
            {result.percentage}%
          </div>
          <p className="text-foreground/60 mt-1">{result.score} / {result.total} correct</p>
        </motion.div>

        {/* Score bar */}
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${result.percentage}%` }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${result.passed ? ROUND_COLORS[round] : 'from-red-500 to-red-400'}`}
          />
        </div>
        <p className="text-xs text-foreground/50">Pass threshold: 70%</p>
      </div>

      <div className="flex gap-3">
        {result.passed ? (
          isLastRound ? (
            <Button onClick={onNext} className="flex-1 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold">
              <Trophy className="w-4 h-4 mr-2" /> View Credential
            </Button>
          ) : (
            <Button onClick={onNext} className={`flex-1 bg-gradient-to-r ${ROUND_COLORS[round + 1]} text-white rounded-xl font-bold`}>
              Next Round <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )
        ) : (
          <>
            <Button variant="outline" onClick={onRetry} className="flex-1 rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry Round {round}
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

function FinalResults({
  completedRounds,
  assessmentTitle,
  onViewCredential,
}: {
  completedRounds: RoundResult[];
  assessmentTitle: string;
  onViewCredential: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const avgScore = Math.round(completedRounds.reduce((s, r) => s + r.percentage, 0) / completedRounds.length);

  useEffect(() => {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#5499ff', '#9370db', '#60f5ff', '#ffd700'],
      disableForReducedMotion: true,
    });
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      <div className="glass p-10 rounded-2xl text-center space-y-6">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}>
          <Trophy className="w-24 h-24 mx-auto text-yellow-400 drop-shadow-lg" />
        </motion.div>
        <div>
          <h2 className="text-4xl font-black">All Rounds Complete!</h2>
          <p className="text-foreground/60 mt-2">{assessmentTitle} — Credential Earned</p>
        </div>
        <div className="text-7xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          {avgScore}%
        </div>
        <p className="text-foreground/60">Average across all 3 rounds</p>
      </div>

      <div className="glass p-6 rounded-xl space-y-4">
        <h3 className="font-bold text-lg">Round Breakdown</h3>
        <div className="space-y-3">
          {completedRounds.map((r) => (
            <div key={r.round} className="flex items-center gap-4">
              <div className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${ROUND_COLORS[r.round]}`}>
                R{r.round}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{ROUND_LABELS[r.round].split(' — ')[1]}</span>
                  <span className="font-bold text-primary">{r.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.percentage}%` }}
                    transition={{ duration: 0.7, delay: r.round * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${ROUND_COLORS[r.round]}`}
                  />
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <Button onClick={onViewCredential} size="lg" className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold text-base hover:opacity-90">
        <Trophy className="w-4 h-4 mr-2" /> View & Share Credential
      </Button>
    </motion.div>
  );
}

// ─── Main Quiz Page ────────────────────────────────────────────────────────────

interface QuizPageProps {
  assessmentId: string;
}

export default function QuizPage({ assessmentId }: QuizPageProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { resetQuiz } = useLearnLedgerStore();
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const assessment = mockAssessments.find((a) => a.id === assessmentId);
  const roundQuestions: Question[] =
    mockQuestionsByRound[assessmentId]?.[state.currentRound as 1 | 2 | 3] ?? [];

  useEffect(() => {
    // Reset persisted quiz state on mount
    resetQuiz();
  }, [assessmentId]); // eslint-disable-line

  if (!assessment || roundQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SkeletonLoader />
      </div>
    );
  }

  const isLastRound = state.currentRound === TOTAL_ROUNDS;
  const currentQuestion = roundQuestions[state.currentQuestionIndex];
  const isLastQuestion = state.currentQuestionIndex === roundQuestions.length - 1;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectAnswer = (index: number) => dispatch({ type: 'SELECT_ANSWER', payload: index });

  const handleNext = () => {
    if (!isLastQuestion) {
      dispatch({ type: 'NEXT_QUESTION' });
      return;
    }
    // Last question — roundAnswers already includes the current answer (added in SELECT_ANSWER)
    const score = state.roundAnswers.reduce(
      (acc, ans, idx) => (ans === roundQuestions[idx]?.correctAnswer ? acc + 1 : acc),
      0,
    );
    const percentage = Math.round((score / roundQuestions.length) * 100);
    const passed = percentage / 100 >= PASS_THRESHOLD;
    const result: RoundResult = { round: state.currentRound, score, total: roundQuestions.length, percentage, passed };
    dispatch({ type: 'FINISH_ROUND', payload: result });
  };

  const handleNextRound = () => {
    if (isLastRound) {
      dispatch({ type: 'SHOW_FINAL' });
    } else {
      dispatch({ type: 'NEXT_ROUND' });
    }
  };

  const handleRetry = () => dispatch({ type: 'RETRY_ROUND' });

  const handleViewCredential = async () => {
    const avgScore = Math.round(state.completedRounds.reduce((s, r) => s + r.percentage, 0) / state.completedRounds.length);
    const credential = {
      id: `cred-${Date.now()}`,
      title: assessment.title,
      issuer: 'Tech Academy Pro',
      credentialId: `${assessment.id.toUpperCase()}-${Date.now()}`,
      blockchainHash: `0x${Math.random().toString(16).substring(2).padStart(64, '0')}`,
      date: new Date().toISOString().split('T')[0],
      assessmentId: assessment.id,
      score: avgScore,
      isVerified: true,
      views: 0,
      shareCount: 0,
    };

    if (user) {
      // Save credential + assessment status + round results to Supabase in parallel
      await Promise.all([
        saveCredential(user.id, credential),
        upsertAssessmentStatus(user.id, assessment.id, 'completed', avgScore),
        ...state.completedRounds.map((r) =>
          saveRoundResult(user.id, assessment.id, r.round, r.score, r.total, r.percentage, r.passed)
        ),
      ]);
    }

    navigate('/credentials');
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Back button */}
      <div className="max-w-2xl mx-auto mb-6">
        <button
          onClick={() => navigate('/assessments')}
          className="text-foreground/50 hover:text-foreground transition-colors text-sm"
        >
          ← Back to Assessments
        </button>
      </div>

      {/* Round progress bar (hidden on final screen) */}
      {state.phase !== 'final' && (
        <RoundStepBar currentRound={state.currentRound} completedRounds={state.completedRounds} />
      )}

      {/* Main content */}
      <AnimatePresence mode="wait">
        {/* ── Intro ─────────────────────────────────────────────────────── */}
        {state.phase === 'intro' && (
          <motion.div key={`intro-${state.currentRound}`}>
            <RoundIntro
              round={state.currentRound}
              assessmentTitle={assessment.title}
              onStart={() => dispatch({ type: 'START_ROUND' })}
            />
          </motion.div>
        )}

        {/* ── Quiz ──────────────────────────────────────────────────────── */}
        {state.phase === 'quiz' && currentQuestion && (
          <motion.div
            key={`quiz-${state.currentRound}-${state.currentQuestionIndex}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            {/* Round label */}
            <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${ROUND_COLORS[state.currentRound]}`}>
                {ROUND_LABELS[state.currentRound]}
              </span>
              <span className="text-xs text-foreground/50">
                Q{state.currentQuestionIndex + 1} of {roundQuestions.length}
              </span>
            </div>
            <QuizCard
              question={currentQuestion}
              currentQuestion={state.currentQuestionIndex}
              totalQuestions={roundQuestions.length}
              selectedAnswer={state.selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              onNext={handleNext}
              onPrevious={() => {
                if (state.currentQuestionIndex > 0) {
                  dispatch({ type: 'NEXT_QUESTION' }); // fallback — navigate back not supported after submit
                }
              }}
              isLastQuestion={isLastQuestion}
              isAnswered={state.answerSubmitted}
            />
          </motion.div>
        )}

        {/* ── Round Complete ─────────────────────────────────────────────── */}
        {state.phase === 'round-complete' && state.completedRounds.length > 0 && (
          <motion.div key={`complete-${state.currentRound}`}>
            <RoundComplete
              result={state.completedRounds[state.completedRounds.length - 1]}
              round={state.currentRound}
              onNext={handleNextRound}
              onRetry={handleRetry}
              isLastRound={isLastRound}
            />
          </motion.div>
        )}

        {/* ── Final ─────────────────────────────────────────────────────── */}
        {state.phase === 'final' && (
          <motion.div key="final">
            <FinalResults
              completedRounds={state.completedRounds}
              assessmentTitle={assessment.title}
              onViewCredential={handleViewCredential}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
