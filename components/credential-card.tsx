'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CredentialCardProps {
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  blockchainHash?: string;
  score?: number;
  delay?: number;
}

export default function CredentialCard({
  title,
  issuer,
  date,
  credentialId,
  blockchainHash = '',
  score,
  delay = 0,
}: CredentialCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `credential-${credentialId}.png`;
      link.click();
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/verify/${credentialId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: 'Link copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 4 }}
      whileInView={{ opacity: 1, translateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      className="h-72"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ perspective: '1000px' }}
        className="relative w-full h-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <motion.div
          animate={{ opacity: isFlipped ? 0 : 1, pointerEvents: isFlipped ? 'none' : 'auto' }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 glass p-6 rounded-md flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md gradient-primary flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-foreground/50">{issuer}</p>
              </div>
            </div>
            {score !== undefined && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full" style={{ width: `${score}%` }} />
                </div>
                <span className="text-xs font-medium text-primary">{score}%</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-xs">
            <div>
              <p className="text-foreground/40">Issued</p>
              <p className="text-foreground/70 font-medium">{date}</p>
            </div>
            <div>
              <p className="text-foreground/40">Credential ID</p>
              <p className="text-foreground/60 font-mono truncate">{credentialId}</p>
            </div>
          </div>

          <p className="text-xs text-foreground/40 text-center">Click to view QR code</p>
        </motion.div>

        {/* Back */}
        <motion.div
          animate={{ opacity: isFlipped ? 1 : 0, pointerEvents: isFlipped ? 'auto' : 'none' }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 glass p-6 rounded-md flex flex-col items-center justify-center gap-2"
        >
          <div ref={qrRef} className="bg-white p-2 rounded-md">
            <QRCodeSVG
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${credentialId}`}
              size={120}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-xs text-foreground/50">Share your credential</p>

          {blockchainHash && (
            <div className="w-full border-t border-border/50 pt-2 mt-1">
              <p className="text-foreground/40 text-xs mb-0.5">Blockchain Hash</p>
              <p className="text-foreground/60 font-mono text-xs truncate" title={blockchainHash}>
                {blockchainHash.slice(0, 24)}...
              </p>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => { e.stopPropagation(); handleDownloadQR(); }}
            >
              <Download className="w-3 h-3 mr-1" />
              QR
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}
            >
              <Copy className="w-3 h-3 mr-1" />
              {copied ? 'Copied' : 'Link'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
