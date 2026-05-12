import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Download, Copy } from 'lucide-react';

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
  const [hasConfettied, setHasConfettied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const triggerConfetti = () => {
    if (hasConfettied) return;
    setHasConfettied(true);
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
        colors: ['#5499ff', '#9370db', '#60f5ff'],
        disableForReducedMotion: true,
      });
    }
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (svg) {
      const data = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([data], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `credential-${credentialId}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/verify/${credentialId}`);
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
      <div
        className="relative w-full h-full cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => { setIsFlipped(!isFlipped); if (!isFlipped) triggerConfetti(); }}
      >
        <motion.div
          animate={{ opacity: isFlipped ? 0 : 1, pointerEvents: isFlipped ? 'none' : 'auto' }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 glass p-8 rounded-xl flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{title}</h3>
            <p className="text-foreground/60 text-sm">{issuer}</p>
          </div>
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
          <p className="text-xs text-foreground/50 text-center">Click to view QR code</p>
        </motion.div>

        <motion.div
          animate={{ opacity: isFlipped ? 1 : 0, pointerEvents: isFlipped ? 'auto' : 'none' }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 glass p-8 rounded-xl flex flex-col items-center justify-center gap-3"
        >
          <div ref={qrRef} className="bg-white p-3 rounded-lg">
            <QRCodeSVG value={`${window.location.origin}/verify/${credentialId}`} size={140} level="H" includeMargin={false} />
          </div>
          <p className="text-foreground/60 text-xs text-center">Share your credential</p>
          <div className="w-full border-t border-foreground/10 pt-3">
            <p className="text-foreground/50 text-xs mb-1">Blockchain Hash</p>
            <p className="text-foreground/70 font-mono text-xs truncate" title={blockchainHash}>
              {blockchainHash.slice(0, 20)}...
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); handleDownloadQR(); }}
              className="p-2 rounded-lg glass-dark hover:bg-white/20 transition-colors"
              title="Download QR"
            >
              <Download className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}
              className="p-2 rounded-lg glass-dark hover:bg-white/20 transition-colors"
              title="Copy link"
            >
              <Copy className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
