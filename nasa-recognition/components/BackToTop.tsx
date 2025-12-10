'use client';

import { useState } from 'react';

interface BackToTopProps {
  containerId?: string;
}

export default function BackToTop({ containerId }: BackToTopProps) {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleClick = () => {
    setIsLaunching(true);
    
    setTimeout(() => {
      if (containerId) {
        const container = document.getElementById(containerId);
        container?.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Reset state after scroll is likely done
      setTimeout(() => {
        setIsLaunching(false);
      }, 1500);
    }, 800);
  };

  return (
    <div className="flex justify-center w-full my-12">
      <button
        onClick={handleClick}
        disabled={isLaunching}
        className={`
          group relative px-8 py-4 rounded-full 
          bg-slate-900/80 backdrop-blur-sm border border-slate-700
          hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20
          transition-all duration-500 ease-out
          overflow-hidden
          ${isLaunching ? 'scale-110 border-blue-400 shadow-blue-500/40' : ''}
        `}
      >
        <div className="relative h-6 w-32">
          {/* Default Text */}
          <div 
            className={`
              absolute inset-0 flex items-center justify-center gap-2 text-slate-300 font-medium
              transition-all duration-500 transform
              ${isLaunching ? '-translate-y-12 opacity-0' : 'translate-y-0 opacity-100'}
            `}
          >
            <span>Back to Top</span>
            <svg className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>

          {/* Launch Text */}
          <div 
            className={`
              absolute inset-0 flex items-center justify-center gap-2 text-blue-400 font-bold
              transition-all duration-500 transform
              ${isLaunching ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
            `}
          >
            <span>Liftoff!</span>
            <span className="animate-bounce">🚀</span>
          </div>
        </div>
      </button>
    </div>
  );
}
