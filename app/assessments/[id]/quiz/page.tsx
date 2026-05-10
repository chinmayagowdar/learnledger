'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearnLedgerStore } from '@/lib/store';
import QuizCard from '@/components/quiz-card';
import QuizResults from '@/components/quiz-results';
import SkeletonLoader from '@/components/skeleton-loader';
import { mockAssessments, mockQuestions, mockUser } from '@/lib/mock-data';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const {
    currentQuestionIndex,
    answers,
    setCurrentQuestionIndex,
    addAnswer,
    resetQuiz,
    setCurrentAssessment,
    setAssessmentQuestions,
    updateAssessmentStatus,
    addCredential,
    isLoading,
    setIsLoading,
  } = useLearnLedgerStore();

  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  useEffect(() => {
    // Load assessment and questions
    const assessment = mockAssessments.find((a) => a.id === assessmentId);
    const questions = mockQuestions[assessmentId as keyof typeof mockQuestions] || [];

    if (assessment && questions.length > 0) {
      setCurrentAssessment(assessment);
      setAssessmentQuestions(questions);
      setIsLoading(false);
    }
  }, [assessmentId, setCurrentAssessment, setAssessmentQuestions, setIsLoading]);

  const currentQuestions = Object.values(mockQuestions).flat();
  const assessmentQuestions = mockQuestions[assessmentId as keyof typeof mockQuestions] || [];
  const assessment = mockAssessments.find((a) => a.id === assessmentId);

  if (isLoading || !assessment || assessmentQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SkeletonLoader />
      </div>
    );
  }

  if (showResults) {
    const score = answers.reduce((acc, answer, index) => {
      return answer === assessmentQuestions[index]?.correctAnswer ? acc + 1 : acc;
    }, 0);

    const credential = {
      id: `cred-${Date.now()}`,
      title: assessment.title,
      issuer: 'Tech Academy Pro',
      credentialId: `${assessment.id.toUpperCase()}-${Date.now()}`,
      blockchainHash: `0x${Math.random().toString(16).substring(2)}`,
      date: new Date().toISOString().split('T')[0],
      assessmentId: assessment.id,
      score,
      isVerified: true,
      views: 0,
      shareCount: 0,
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <QuizResults
          score={score}
          totalQuestions={assessmentQuestions.length}
          title={assessment.title}
          issuer="Tech Academy Pro"
          credentialId={credential.credentialId}
          onDownload={() => {
            // Download credential as PDF
            console.log('Download credential');
          }}
          onShare={() => {
            // Share credential
            console.log('Share credential');
          }}
          onViewCredential={() => {
            addCredential(credential);
            updateAssessmentStatus(assessment.id, 'completed', score);
            resetQuiz();
            router.push('/credentials');
          }}
        />
      </div>
    );
  }

  const question = assessmentQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === assessmentQuestions.length - 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
      {/* Back button */}
      <div className="w-full max-w-2xl mb-8">
        <button
          onClick={() => {
            resetQuiz();
            router.back();
          }}
          className="text-foreground/70 hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      </div>

      <AnimatePresence mode="wait">
        <QuizCard
          key={currentQuestionIndex}
          question={question}
          currentQuestion={currentQuestionIndex}
          totalQuestions={assessmentQuestions.length}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={(index) => {
            setSelectedAnswer(index);
          }}
          onNext={() => {
            if (isLastQuestion) {
              setShowResults(true);
            } else {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              setSelectedAnswer(null);
              setIsAnswerSubmitted(false);
            }
          }}
          onPrevious={() => {
            if (currentQuestionIndex > 0) {
              setCurrentQuestionIndex(currentQuestionIndex - 1);
              setSelectedAnswer(answers[currentQuestionIndex - 1] ?? null);
              setIsAnswerSubmitted(true);
            }
          }}
          isLastQuestion={isLastQuestion}
          isAnswered={isAnswerSubmitted || selectedAnswer !== null}
        />
      </AnimatePresence>
    </div>
  );
}
