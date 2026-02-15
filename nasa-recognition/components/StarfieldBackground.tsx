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

    // Respect user's reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Use fewer stars on mobile for better performance
    const isMobile = window.innerWidth < 768;
    const numStars = isMobile ? Math.floor(STARFIELD_CONFIG.NUM_STARS * 0.5) : STARFIELD_CONFIG.NUM_STARS;

    // Debounced resize
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 200);
    };
    window.addEventListener('resize', handleResize);

    // Create stars
    const stars: Star[] = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * (STARFIELD_CONFIG.MAX_SIZE - STARFIELD_CONFIG.MIN_SIZE) + STARFIELD_CONFIG.MIN_SIZE,
        speed: Math.random() * (STARFIELD_CONFIG.MAX_SPEED - STARFIELD_CONFIG.MIN_SPEED) + STARFIELD_CONFIG.MIN_SPEED,
        opacity: Math.random() * (STARFIELD_CONFIG.MAX_OPACITY - STARFIELD_CONFIG.MIN_OPACITY) + STARFIELD_CONFIG.MIN_OPACITY,
      });
    }

    // If user prefers reduced motion, draw static stars once
    if (prefersReducedMotion) {
      ctx.fillStyle = STARFIELD_CONFIG.BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
      setIsLoaded(true);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (resizeTimer) clearTimeout(resizeTimer);
      };
    }

    // Animation loop with visibility pause
    let animationId: number;
    const animate = () => {
      // Skip rendering when tab is hidden to save CPU/battery
      if (document.hidden) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      ctx.fillStyle = STARFIELD_CONFIG.BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        star.opacity = Math.sin(Date.now() * STARFIELD_CONFIG.TWINKLE_SPEED + star.x) * STARFIELD_CONFIG.TWINKLE_AMPLITUDE + STARFIELD_CONFIG.TWINKLE_BASE;

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    setIsLoaded(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 bg-black transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{
        backgroundColor: '#000',
        background: `linear-gradient(to bottom, ${STARFIELD_CONFIG.GRADIENT_START}, ${STARFIELD_CONFIG.GRADIENT_END})`,
        transitionDuration: `${STARFIELD_CONFIG.FADE_DURATION_MS}ms`
      }}
    />
  );
}
