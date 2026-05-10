'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearnLedgerStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { SKILLS, ROUND_LABELS, ROUND_TIME_LIMITS } from '@/lib/skills';
import { mockQuestions } from '@/lib/mock-data';
import QuizCard from '@/components/quiz-card';
import QuizResults from '@/components/quiz-results';
import CameraApproval from '@/components/CameraApproval';
import RoundStepper from '@/components/RoundStepper';
import Timer from '@/components/Timer';
import SkeletonLoader from '@/components/skeleton-loader';
import { ArrowLeft, Code, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Phase = 'camera' | 'assessment' | 'results';

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params.id as string;
  const { user } = useAuth();

  const {
    currentQuestionIndex,
    answers,
    currentRound,
    roundResults,
    cameraApproved,
    setCurrentQuestionIndex,
    addAnswer,
    setAnswers,
    resetQuiz,
    setCurrentRound,
    addRoundResult,
    setCameraApproved,
    resetMultiRound,
  } = useLearnLedgerStore();

  const [phase, setPhase] = useState<Phase>('camera');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const skill = SKILLS.find((s) => s.id === skillId);
  const assessmentQuestions = mockQuestions[skillId as keyof typeof mockQuestions] || [];
  const completedRounds = roundResults.filter((r) => r.passed).map((r) => r.round);

  useEffect(() => {
    if (skill) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [skill]);

  // Auto-save MCQ answers to localStorage
  useEffect(() => {
    if (phase === 'assessment' && currentRound === 1) {
      const key = `learnledger-answers-${skillId}-r${currentRound}`;
      localStorage.setItem(key, JSON.stringify(answers));
    }
  }, [answers, skillId, currentRound, phase]);

  // Recover answers from localStorage
  useEffect(() => {
    if (phase === 'assessment' && currentRound === 1 && answers.length === 0) {
      const key = `learnledger-answers-${skillId}-r${currentRound}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setAnswers(parsed);
          }
        } catch {}
      }
    }
  }, [phase, skillId, currentRound]);

  const handleCameraApproved = useCallback(() => {
    setCameraApproved(true);
    setPhase('assessment');
  }, [setCameraApproved]);

  const handleCameraDenied = useCallback(() => {
    setCameraApproved(false);
  }, [setCameraApproved]);

  const handleTimeUp = useCallback(() => {
    handleRoundComplete();
  }, []);

  const handleRoundComplete = () => {
    let score = 0;
    let maxScore = 5;
    let percentage = 0;

    if (currentRound === 1) {
      maxScore = assessmentQuestions.length || 5;
      score = answers.reduce((acc, answer, index) => {
        return answer === assessmentQuestions[index]?.correctAnswer ? acc + 1 : acc;
      }, 0);
      percentage = Math.round((score / maxScore) * 100);
    } else if (currentRound === 2) {
      score = Math.floor(Math.random() * 2) + 2;
      maxScore = 2;
      percentage = Math.round((score / maxScore) * 100);
    } else {
      score = Math.floor(Math.random() * 3) + 3;
      maxScore = 5;
      percentage = Math.round((score / maxScore) * 100);
    }

    const passed = percentage >= 70;

    addRoundResult({
      round: currentRound,
      score,
      maxScore,
      percentage,
      passed,
      timestamp: new Date().toISOString(),
      roundType: currentRound === 1 ? 'mcq' : currentRound === 2 ? 'coding' : 'proctored',
      cameraApproved,
    });

    // Clear auto-save
    localStorage.removeItem(`learnledger-answers-${skillId}-r${currentRound}`);

    if (passed && currentRound < 3) {
      setCurrentRound(currentRound + 1);
      resetQuiz();
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setCodeValue('');
      setPhase('camera');
    } else if (passed && currentRound === 3) {
      setPhase('results');
    } else {
      setPhase('results');
    }
  };

  const handleNextQuestion = () => {
    if (currentRound === 1) {
      const isLastQuestion = currentQuestionIndex === (assessmentQuestions.length || 5) - 1;
      if (isLastQuestion) {
        handleRoundComplete();
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
      }
    } else {
      handleRoundComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonLoader />
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass p-8 rounded-md text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Skill Not Found</h2>
          <p className="text-foreground/60 mb-4">The requested skill assessment does not exist.</p>
          <Button onClick={() => router.push('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Results phase
  if (phase === 'results') {
    const allPassed = roundResults.length >= 3 && roundResults.every((r) => r.passed);
    const lastResult = roundResults[roundResults.length - 1];
    const overallScore = roundResults.length > 0
      ? Math.round(roundResults.reduce((sum, r) => sum + r.percentage, 0) / roundResults.length)
      : 0;

    const credential = {
      id: `cred-${Date.now()}`,
      title: skill.name,
      issuer: 'LearnLedger Academy',
      credentialId: `${skill.id.toUpperCase()}-${Date.now()}`,
      blockchainHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      date: new Date().toISOString().split('T')[0],
      assessmentId: skill.id,
      score: overallScore,
      isVerified: true,
      views: 0,
      shareCount: 0,
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <QuizResults
          score={lastResult?.score || 0}
          totalQuestions={lastResult?.maxScore || 5}
          title={skill.name}
          issuer="LearnLedger Academy"
          credentialId={credential.credentialId}
          onDownload={() => {}}
          onShare={() => {}}
          onViewCredential={() => {
            if (allPassed) {
              const { addCredential, updateAssessmentStatus } = useLearnLedgerStore.getState();
              addCredential(credential);
            }
            resetMultiRound();
            resetQuiz();
            router.push('/credentials');
          }}
        />
      </div>
    );
  }

  // Camera approval phase
  if (phase === 'camera' && !cameraApproved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl mb-6">
          <button
            onClick={() => { resetMultiRound(); router.push('/'); }}
            className="text-foreground/60 hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Back
          </button>
        </div>
        <div className="w-full max-w-2xl mb-6">
          <RoundStepper
            currentRound={currentRound}
            completedRounds={completedRounds}
            skillName={skill.name}
          />
        </div>
        <CameraApproval
          onApproved={handleCameraApproved}
          onDenied={handleCameraDenied}
        />
      </div>
    );
  }

  // Assessment phase
  const question = assessmentQuestions[currentQuestionIndex];
  const timeLimit = ROUND_TIME_LIMITS[currentRound] || 600;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl mb-6">
        <button
          onClick={() => { resetMultiRound(); router.push('/'); }}
          className="text-foreground/60 hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 inline mr-1" />
          Back
        </button>
      </div>

      <div className="w-full max-w-2xl mb-6">
        <RoundStepper
          currentRound={currentRound}
          completedRounds={completedRounds}
          skillName={skill.name}
        />
      </div>

      <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{ROUND_LABELS[currentRound]}</h2>
        <Timer
          initialSeconds={timeLimit}
          onTimeUp={handleTimeUp}
          isRunning={phase === 'assessment'}
        />
      </div>

      <AnimatePresence mode="wait">
        {currentRound === 1 && question && (
          <QuizCard
            key={currentQuestionIndex}
            question={question}
            currentQuestion={currentQuestionIndex}
            totalQuestions={assessmentQuestions.length}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={(index) => {
              setSelectedAnswer(index);
              if (index >= 0) {
                addAnswer(index);
              }
            }}
            onNext={handleNextQuestion}
            onPrevious={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
                setSelectedAnswer(answers[currentQuestionIndex - 1] ?? null);
                setIsAnswerSubmitted(true);
              }
            }}
            isLastQuestion={currentQuestionIndex === assessmentQuestions.length - 1}
            isAnswered={isAnswerSubmitted || selectedAnswer !== null}
          />
        )}

        {currentRound === 2 && (
          <motion.div
            key="coding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="glass p-6 rounded-md space-y-4">
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <Code className="w-4 h-4" />
                Coding Round - 2 Problems
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-muted/50 rounded-md">
                  <h3 className="font-medium mb-2">Problem 1: Two Sum</h3>
                  <p className="text-sm text-foreground/70 mb-3">
                    Given an array of integers, return indices of the two numbers such that they add up to a specific target.
                  </p>
                  <textarea
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value)}
                    className="w-full h-40 bg-background border border-border rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="// Write your solution here&#10;function twoSum(nums, target) {&#10;  // ...&#10;}"
                  />
                </div>
              </div>
              <Button onClick={handleRoundComplete} className="w-full">
                Submit Solutions
              </Button>
            </div>
          </motion.div>
        )}

        {currentRound === 3 && (
          <motion.div
            key="proctored"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="glass p-6 rounded-md space-y-4">
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <Camera className="w-4 h-4" />
                AI-Proctored Assessment
              </div>
              <div className="p-4 bg-muted/50 rounded-md text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-subtle" />
                  <span className="text-sm font-medium text-red-500">Recording in progress</span>
                </div>
                <p className="text-sm text-foreground/70">
                  Your webcam is being monitored. Please answer the following questions honestly. The AI proctor will verify your identity and ensure test integrity.
                </p>
                <div className="space-y-3 text-left">
                  {['Explain the concept of virtual memory and its role in modern operating systems.',
                    'Describe the difference between a process and a thread.',
                    'What is the purpose of a file system journal?'].map((q, i) => (
                    <div key={i} className="p-3 bg-background rounded-md border border-border">
                      <p className="text-sm font-medium">Q{i + 1}: {q}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleRoundComplete} className="w-full">
                Complete Assessment
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
