'use client';

import { useEffect, useRef, useState } from 'react';
import { STARFIELD_CONFIG } from '@/lib/configs/componentsConfig';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars
    const stars: Star[] = [];
    const numStars = STARFIELD_CONFIG.NUM_STARS;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * (STARFIELD_CONFIG.MAX_SIZE - STARFIELD_CONFIG.MIN_SIZE) + STARFIELD_CONFIG.MIN_SIZE,
        speed: Math.random() * (STARFIELD_CONFIG.MAX_SPEED - STARFIELD_CONFIG.MIN_SPEED) + STARFIELD_CONFIG.MIN_SPEED,
        opacity: Math.random() * (STARFIELD_CONFIG.MAX_OPACITY - STARFIELD_CONFIG.MIN_OPACITY) + STARFIELD_CONFIG.MIN_OPACITY,
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.fillStyle = STARFIELD_CONFIG.BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // Update position
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        // Twinkle effect
        star.opacity = Math.sin(Date.now() * STARFIELD_CONFIG.TWINKLE_SPEED + star.x) * STARFIELD_CONFIG.TWINKLE_AMPLITUDE + STARFIELD_CONFIG.TWINKLE_BASE;

        // Draw star
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

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
      className={`fixed inset-0 pointer-events-none z-0 transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        background: `linear-gradient(to bottom, ${STARFIELD_CONFIG.GRADIENT_START}, ${STARFIELD_CONFIG.GRADIENT_END})`,
        transitionDuration: `${STARFIELD_CONFIG.FADE_DURATION_MS}ms`
      }}
    />
  );
}
