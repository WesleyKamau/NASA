'use client';

import { Person, PhotoLocation } from '@/types';
import { useEffect, useState } from 'react';

interface CarouselNameTagProps {
  person: Person;
  isVisible: boolean;
  location: PhotoLocation;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'mobile' | 'gradient';
}

export default function CarouselNameTag({ 
  person, 
  isVisible, 
  location, 
  onClick,
  className = '',
  style = {},
  variant = 'mobile'
}: CarouselNameTagProps) {
  // State to force re-render on resize for positioning (only for mobile variant)
  const [, setForceUpdate] = useState({});

  useEffect(() => {
    // Only attach resize listener for mobile variant which needs complex positioning
    if (variant !== 'mobile') return;
    
    const handleResize = () => setForceUpdate({});
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [variant]);

  // Complex positioning logic for mobile variant to prevent overflow
  // Desktop gradient variant uses simple centering
  let shiftInFacePercent = 0;
  
  if (variant === 'mobile') {
    const faceCenterX = location.x + location.width / 2;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
    const scaleFactor = viewportWidth < 400 ? 1.3 : viewportWidth < 768 ? 1.1 : 0.7;
    const basePadding = viewportWidth < 400 ? 9 : viewportWidth < 768 ? 7 : 5;
    const estimatedLabelWidthPct = person.name.length * scaleFactor + basePadding;
    const halfLabelWidth = estimatedLabelWidthPct / 2;
    const edgeBuffer = viewportWidth < 768 ? 4 : 2;
    const leftOverflow = Math.max(0, (halfLabelWidth + edgeBuffer) - faceCenterX);
    const rightOverflow = Math.max(0, (faceCenterX + halfLabelWidth + edgeBuffer) - 100);
    let horizontalShift = 0;
    if (leftOverflow > 0) horizontalShift = leftOverflow;
    else if (rightOverflow > 0) horizontalShift = -rightOverflow;
    shiftInFacePercent = (horizontalShift / location.width) * 100;
  }

  // Determine styling classes based on variant
  const labelClasses = variant === 'gradient'
    ? "bg-gradient-to-r from-blue-600 to-purple-600 rounded-full px-4 py-2 shadow-lg whitespace-nowrap"
    : "bg-slate-900/95 backdrop-blur-sm border border-blue-500/50 rounded-lg px-3 py-1.5 shadow-xl shadow-blue-500/30 whitespace-nowrap transition-all duration-150 active:bg-slate-700/95 active:border-blue-400 animate-in fade-in slide-in-from-bottom-2 zoom-in-95";

  return (
    <div
      className={`absolute z-20 transition-all duration-300 ease-out touch-none select-none ${isVisible ? 'cursor-pointer pointer-events-auto active:scale-95' : 'pointer-events-none'} ${className}`}
      style={{ 
        top: '100%',
        left: `${50 + shiftInFacePercent}%`,
        marginTop: '8px',
        transform: 'translateX(-50%)',
        ...style
      }}
      onClick={(e) => {
        if (!isVisible) return;
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <div
        className={labelClasses}
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden',
          pointerEvents: isVisible ? 'auto' : 'none',
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        <p className="text-white font-semibold text-xs sm:text-sm md:text-lg">
          {person.name}
        </p>
      </div>
    </div>
  );
}
