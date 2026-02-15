'use client';

import { Person, PhotoLocation } from '@/types';

interface CarouselNameTagProps {
  person: Person;
  isVisible: boolean;
  location: PhotoLocation;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'mobile' | 'gradient' | 'desktop';
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
  // Determine styling classes based on variant
  const labelClasses = variant === 'gradient'
    ? "bg-gradient-to-r from-blue-600 to-purple-600 rounded-full px-4 py-2 shadow-lg whitespace-nowrap"
    : "bg-slate-900/95 backdrop-blur-sm border border-blue-400/40 rounded-lg px-3 py-1.5 shadow-[0_0_12px_rgba(96,165,250,0.2)] whitespace-nowrap transition-all duration-300 active:bg-slate-700/95 active:border-blue-400";

  return (
    <div
      className={`absolute z-20 transition-all duration-300 ease-out touch-none select-none ${isVisible ? 'cursor-pointer pointer-events-auto active:scale-95' : 'pointer-events-none'} ${className}`}
      style={{
        top: '100%',
        left: '50%',
        marginTop: '8px',
        transform: 'translateX(-50%)',
        maxWidth: 'calc(100vw - 2rem)',
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
        <p className="text-white font-semibold text-sm sm:text-base truncate">
          {person.name}
        </p>
      </div>
    </div>
  );
}
