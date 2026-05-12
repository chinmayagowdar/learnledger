import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Share2, Eye, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ModernBadgeProps {
  id: string;
  skillTitle: string;
  blockchainHash: string;
  issuedAt: string;
  expiresAt: string;
  score: number;
  isVerified: boolean;
  views: number;
  delay?: number;
}

export default function ModernBadge({ id, skillTitle, blockchainHash, issuedAt, expiresAt, score, isVerified, views, delay = 0 }: ModernBadgeProps) {
  const [copied, setCopied] = useState(false);
  const issuedDate = new Date(issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const expiresDate = new Date(expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`/verify/${blockchainHash}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }} className="group relative">
      <div className="glass rounded-xl overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
        <div className="relative p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">{skillTitle}</h3>
              <p className="text-sm text-foreground/60 mt-1">Blockchain Verified</p>
            </div>
            {isVerified && <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-foreground/60 mb-2">Final Score</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${score}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: delay + 0.2 }} className="h-full bg-gradient-to-r from-primary to-accent rounded-full" />
              </div>
            </div>
            <p className="text-2xl font-bold text-primary min-w-fit">{score}%</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold">Hash</p>
            <code className="block text-xs font-mono break-all text-foreground/70 bg-muted/50 p-3 rounded-lg">{blockchainHash.substring(0, 32)}...</code>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-foreground/60 uppercase tracking-wider font-semibold mb-1">Issued</p>
              <p className="text-sm font-medium">{issuedDate}</p>
            </div>
            <div>
              <p className="text-xs text-foreground/60 uppercase tracking-wider font-semibold mb-1">Expires</p>
              <p className="text-sm font-medium">{expiresDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-foreground/60"><Eye className="w-4 h-4" /><span>{views} views</span></div>
          </div>
          <div className="flex gap-2 pt-4 border-t border-foreground/10">
            <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />{copied ? 'Copied!' : 'Share'}
            </Button>
            <Link href={`/verify/${blockchainHash}`} className="flex-1">
              <Button variant="ghost" size="sm" className="w-full rounded-lg text-primary hover:text-accent">Verify</Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
