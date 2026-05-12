import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Question } from '@/lib/store';

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
}: QuizCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Question {currentQuestion + 1} of {totalQuestions}</span>
          <span className="text-sm text-foreground/60">{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="glass p-8 rounded-xl mb-8">
        <h2 className="text-2xl font-bold mb-6 text-foreground">{question.question}</h2>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !isAnswered && onSelectAnswer(index)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${
                selectedAnswer === index
                  ? index === question.correctAnswer && isAnswered
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-primary bg-primary/10'
                  : index === question.correctAnswer && isAnswered
                    ? 'border-green-500 bg-green-500/10'
                    : selectedAnswer !== null && isAnswered && selectedAnswer !== index && index !== question.correctAnswer
                      ? 'border-red-500/30 bg-red-500/5 text-foreground/70'
                      : 'border-border hover:border-primary/50'
              } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${selectedAnswer === index ? 'border-primary bg-primary text-white' : 'border-border'}`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span>{option}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          >
            <p className="text-sm font-medium text-foreground/80">
              <span className="text-blue-500">Explanation:</span> {question.explanation}
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={onPrevious} disabled={currentQuestion === 0} className="rounded-lg">
          Previous
        </Button>
        {isAnswered ? (
          <Button onClick={onNext} className="rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg">
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          </Button>
        ) : (
          <Button onClick={() => onSelectAnswer(selectedAnswer ?? -1)} disabled={selectedAnswer === null} className="rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg">
            Submit Answer
          </Button>
        )}
      </div>
    </motion.div>
  );
}
