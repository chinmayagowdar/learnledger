'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Download, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  title: string;
  issuer: string;
  credentialId: string;
  onDownload?: () => void;
  onShare?: () => void;
  onViewCredential?: () => void;
  onRetake?: () => void;
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
  onRetake,
}: QuizResultsProps) {
  const { toast } = useToast();
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 70;

  const handleCopyLink = () => {
    const link = `${window.location.origin}/verify/${credentialId}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Verification link copied' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 4 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Result Card */}
      <div className="glass p-8 rounded-md mb-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          {passed ? (
            <CheckCircle className="w-14 h-14 mx-auto text-green-500" />
          ) : (
            <div className="w-14 h-14 mx-auto rounded-full border-2 border-yellow-500/50 flex items-center justify-center text-yellow-500 text-2xl font-bold">
              !
            </div>
          )}
        </motion.div>

        <h2 className="text-2xl font-semibold mb-1.5 text-foreground">
          {passed ? 'Round Passed' : 'Round Not Passed'}
        </h2>
        <p className="text-foreground/60 text-sm mb-6">
          {passed
            ? 'You met the 70% threshold for this round.'
            : 'Score 70% or higher to pass. You can retake this round.'}
        </p>

        {/* Score Display */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-1"
          >
            {percentage}%
          </motion.div>
          <p className="text-foreground/60 text-sm font-medium">
            {score} out of {totalQuestions} correct
          </p>
        </div>

        {/* Status */}
        {passed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-3 bg-green-500/8 border border-green-500/20 rounded-md"
          >
            <p className="text-green-600 text-sm font-medium">Credential earned for {title}</p>
          </motion.div>
        )}
      </div>

      {/* Credential Info */}
      {passed && (
        <motion.div
          initial={{ opacity: 0, translateY: 4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-5 rounded-md mb-6"
        >
          <h3 className="font-semibold text-foreground mb-3 text-sm">Your Credential</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/50">Credential</span>
              <span className="font-medium text-foreground">{title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Issued by</span>
              <span className="font-medium text-foreground">{issuer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Credential ID</span>
              <span className="font-mono text-xs text-foreground/70">{credentialId}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {passed ? (
          <>
            <Button
              onClick={onDownload}
              variant="outline"
              className="rounded-md"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download
            </Button>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="rounded-md"
            >
              <Copy className="w-4 h-4 mr-1.5" />
              Copy Link
            </Button>
            <Button
              onClick={onViewCredential}
              className="rounded-md gradient-primary text-white"
            >
              View Credential
            </Button>
          </>
        ) : (
          <Button
            onClick={onRetake}
            className="w-full rounded-md gradient-primary text-white sm:col-span-3"
          >
            Retake Round
          </Button>
        )}
      </div>
    </motion.div>
  );
}
