import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Trophy,
  TrendingUp,
  Shield,
  Share2,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'wouter';

interface ResumeData {
  id: string;
  file_name: string;
  ai_score: number;
  ai_feedback: string;
  blockchain_hash: string;
  is_verified: boolean;
  created_at: string;
}

interface BlockchainData {
  tx_hash: string;
  block_number: number;
  status: string;
  chain_id: string;
}

export default function ResumeResultPage({ resumeId }: { resumeId: string }) {
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [blockchain, setBlockchain] = useState<BlockchainData | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const response = await fetch(`/api/resumes/${resumeId}`);
        if (!response.ok) throw new Error('Resume not found');

        const data = await response.json();
        setResume(data.resume);
        setBlockchain(data.blockchain);
      } catch (err: any) {
        setError(err.message || 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto rounded-full border-4 border-primary border-t-transparent"
          />
          <p className="text-foreground/60">Loading resume analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-500">Error</p>
              <p className="text-sm text-foreground/70 mt-1">{error}</p>
            </div>
          </motion.div>
          <Button onClick={() => navigate('/resume/upload')} className="rounded-lg">
            Back to Upload
          </Button>
        </div>
      </div>
    );
  }

  const scorePercentage = resume.ai_score || 0;
  const scoreColor =
    scorePercentage >= 80
      ? 'text-green-500'
      : scorePercentage >= 60
        ? 'text-yellow-500'
        : 'text-red-500';

  const scoreGradient =
    scorePercentage >= 80
      ? 'from-green-500 to-emerald-500'
      : scorePercentage >= 60
        ? 'from-yellow-500 to-orange-500'
        : 'from-red-500 to-pink-500';

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-2">Resume Analysis Results</h1>
          <p className="text-foreground/60">Your resume has been analyzed and registered on the blockchain.</p>
        </motion.div>

        {/* Main result card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-8 space-y-6"
        >
          {/* AI Score */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground/60 mb-2">AI SCORE</p>
              <h2 className={`text-5xl font-bold ${scoreColor}`}>{scorePercentage}/100</h2>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${scoreGradient} p-1`}
            >
              <div className="absolute inset-0 rounded-full bg-background m-1 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-foreground/20" />
              </div>
            </motion.div>
          </div>

          {/* File info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-y border-foreground/10">
            {[
              ['File Name', resume.file_name],
              ['Analysis Date', new Date(resume.created_at).toLocaleDateString()],
              ['Verification', resume.is_verified ? '✓ Verified' : 'Pending'],
              ['Chain ID', blockchain?.chain_id || 'LearnLedger Mainnet'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold mb-1">{label}</p>
                <p className="font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {/* AI Feedback */}
          <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-foreground/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">AI Feedback</h3>
            </div>
            <p className="text-foreground/70 leading-relaxed">{resume.ai_feedback}</p>
          </div>
        </motion.div>

        {/* Blockchain verification card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-8 space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Blockchain Verification</h2>
          </div>

          {blockchain && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Status: {blockchain.status}</p>
                  <p className="text-xs text-foreground/60">Your resume is registered on the blockchain</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-background/50 rounded-lg border border-foreground/10">
                {[
                  ['Transaction Hash', blockchain.tx_hash.substring(0, 16) + '...'],
                  ['Block Number', `#${blockchain.block_number.toLocaleString()}`],
                  ['Status', blockchain.status],
                  ['Network', blockchain.chain_id],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold mb-1">
                      {label}
                    </p>
                    <p className="font-mono text-sm font-semibold break-all">{value}</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate(`/blockchain/${blockchain.tx_hash}`)}
                variant="outline"
                className="w-full rounded-lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Block Explorer
              </Button>
            </div>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button className="flex-1 bg-gradient-to-r from-primary to-accent text-white rounded-lg" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-lg"
            onClick={() => {
              navigator.clipboard.writeText(
                `Check out my resume analysis: ${window.location.href}`,
              );
              alert('Link copied to clipboard!');
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Result
          </Button>
          <Button
            variant="ghost"
            className="flex-1 rounded-lg"
            onClick={() => navigate('/resume/upload')}
          >
            Upload Another
          </Button>
        </motion.div>

        {/* Tips section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6 space-y-4"
        >
          <h3 className="font-semibold text-lg">How to improve your score</h3>
          <ul className="space-y-3 text-sm text-foreground/70">
            {[
              'Add specific technical skills and technologies you know',
              'Include quantifiable achievements and metrics',
              'Highlight leadership experience and promotions',
              'Add relevant certifications and education',
              'Use clear formatting and professional language',
            ].map((tip, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">{idx + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
