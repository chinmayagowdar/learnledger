'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Share2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { getCredentialStatus } from '@/lib/blockchain-utils';
import SkeletonLoader from '@/components/skeleton-loader';
import { SKILL_LIST } from '@/lib/skills';

interface Credential {
  id: string;
  skillId: string;
  skillTitle: string;
  finalScore: number;
  hash: string;
  issuedAt: string;
  roundScores: number[];
  views: number;
  recipientName?: string;
}

export default function VerificationPage() {
  const params = useParams();
  const hash = params.hash as string;
  const [credential, setCredential] = useState<Credential | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCredential = async () => {
      if (!hash) {
        setError('No credential hash provided.');
        setLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        // Fetch credential by hash with user info (public access via RLS policy)
        const { data: cred, error: fetchError } = await supabase
          .from('credentials')
          .select(`
            *,
            users:user_id (
              email,
              display_name
            )
          `)
          .eq('hash', hash)
          .single();

        if (fetchError || !cred) {
          setError('Credential not found. The hash may be invalid or the credential does not exist.');
          setLoading(false);
          return;
        }

        // Increment views
        await supabase
          .from('credentials')
          .update({ views: (cred.views || 0) + 1 })
          .eq('id', cred.id);

        // Get skill name
        const skill = SKILL_LIST.find(s => s.id === cred.skill_id);

        // Get recipient name from joined user data
        const userData = cred.users as { email?: string; display_name?: string } | null;
        const recipientName = userData?.display_name || userData?.email?.split('@')[0] || 'Verified Credential Holder';

        setCredential({
          id: cred.id,
          skillId: cred.skill_id,
          skillTitle: skill?.name || cred.skill_id,
          finalScore: cred.final_score,
          hash: cred.hash,
          issuedAt: cred.issued_at,
          roundScores: cred.round_scores || [],
          views: cred.views || 0,
          recipientName,
        });
      } catch (err) {
        setError('Failed to verify credential. Please try again later.');
        console.error('Error fetching credential:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCredential();
  }, [hash]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${credential?.skillTitle} Credential`,
          text: `I earned a verified credential in ${credential?.skillTitle}!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonLoader />
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-xl max-w-md w-full text-center space-y-4"
        >
          <AlertCircle className="w-12 h-12 text-accent mx-auto" />
          <h2 className="text-2xl font-bold">Credential Not Found</h2>
          <p className="text-foreground/60">{error || 'This credential could not be verified.'}</p>
          <Button className="w-full" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  // Calculate expiry (1 year from issue date)
  const issuedDate = new Date(credential.issuedAt);
  const expiresDate = new Date(issuedDate);
  expiresDate.setFullYear(expiresDate.getFullYear() + 1);
  
  const status = getCredentialStatus(expiresDate.toISOString());
  const formattedIssuedDate = issuedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedExpiresDate = expiresDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Status Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-xl border-l-4 border-primary"
          >
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold">Credential Verified</h2>
                <p className="text-foreground/60 text-sm">This is a legitimate blockchain-verified credential</p>
              </div>
            </div>
          </motion.div>

          {/* Main Credential Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-8 space-y-6"
          >
            {/* Header */}
            <div className="space-y-4 border-b border-foreground/10 pb-6">
              <h1 className="text-4xl font-bold">{credential.skillTitle}</h1>
              <p className="text-lg text-foreground/70">Professional Certification</p>
            </div>

            {/* Credential Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold mb-2">
                  Recipient
                </p>
                <p className="text-lg font-medium">{credential.recipientName}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold mb-2">
                  Final Score
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${credential.finalScore}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    />
                  </div>
                  <p className="text-lg font-bold text-primary min-w-fit">{credential.finalScore}%</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold mb-2">
                  Issued Date
                </p>
                <p className="text-lg font-medium">{formattedIssuedDate}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold mb-2">
                  Expiration Date
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium">{formattedExpiresDate}</p>
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${status === 'active' ? 'bg-primary/20 text-primary' : status === 'expiring' ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}
                  `}>
                    {status === 'active' ? 'Active' : status === 'expiring' ? 'Expiring Soon' : 'Expired'}
                  </span>
                </div>
              </div>
            </div>

            {/* Round Results */}
            {credential.roundScores && credential.roundScores.length > 0 && (
              <div className="space-y-4 border-t border-foreground/10 pt-6">
                <h3 className="text-xl font-bold">Assessment Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {credential.roundScores.map((score, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="glass p-4 rounded-lg text-center"
                    >
                      <p className="text-sm text-foreground/60 mb-2">Round {index + 1}</p>
                      <p className="text-3xl font-bold text-primary">{score}%</p>
                      <p className="text-xs text-foreground/50 mt-2">
                        {index === 0 ? 'MCQ' : index === 1 ? 'Coding' : 'Proctored'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Blockchain Hash */}
            <div className="space-y-3 border-t border-foreground/10 pt-6">
              <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold">
                Blockchain Hash
              </p>
              <code className="block bg-muted/50 p-4 rounded-lg text-xs font-mono break-all text-foreground/70">
                {credential.hash}
              </code>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-foreground/60 border-t border-foreground/10 pt-6">
              <div>Views: {credential.views}</div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Link Copied!' : 'Copy Link'}
            </Button>
            <Button
              className="flex-1 rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Credential
            </Button>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-foreground/60 space-y-2"
          >
            <p>This credential is permanently recorded on the blockchain</p>
            <p>Anyone can verify its authenticity using this page</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
