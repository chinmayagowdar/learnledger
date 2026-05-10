'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Question } from '@/lib/store';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLastQuestion: boolean;
  isAnswered: boolean;
  scorePreview?: { correct: number; total: number };
}

export default function QuizCard({
  question,
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  onPrevious,
  isLastQuestion,
  isAnswered,
  scorePreview,
}: QuizCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, translateY: 4 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-1.5">
          <span className="text-sm font-medium text-foreground">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-foreground/50">
            {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Score Preview */}
      {scorePreview && scorePreview.total > 0 && (
        <div className="mb-4 flex items-center gap-2 text-xs">
          <span className="text-foreground/50">Running score:</span>
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-3 h-3" />
            {scorePreview.correct}
          </span>
          <span className="text-foreground/30">/</span>
          <span>{scorePreview.total}</span>
        </div>
      )}

      {/* Question Card */}
      <div className="glass p-6 rounded-md mb-6">
        <h2 className="text-xl font-semibold mb-5 text-foreground">{question.question}</h2>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctAnswer;
            const showCorrect = isAnswered && isCorrect;
            const showWrong = isAnswered && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => !isAnswered && onSelectAnswer(index)}
                disabled={isAnswered}
                className={`w-full p-3.5 rounded-md border transition-colors text-left text-sm font-medium ${
                  showCorrect
                    ? 'border-green-500/50 bg-green-500/8 text-foreground'
                    : showWrong
                      ? 'border-red-500/40 bg-red-500/5 text-foreground/70'
                      : isSelected && !isAnswered
                        ? 'border-primary/50 bg-primary/5 text-foreground'
                        : 'border-border hover:border-primary/30 text-foreground/80'
                } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      showCorrect
                        ? 'border-green-500 bg-green-500 text-white'
                        : showWrong
                          ? 'border-red-500 bg-red-500 text-white'
                          : isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-border'
                    }`}
                  >
                    {showCorrect ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : showWrong ? (
                      <XCircle className="w-3 h-3" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mt-5 p-3.5 bg-primary/5 border border-primary/20 rounded-md"
          >
            <p className="text-sm text-foreground/70">
              <span className="font-medium text-primary">Explanation:</span> {question.explanation}
            </p>
          </motion.div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentQuestion === 0}
          className="rounded-md"
        >
          Previous
        </Button>

        {isAnswered ? (
          <Button
            onClick={onNext}
            className="rounded-md gradient-primary text-white"
          >
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          </Button>
        ) : (
          <Button
            onClick={() => onSelectAnswer(selectedAnswer ?? -1)}
            disabled={selectedAnswer === null}
            className="rounded-md gradient-primary text-white"
          >
            Submit Answer
          </Button>
        )}
      </div>
    </motion.div>
  );
}
