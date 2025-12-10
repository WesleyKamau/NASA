'use client';

import { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  px: number;
  py: number;
  size: number;
  speed: number;
  vx: number;
  vy: number;
  opacityBase: number;
  twinklePhase: number;
  layer: number;
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const createStars = () => {
      const stars: Star[] = [];
      const layers = [0.25, 0.7, 1.2];
      const counts = [140, 110, 60];

      for (let layer = 0; layer < layers.length; layer++) {
        const count = counts[layer];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const magnitude = 0.15 + Math.random() * 0.55;
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            px: 0,
            py: 0,
            size: Math.random() * (layer === 2 ? 2.2 : 1.4) + (layer === 2 ? 0.8 : 0.3),
            speed: (Math.random() * 0.35 + 0.08) * (0.6 + layer * 0.8),
            vx: Math.cos(angle) * magnitude * (layer + 0.5),
            vy: Math.sin(angle) * magnitude * (layer + 0.5),
            opacityBase: Math.random() * 0.6 + 0.4,
            twinklePhase: Math.random() * Math.PI * 2,
            layer,
          });
        }
      }

      starsRef.current = stars;
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createStars();
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    let animationId: number;
    const centerX = () => canvas.width / 2;
    const centerY = () => canvas.height / 2;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();
      for (const s of starsRef.current) {
        s.px = s.x;
        s.py = s.y;

        s.x += s.vx * s.speed;
        s.y += s.vy * s.speed;

        if (s.x < -60) s.x = canvas.width + 60;
        if (s.x > canvas.width + 60) s.x = -60;
        if (s.y < -60) s.y = canvas.height + 60;
        if (s.y > canvas.height + 60) s.y = -60;

        const tw = Math.sin(now * 0.0011 * (0.6 + s.layer * 0.6) + s.twinklePhase) * 0.3 + 0.7;
        const opacity = Math.max(0.18, Math.min(1, s.opacityBase * tw));

        if (s.layer >= 2 && s.size > 1.4) {
          ctx.strokeStyle = `rgba(255,255,255,${opacity * 0.9})`;
          ctx.lineWidth = s.size * 1.3;
          ctx.beginPath();
          ctx.moveTo(s.px, s.py);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        }

        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.25, s.size * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    
    // Fade in after initialization
    setIsLoaded(true);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}
