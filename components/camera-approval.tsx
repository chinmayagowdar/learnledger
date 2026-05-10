'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, AlertTriangle, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CameraApprovalProps {
  onApprove: () => void;
  onDeny: () => void;
}

type CameraState = 'idle' | 'requesting' | 'active' | 'denied' | 'error';

export default function CameraApproval({ onApprove, onDeny }: CameraApprovalProps) {
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const requestCameraAccess = async () => {
    setCameraState('requesting');
    setErrorMessage('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState('active');
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setCameraState('denied');
          setErrorMessage('Camera access was denied. Please enable camera permissions in your browser settings.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setCameraState('error');
          setErrorMessage('No camera found. Please connect a webcam to continue.');
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          setCameraState('error');
          setErrorMessage('Camera is in use by another application. Please close other apps using the camera.');
        } else {
          setCameraState('error');
          setErrorMessage(`Camera error: ${error.message}`);
        }
      } else {
        setCameraState('error');
        setErrorMessage('An unknown error occurred while accessing the camera.');
      }
    }
  };

  const handleApprove = () => {
    // Stop the stream before proceeding
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    onApprove();
  };

  const handleDeny = () => {
    // Stop the stream before navigating away
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    onDeny();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full glass p-8 rounded-xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={cn(
              'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
              cameraState === 'active' ? 'bg-green-500' : 'bg-primary'
            )}
          >
            {cameraState === 'active' ? (
              <Video className="w-8 h-8 text-white" />
            ) : cameraState === 'denied' || cameraState === 'error' ? (
              <VideoOff className="w-8 h-8 text-white" />
            ) : (
              <Video className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">Camera Required</h1>
          <p className="text-muted-foreground mt-2">
            This is a proctored assessment. Camera access is required to continue.
          </p>
        </div>

        {/* Camera preview */}
        <div className="relative mb-6 rounded-xl overflow-hidden bg-muted aspect-video">
          {cameraState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <VideoOff className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Camera not active</p>
            </div>
          )}

          {cameraState === 'requesting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Requesting camera access...</p>
            </div>
          )}

          {(cameraState === 'denied' || cameraState === 'error') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <XCircle className="w-12 h-12 text-destructive mb-3" />
              <p className="text-sm text-destructive text-center">{errorMessage}</p>
            </div>
          )}

          <video
            ref={videoRef}
            className={cn(
              'w-full h-full object-cover',
              cameraState !== 'active' && 'hidden'
            )}
            autoPlay
            muted
            playsInline
          />

          {cameraState === 'active' && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-green-500 text-white text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Camera Active
            </div>
          )}
        </div>

        {/* Warning notice */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-6">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-600 dark:text-yellow-400">Proctoring Notice</p>
            <p className="text-muted-foreground mt-1">
              Your video will be monitored during this assessment. Ensure you are in a well-lit area
              and your face is clearly visible. Any suspicious activity may result in disqualification.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {cameraState === 'idle' && (
            <Button onClick={requestCameraAccess} className="w-full gradient-primary text-white">
              <Video className="w-4 h-4 mr-2" />
              Enable Camera
            </Button>
          )}

          {cameraState === 'requesting' && (
            <Button disabled className="w-full">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Requesting Access...
            </Button>
          )}

          {cameraState === 'active' && (
            <Button onClick={handleApprove} className="w-full gradient-primary text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue to Assessment
            </Button>
          )}

          {(cameraState === 'denied' || cameraState === 'error') && (
            <>
              <Button onClick={requestCameraAccess} variant="outline" className="w-full">
                Try Again
              </Button>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="text-sm text-destructive font-medium text-center">
                  Camera access is strictly required for proctored assessments.
                  You cannot proceed without enabling your camera.
                </p>
              </div>
            </>
          )}

          <Button onClick={handleDeny} variant="ghost" className="w-full text-muted-foreground">
            Cancel and Return
          </Button>
        </div>

        {/* Help text */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Having trouble? Make sure your browser has permission to access your camera.
          Check your browser settings or try a different browser.
        </p>
      </motion.div>
    </div>
  );
}
