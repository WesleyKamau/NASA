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
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-700 ${
        isComplete ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950" />

      {/* Main Content - Glassmorphic Card */}
      <div className="relative z-10 px-8 py-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl max-w-md w-full mx-4">
        
        {/* Content Container */}
        <div className="flex flex-col items-center gap-10">
          
          {/* Typography */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              MSFC Book of Faces
            </h1>
            <p className="text-slate-400 text-xs font-medium tracking-[0.3em] uppercase">
              by Wesley Kamau
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full space-y-3">
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Progress Text */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-light">Loading</span>
              <span className="text-slate-400 font-mono">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Loading Indicator Dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/40"
                style={{
                  animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
