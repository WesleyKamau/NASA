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
      // alpha: rotation around z-axis (0 to 360)
      // beta: front-to-back tilt (-180 to 180)
      // gamma: left-to-right tilt (-90 to 90)
      const alpha = (event.alpha || 0) % 360; // Rotation
      const beta = event.beta || 0; // Front-back
      const gamma = event.gamma || 0; // Left-right
      
      // Use alpha (rotation) for the primary tilt effect
      // Normalize to -1 to 1 range
      const normalizedAlpha = Math.sin((alpha * Math.PI) / 180) * 0.3; // -0.3 to 0.3
      const normalizedGamma = Math.max(-45, Math.min(45, gamma)) / 45 * 0.3; // -0.3 to 0.3
      
      tiltRef.current = {
        x: normalizedGamma,
        y: normalizedAlpha,
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
          console.log('Device orientation permission denied');
        }
      } else {
        // Non-iOS devices
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    // Fallback: use accelerometer via DeviceMotionEvent for better compatibility
    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;
      
      const acc = event.accelerationIncludingGravity;
      const x = acc.x || 0;
      const y = acc.y || 0;
      
      // Normalize acceleration to tilt (clamped to ±9.8 m/s²)
      const tiltX = Math.max(-1, Math.min(1, x / 9.8)) * 0.3;
      const tiltY = Math.max(-1, Math.min(1, y / 9.8)) * 0.3;
      
      tiltRef.current = {
        x: tiltX,
        y: tiltY,
      };
    };

    const requestMotionPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        } catch (error) {
          console.log('Device motion permission denied');
        }
      } else {
        // Non-iOS devices
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    // Try orientation first, then fallback to motion
    requestOrientationPermission();
    requestMotionPermission();

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
      window.removeEventListener('devicemotion', handleMotion);
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
