'use client';

import { useEffect, useRef, useState } from 'react';

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
  const tiltRef = useRef({ x: 0, y: 0 }); // Store device tilt

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

    // Device orientation handler
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // beta: front-to-back tilt (-180 to 180), use for horizontal movement
      // gamma: left-to-right tilt (-90 to 90), use for horizontal movement
      const beta = event.beta || 0; // Front-back tilt
      const gamma = event.gamma || 0; // Left-right tilt
      
      // Normalize and scale down for subtle effect
      // Clamp gamma to ±30 degrees for reasonable range
      const normalizedGamma = Math.max(-30, Math.min(30, gamma)) / 30; // -1 to 1
      const normalizedBeta = Math.max(-30, Math.min(30, beta - 90)) / 30; // -1 to 1, offset by 90 for portrait
      
      // Apply subtle multiplier (0.3 = max 30% speed in that direction)
      tiltRef.current = {
        x: normalizedGamma * 0.3,
        y: normalizedBeta * 0.3,
      };
    };

    // Request permission for iOS 13+
    const requestOrientationPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (error) {
          console.log('Device orientation not supported or permission denied');
        }
      } else {
        // Non-iOS devices
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    // Try to add orientation listener (will work automatically on Android, needs permission on iOS)
    requestOrientationPermission();

    // Create stars
    const stars: Star[] = [];
    const numStars = 200;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5 + 0.5,
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const tilt = tiltRef.current;

      stars.forEach((star) => {
        // Update position with base speed + tilt offset
        star.y += star.speed + (tilt.y * star.speed);
        star.x += tilt.x * star.speed;
        
        // Wrap around edges
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
        if (star.x > canvas.width) {
          star.x = 0;
        }
        if (star.x < 0) {
          star.x = canvas.width;
        }

        // Twinkle effect
        star.opacity = Math.sin(Date.now() * 0.001 + star.x) * 0.3 + 0.7;

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
      window.removeEventListener('deviceorientation', handleOrientation);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'linear-gradient(to bottom, #030712, #0f172a)' }}
    />
  );
}
