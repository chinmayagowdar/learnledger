import { motion } from 'framer-motion';
import { CheckCircle, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { useEffect, useRef } from 'react';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  title: string;
  issuer: string;
  credentialId: string;
  onDownload?: () => void;
  onShare?: () => void;
  onViewCredential?: () => void;
}

export default function QuizResults({
  score,
  totalQuestions,
  title,
  issuer,
  credentialId,
  onDownload,
  onShare,
  onViewCredential,
}: QuizResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 70;

  useEffect(() => {
    if (containerRef.current && passed) {
      const rect = containerRef.current.getBoundingClientRect();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
        colors: ['#5499ff', '#9370db', '#60f5ff'],
        disableForReducedMotion: true,
      });
    }
  }, [passed]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass p-8 rounded-xl mb-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="mb-6">
          {passed ? (
            <CheckCircle className="w-20 h-20 mx-auto text-green-500 drop-shadow-lg" />
          ) : (
            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center mx-auto">
              <span className="text-4xl font-bold text-yellow-500">!</span>
            </div>
          )}
        </motion.div>

        <h2 className="text-3xl font-bold mb-2">{passed ? 'Congratulations!' : 'Assessment Complete!'}</h2>
        <p className="text-foreground/70 mb-6">
          {passed ? 'You have successfully completed this assessment and earned your credential.' : 'You can retake this assessment to improve your score.'}
        </p>

        <div className="mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
            className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">
            {percentage}%
          </motion.div>
          <p className="text-foreground/70 font-medium">{score} out of {totalQuestions} correct</p>
        </div>

        {passed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-600 font-semibold">Credential Earned</p>
            <p className="text-sm text-foreground/70 mt-1">{title}</p>
          </motion.div>
        )}
      </div>

      {passed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass p-6 rounded-xl mb-8">
          <h3 className="font-bold text-foreground mb-4">Your Credential</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-foreground/60">Credential</p>
              <p className="font-medium">{title}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60">Issued by</p>
              <p className="font-medium">{issuer}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60">Credential ID</p>
              <p className="font-mono text-sm text-foreground/70">{credentialId}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {passed ? (
          <>
            <Button onClick={onDownload} variant="outline" className="rounded-lg">
              <Download className="w-4 h-4 mr-2" />Download
            </Button>
            <Button onClick={onShare} variant="outline" className="rounded-lg">
              <Share2 className="w-4 h-4 mr-2" />Share
            </Button>
            <Button onClick={onViewCredential} className="rounded-lg bg-gradient-to-r from-primary to-accent text-white">
              View Credential
            </Button>
          </>
        ) : (
          <Button className="w-full rounded-lg bg-gradient-to-r from-primary to-accent text-white sm:col-span-3">
            Retake Assessment
          </Button>
        )}
      </div>
    </motion.div>
  );
}
