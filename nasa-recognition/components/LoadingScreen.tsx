'use client';

import { useEffect, useState } from 'react';
import { LOADING_SCREEN_CONFIG } from '@/lib/configs/componentsConfig';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    // Simulate loading progress with a smooth curve
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      // Use easing function for smooth progress (ease-out cubic)
      const rawProgress = currentStep / steps;
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
      setProgress(Math.min(easedProgress * 100, 100));

      if (currentStep >= steps) {
        clearInterval(timer);
        setIsComplete(true);
        // Start fade out
        setTimeout(() => {
          setShouldHide(true);
          setTimeout(() => {
            onLoadingComplete?.();
          }, 600); // Wait for fade out animation
        }, 400);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  if (shouldHide) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 transition-opacity duration-1000 ${
        isComplete ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Subtle animated background stars */}
      {LOADING_SCREEN_CONFIG.SHOW_STARS && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[1px] h-[1px] bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.4 + 0.1,
              }}
            />
          ))}
        </div>
      )}

      {/* Technical Grid Background */}
      {LOADING_SCREEN_CONFIG.SHOW_GRID && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-[-100%] w-[300%] h-[300%] opacity-[0.15] animate-grid-pan"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'perspective(500px) rotateX(60deg)',
              transformOrigin: 'center top',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950" />
        </div>
      )}

      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950/50 to-slate-950 pointer-events-none" />

      {/* Main Content - Floating in void */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        
        {/* Typography */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-2xl">
            MSFC Book of Faces
          </h1>
          <p className="text-slate-500 text-xs font-medium tracking-[0.3em] uppercase opacity-80">
            by Wesley Kamau
          </p>
        </div>

        {/* Ultra Minimal Progress */}
        <div className="w-32 h-[2px] bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.5); }
        }
        @keyframes grid-pan {
          0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
          100% { transform: perspective(500px) rotateX(60deg) translateY(60px); }
        }
        .animate-twinkle {
          animation: twinkle 4s ease-in-out infinite;
        }
        .animate-grid-pan {
          animation: grid-pan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
