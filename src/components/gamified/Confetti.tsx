import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

export default function Confetti({ active, onComplete }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    const colors = [
      '#06b6d4', // cyan
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ec4899', // pink
      '#8b5cf6', // purple
      '#3b82f6', // blue
    ];

    const particles: Particle[] = [];
    const numParticles = 120;

    // Initialize particles originating from the bottom left and bottom right corners
    for (let i = 0; i < numParticles; i++) {
      const fromLeft = i < numParticles / 2;
      particles.push({
        x: fromLeft ? 50 : width - 50,
        y: height - 50,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (fromLeft ? 1 : -1) * (Math.random() * 10 + 5),
        speedY: -(Math.random() * 15 + 10),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    let frames = 0;
    const maxFrames = 180; // ~3 seconds of confetti

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        // Apply physics
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.4; // gravity
        p.speedX *= 0.98; // wind resistance
        p.rotation += p.rotationSpeed;

        // Draw particle (rectangle rotating)
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < maxFrames) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] w-screen h-screen"
    />
  );
}
