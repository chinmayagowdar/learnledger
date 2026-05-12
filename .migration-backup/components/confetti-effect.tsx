'use client';

import { useEffect, useRef } from 'react';

interface Confetto {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  life: number;
}

interface ConfettiEffectProps {
  trigger?: boolean;
  onComplete?: () => void;
}

export default function ConfettiEffect({ trigger, onComplete }: ConfettiEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<Confetto[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#5499FF', '#9370DB', '#8A7EFF', '#FF6B9D', '#FFB951'];

    const createConfetti = () => {
      confettiRef.current = [];
      for (let i = 0; i < 100; i++) {
        confettiRef.current.push({
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * 5 + 5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiRef.current = confettiRef.current.filter((confetto) => {
        // Update position
        confetto.x += confetto.vx;
        confetto.y += confetto.vy;
        confetto.vy += 0.1; // Gravity
        confetto.rotation += confetto.rotationSpeed;
        confetto.life -= 0.01;

        // Draw confetto
        ctx.save();
        ctx.globalAlpha = confetto.life;
        ctx.translate(confetto.x, confetto.y);
        ctx.rotate(confetto.rotation);
        ctx.fillStyle = confetto.color;
        ctx.fillRect(
          -confetto.size / 2,
          -confetto.size / 2,
          confetto.size,
          confetto.size
        );
        ctx.restore();

        return confetto.life > 0 && confetto.y < canvas.height;
      });

      if (confettiRef.current.length > 0) {
        requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    };

    const handleTrigger = () => {
      createConfetti();
      animate();
    };

    if (trigger) {
      handleTrigger();
    }

    return () => {
      confettiRef.current = [];
    };
  }, [trigger, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
