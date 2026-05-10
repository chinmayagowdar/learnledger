'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraApprovalProps {
  onApproved: () => void;
  onDenied: () => void;
}

export default function CameraApproval({ onApproved, onDenied }: CameraApprovalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const requestCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setStream(mediaStream);
      setHasCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setHasCamera(false);
      setError('Camera access denied. You must approve camera access to proceed with the assessment.');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleContinue = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onApproved();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <div className="glass p-8 rounded-md max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Camera Permission Required</h2>
          <p className="text-sm text-foreground/60">
            This assessment requires camera access for proctoring. Your webcam will be monitored during the test.
          </p>
        </div>

        {hasCamera === null && !error && (
          <div className="space-y-4">
            <Button
              onClick={requestCamera}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              Allow Camera Access
            </Button>
            <Button
              variant="outline"
              onClick={onDenied}
              className="w-full"
            >
              <CameraOff className="w-4 h-4 mr-2" />
              I don&apos;t have a camera
            </Button>
          </div>
        )}

        {hasCamera && stream && (
          <div className="space-y-4">
            <div className="relative rounded-md overflow-hidden bg-muted aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-500/90 text-white text-xs font-medium px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-subtle" />
                Recording
              </div>
            </div>
            <Button onClick={handleContinue} className="w-full">
              Allow &amp; Continue
            </Button>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Camera Access Required</p>
                <p className="text-xs text-foreground/60 mt-1">{error}</p>
              </div>
            </div>
            <Button variant="outline" onClick={requestCamera} className="w-full">
              Try Again
            </Button>
            <Button variant="ghost" onClick={onDenied} className="w-full text-sm">
              I cannot provide camera access
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
