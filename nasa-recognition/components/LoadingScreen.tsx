'use client';

import { useEffect, useState } from 'react';
import { LOADING_SCREEN_CONFIG } from '@/lib/configs/componentsConfig';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  assetsLoaded: boolean;
  fontsLoaded: boolean;
}

export default function LoadingScreen({ onLoadingComplete, assetsLoaded, fontsLoaded }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Ensure minimum display time for smooth UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, LOADING_SCREEN_CONFIG.MIN_LOADING_TIME_MS);

    return () => clearTimeout(timer);
  }, []);

  // Smooth progress animation that follows actual loading
  useEffect(() => {
    const targetProgress = fontsLoaded && assetsLoaded ? 100 : 
                          fontsLoaded ? 60 : 
                          assetsLoaded ? 70 : 30;

    const animateProgress = () => {
      setProgress(current => {
        const diff = targetProgress - current;
        if (Math.abs(diff) < 0.1) return targetProgress;
        // Faster interpolation for more responsive feel
        return current + diff * 0.2;
      });
    };

    const interval = setInterval(animateProgress, 30);
    return () => clearInterval(interval);
  }, [fontsLoaded, assetsLoaded]);

  // Complete when min time elapsed, all assets loaded, AND progress bar reached 100%
  useEffect(() => {
    if (minTimeElapsed && assetsLoaded && fontsLoaded && progress >= 100) {
      setIsComplete(true);
      setTimeout(() => {
        setShouldHide(true);
        setTimeout(() => {
          onLoadingComplete?.();
        }, 300);
      }, 150);
    }
  }, [minTimeElapsed, assetsLoaded, fontsLoaded, progress, onLoadingComplete]);

  if (shouldHide) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-400 ${
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
