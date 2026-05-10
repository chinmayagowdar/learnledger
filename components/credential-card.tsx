'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Share2, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CredentialCardProps {
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  blockchainHash?: string;
  delay?: number;
}

export default function CredentialCard({
  title,
  issuer,
  date,
  credentialId,
  blockchainHash = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  delay = 0,
}: CredentialCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [hasConfettied, setHasConfettied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const triggerConfetti = () => {
    if (hasConfettied) return;
    setHasConfettied(true);
    
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#5499ff', '#9370db', '#60f5ff'],
        disableForReducedMotion: true,
      });
    }
  };

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
    const link = `https://learnledger.io/verify/${credentialId}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="h-80"
      ref={cardRef}
    >
      {/* Card Container */}
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ perspective: '1000px' }}
        className="relative w-full h-full cursor-pointer"
        onClick={() => {
          setIsFlipped(!isFlipped);
          if (!isFlipped) triggerConfetti();
        }}
      >
        {/* Front of Card */}
        <motion.div
          animate={{ opacity: isFlipped ? 0 : 1, pointerEvents: isFlipped ? 'none' : 'auto' }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 glass p-8 rounded-xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{title}</h3>
            <p className="text-foreground/60 text-sm">{issuer}</p>
          </div>

          {/* Date and ID */}
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-foreground/50 text-xs">Issued</p>
              <p className="text-foreground font-medium">{date}</p>
            </div>
            <div>
              <p className="text-foreground/50 text-xs">Credential ID</p>
              <p className="text-foreground font-mono text-xs truncate">{credentialId}</p>
            </div>
          </div>

          {/* Click hint */}
          <p className="text-xs text-foreground/50 text-center">Click to view QR code</p>
        </motion.div>

        {/* Back of Card (QR Code) */}
        <motion.div
          animate={{ opacity: isFlipped ? 1 : 0, pointerEvents: isFlipped ? 'auto' : 'none' }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 glass p-8 rounded-xl flex flex-col items-center justify-center gap-3"
        >
          <div ref={qrRef} className="bg-white p-3 rounded-lg">
            <QRCodeSVG
              value={`https://learnledger.io/verify/${credentialId}`}
              size={160}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-foreground/60 text-xs text-center">Share your credential</p>
          
          {/* Blockchain Hash */}
          <div className="w-full border-t border-foreground/10 pt-3 mt-1">
            <p className="text-foreground/50 text-xs mb-1">Blockchain Hash</p>
            <p className="text-foreground/70 font-mono text-xs truncate break-all hover:break-normal cursor-pointer" title={blockchainHash}>
              {blockchainHash.slice(0, 20)}...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadQR();
              }}
              className="p-2 rounded-lg glass-dark hover:bg-white/20 transition-colors"
              title="Download QR"
            >
              <Download className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCopyLink();
              }}
              className="p-2 rounded-lg glass-dark hover:bg-white/20 transition-colors"
              title="Copy link"
            >
              <Copy className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Share Button (Outside Card) */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.3 }}
        onClick={() => setShowShare(!showShare)}
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </motion.button>
    </motion.div>
  );
}
