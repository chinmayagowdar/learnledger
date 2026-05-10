'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Timer from '@/components/timer';
import CodeEditor from '@/components/code-editor';
import CameraApproval from '@/components/camera-approval';
import { useAuth } from '@/components/auth-provider';
import { getSkillById, type Skill, type RoundConfig } from '@/lib/skills';
import { getSkillQuestionsForRound, getCodingProblemsForSkill, type CodingProblem } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Question } from '@/lib/store';

type RoundNumber = 1 | 2 | 3;

export default function RoundPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const skillId = params.skillId as string;
  const roundNumber = parseInt(params.roundNumber as string, 10) as RoundNumber;

  const [skill, setSkill] = useState<Skill | null>(null);
  const [roundConfig, setRoundConfig] = useState<RoundConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraApproved, setCameraApproved] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Coding state
  const [codingProblems, setCodingProblems] = useState<CodingProblem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [codingResults, setCodingResults] = useState<boolean[]>([]);

  useEffect(() => {
    const foundSkill = getSkillById(skillId);
    if (!foundSkill || ![1, 2, 3].includes(roundNumber)) {
      router.push('/assessments');
      return;
    }

    setSkill(foundSkill);
    setRoundConfig(foundSkill.rounds[roundNumber as 1 | 2 | 3]);

    // Load questions or coding problems based on round type
    const config = foundSkill.rounds[roundNumber as 1 | 2 | 3];
    if (config.type === 'mcq' || config.type === 'proctored') {
      const roundQuestions = getSkillQuestionsForRound(
        foundSkill.id,
        config.type === 'mcq' ? 1 : 3
      );
      setQuestions(roundQuestions);
      setAnswers(new Array(roundQuestions.length).fill(null));
    } else if (config.type === 'coding') {
      const problems = getCodingProblemsForSkill(foundSkill.id);
      setCodingProblems(problems);
      setCodingResults(new Array(problems.length).fill(false));
    }

    // Check if camera was already approved for proctored round
    if (config.type === 'proctored') {
      const approved = sessionStorage.getItem('camera-approved') === 'true';
      setCameraApproved(approved);
    } else {
      setCameraApproved(true);
    }

    setIsLoading(false);
  }, [skillId, roundNumber, router]);

  const handleTimeUp = useCallback(() => {
    toast.warning('Time is up! Submitting your answers...');
    handleSubmit();
  }, []);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);

    // Auto-save to localStorage
    localStorage.setItem(
      `quiz-${skillId}-${roundNumber}`,
      JSON.stringify({ answers: newAnswers, questionIndex: currentQuestionIndex })
    );
  };

  const handleCodingSubmit = (
    _code: string,
    _language: string,
    results: Array<{ passed: boolean }>
  ) => {
    const allPassed = results.every((r) => r.passed);
    const newResults = [...codingResults];
    newResults[currentProblemIndex] = allPassed;
    setCodingResults(newResults);

    if (allPassed) {
      toast.success('All test cases passed!');
      if (currentProblemIndex < codingProblems.length - 1) {
        setCurrentProblemIndex(currentProblemIndex + 1);
      }
    } else {
      toast.error('Some test cases failed. Try again!');
    }
  };

  const handleSubmit = () => {
    if (roundConfig?.type === 'coding') {
      const passedCount = codingResults.filter(Boolean).length;
      const percentage = (passedCount / codingProblems.length) * 100;
      const passed = percentage >= (roundConfig.passingScore || 60);

      // Clear saved state
      localStorage.removeItem(`quiz-${skillId}-${roundNumber}`);

      if (passed) {
        toast.success(`Round ${roundNumber} completed! Score: ${percentage.toFixed(0)}%`);
        // TODO: Update user progress in Firestore
        router.push(`/assessments?skill=${skillId}&completed=${roundNumber}`);
      } else {
        toast.error(`You need ${roundConfig.passingScore}% to pass. Try again!`);
        setShowResults(true);
      }
    } else {
      // MCQ or Proctored
      const correctCount = answers.filter(
        (answer, index) => answer === questions[index]?.correctAnswer
      ).length;
      const percentage = (correctCount / questions.length) * 100;
      const passed = percentage >= (roundConfig?.passingScore || 70);

      // Clear saved state
      localStorage.removeItem(`quiz-${skillId}-${roundNumber}`);
      sessionStorage.removeItem('camera-approved');

      setShowResults(true);

      if (passed) {
        toast.success(`Round ${roundNumber} completed! Score: ${percentage.toFixed(0)}%`);
      } else {
        toast.error(`You need ${roundConfig?.passingScore}% to pass. Your score: ${percentage.toFixed(0)}%`);
      }
    }
  };

  const handleReturnToAssessments = () => {
    router.push('/assessments');
  };

  if (isLoading || !skill || !roundConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show camera approval for proctored round
  if (roundConfig.type === 'proctored' && !cameraApproved) {
    return (
      <CameraApproval
        onApprove={() => {
          sessionStorage.setItem('camera-approved', 'true');
          setCameraApproved(true);
        }}
        onDeny={() => {
          router.push('/assessments');
        }}
      />
    );
  }

  // Show start screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full glass p-8 rounded-xl text-center"
        >
          <div
            className={`w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center bg-gradient-to-br ${skill.color}`}
          >
            <skill.icon className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">{roundConfig.title}</h1>
          <p className="text-muted-foreground mb-6">{roundConfig.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground">Time Limit</p>
              <p className="font-semibold text-foreground">{roundConfig.timeLimit} minutes</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground">Passing Score</p>
              <p className="font-semibold text-foreground">{roundConfig.passingScore}%</p>
            </div>
          </div>

          {roundConfig.type === 'proctored' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-6">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                This is a proctored assessment. Your camera will be monitored.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReturnToAssessments} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setHasStarted(true)}
              className="flex-1 gradient-primary text-white"
            >
              Start Round {roundNumber}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show results
  if (showResults && (roundConfig.type === 'mcq' || roundConfig.type === 'proctored')) {
    const correctCount = answers.filter(
      (answer, index) => answer === questions[index]?.correctAnswer
    ).length;
    const percentage = (correctCount / questions.length) * 100;
    const passed = percentage >= roundConfig.passingScore;

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full glass p-8 rounded-xl"
        >
          <div className="text-center mb-8">
            <div
              className={cn(
                'w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center',
                passed ? 'bg-green-500' : 'bg-destructive'
              )}
            >
              {passed ? (
                <CheckCircle className="w-10 h-10 text-white" />
              ) : (
                <XCircle className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {passed ? 'Congratulations!' : 'Keep Practicing'}
            </h2>
            <p className="text-muted-foreground mt-2">
              You scored {percentage.toFixed(0)}% ({correctCount}/{questions.length} correct)
            </p>
          </div>

          {/* Question review */}
          <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
            {questions.map((question, index) => {
              const isCorrect = answers[index] === question.correctAnswer;
              return (
                <div
                  key={question.id}
                  className={cn(
                    'p-4 rounded-lg border',
                    isCorrect ? 'border-green-500/50 bg-green-500/10' : 'border-destructive/50 bg-destructive/10'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{question.question}</p>
                      {!isCorrect && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Correct answer: {question.options[question.correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Button onClick={handleReturnToAssessments} className="w-full gradient-primary text-white">
            Return to Assessments
          </Button>
        </motion.div>
      </div>
    );
  }

  // MCQ / Proctored Quiz
  if (roundConfig.type === 'mcq' || roundConfig.type === 'proctored') {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleReturnToAssessments}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-foreground">{skill.name} - Round {roundNumber}</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            <Timer initialMinutes={roundConfig.timeLimit} onTimeUp={handleTimeUp} />
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={cn(
                  'flex-1 h-2 rounded-full transition-colors',
                  index === currentQuestionIndex
                    ? 'bg-primary'
                    : answers[index] !== null
                      ? 'bg-green-500'
                      : 'bg-muted'
                )}
              />
            ))}
          </div>

          {/* Question */}
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-6 rounded-xl mb-6"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">{currentQuestion?.question}</h2>

            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                  className={cn(
                    'w-full p-4 rounded-lg text-left transition-all',
                    'border-2',
                    answers[currentQuestionIndex] === index
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50 text-foreground'
                  )}
                >
                  <span className="font-medium mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                className="gradient-primary text-white"
                disabled={answers.some((a) => a === null)}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))
                }
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Coding Round
  if (roundConfig.type === 'coding') {
    const currentProblem = codingProblems[currentProblemIndex];

    if (!currentProblem) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">No coding problems available for this skill.</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleReturnToAssessments}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-foreground">{skill.name} - Coding Challenge</h1>
                <p className="text-sm text-muted-foreground">
                  Problem {currentProblemIndex + 1} of {codingProblems.length}
                </p>
              </div>
            </div>
            <Timer initialMinutes={roundConfig.timeLimit} onTimeUp={handleTimeUp} />
          </div>

          {/* Problem tabs */}
          <div className="flex gap-2 mb-6">
            {codingProblems.map((problem, index) => (
              <button
                key={problem.id}
                onClick={() => setCurrentProblemIndex(index)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  index === currentProblemIndex
                    ? 'bg-primary text-primary-foreground'
                    : codingResults[index]
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {codingResults[index] && <CheckCircle className="w-4 h-4 inline mr-1" />}
                Problem {index + 1}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Problem description */}
            <div className="glass p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-foreground">{currentProblem.title}</h2>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    currentProblem.difficulty === 'easy' && 'bg-green-500/20 text-green-600',
                    currentProblem.difficulty === 'medium' && 'bg-yellow-500/20 text-yellow-600',
                    currentProblem.difficulty === 'hard' && 'bg-red-500/20 text-red-600'
                  )}
                >
                  {currentProblem.difficulty}
                </span>
              </div>

              <p className="text-muted-foreground mb-6">{currentProblem.description}</p>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Examples:</h3>
                {currentProblem.testCases
                  .filter((tc) => !tc.isHidden)
                  .map((tc, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted">
                      <p className="text-sm font-mono">
                        <span className="text-muted-foreground">Input:</span> {tc.input}
                      </p>
                      <p className="text-sm font-mono mt-1">
                        <span className="text-muted-foreground">Output:</span> {tc.expectedOutput}
                      </p>
                    </div>
                  ))}
              </div>

              {currentProblem.hints.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-foreground mb-2">Hints:</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {currentProblem.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Code editor */}
            <div className="glass p-6 rounded-xl">
              <CodeEditor
                starterCode={currentProblem.starterCode}
                testCases={currentProblem.testCases}
                onSubmit={handleCodingSubmit}
              />
            </div>
          </div>

          {/* Submit all */}
          {codingResults.every(Boolean) && (
            <div className="mt-6 text-center">
              <Button onClick={handleSubmit} className="gradient-primary text-white px-8">
                Submit All Solutions
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
