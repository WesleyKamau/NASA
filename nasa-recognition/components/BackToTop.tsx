'use client';

import { useState } from 'react';

interface BackToTopProps {
  containerId?: string;
}

export default function BackToTop({ containerId }: BackToTopProps) {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleClick = () => {
    setIsLaunching(true);
    
    // Short delay for animation start
    setTimeout(() => {
      const scrollOptions: ScrollToOptions = { top: 0, behavior: 'smooth' };
      
      if (containerId) {
        const container = document.getElementById(containerId);
        container?.scrollTo(scrollOptions);
      } else {
        // Try multiple scrolling methods for maximum compatibility
        window.scrollTo(scrollOptions);
        document.documentElement.scrollTo(scrollOptions);
        document.body.scrollTo(scrollOptions);
      }
      
      // Reset state after scroll is likely done
      setTimeout(() => {
        setIsLaunching(false);
      }, 1500);
    }, 600); // Reduced delay slightly for better responsiveness
  };

  return (
    <div className="flex justify-center w-full my-16 relative z-50">
      <button
        onClick={handleClick}
        disabled={isLaunching}
        className={`
          group relative px-8 py-3 rounded-full cursor-pointer
          bg-white/10 backdrop-blur-xl border border-white/20
          hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-white/15
          transition-all duration-500 ease-out
          overflow-hidden touch-manipulation
          ${isLaunching ? 'scale-110 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : ''}
        `}
      >
        <div className="relative h-6 w-32">
          {/* Default Text */}
          <div 
            className={`
              absolute inset-0 flex items-center justify-center gap-2 text-slate-300 font-medium text-sm
              transition-all duration-500 transform
              ${isLaunching ? '-translate-y-12 opacity-0' : 'translate-y-0 opacity-100'}
            `}
          >
            <span>Back to Top</span>
            <svg className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
