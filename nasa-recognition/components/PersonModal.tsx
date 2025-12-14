'use client';

import { Person, GroupPhoto } from '@/types';
import { useEffect, useRef, useState } from 'react';
import PersonImage from './PersonImage';

interface PersonModalProps {
  person: Person;
  groupPhotos: GroupPhoto[];
  onClose: () => void;
}

export default function PersonModal({ person, groupPhotos, onClose }: PersonModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable swipe from the top handle area on mobile
    const target = e.target as HTMLElement;
    if (target.closest('.swipe-handle') || target.closest('.modal-header')) {
      startY.current = e.touches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    
    // Only allow downward swipes
    if (deltaY > 0) {
      setDragY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If dragged more than 100px, close the modal
    if (dragY > 100) {
      onClose();
    } else {
      // Snap back to original position
      setDragY(0);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-lg animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/80 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 sm:p-10 max-w-2xl w-full shadow-2xl shadow-blue-500/10 animate-slideUp sm:animate-scaleIn max-h-screen sm:max-h-[90vh] overflow-y-auto backdrop-blur-xl transition-transform"
        style={{
          transform: `translateY(${dragY}px)`,
          opacity: dragY > 0 ? Math.max(0.5, 1 - dragY / 300) : 1
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all duration-200 touch-manipulation z-10 backdrop-blur-sm"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Swipe indicator for mobile - now functional */}
        <div className="sm:hidden swipe-handle absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-600 rounded-full cursor-grab active:cursor-grabbing" />

        <div className="flex flex-col gap-6 pt-4 sm:pt-0 modal-header">
          {/* Photo and basic info */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Photo */}
            <div className="w-full sm:w-48 aspect-square rounded-xl overflow-hidden bg-slate-800/50 relative flex-shrink-0 mx-auto sm:mx-0 max-w-xs">
              <PersonImage person={person} groupPhotos={groupPhotos} className="text-5xl sm:text-6xl" />
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col">
              <div className="mb-3">
                <span className={`text-xs sm:text-sm px-3 py-1.5 rounded-full inline-block ${
                  person.category === 'staff' 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : person.category === 'girlfriend'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                      : person.category === 'family'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : person.category === 'sil-lab'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {person.category === 'sil-lab' ? 'SIL Lab' : person.category}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                {person.name}
              </h2>

              {person.description && (
                <div className="bg-white/5 rounded-xl p-5 mb-6 flex-grow border border-white/10 backdrop-blur-sm">
                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light">
                    {person.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* LinkedIn - full width on mobile */}
          {person.linkedIn && (
            <a
              href={person.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600/80 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg transition-all font-medium touch-manipulation backdrop-blur-sm border border-blue-500/50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              View LinkedIn Profile
            </a>
          )}

          {/* Close button at bottom for mobile */}
          <button
            onClick={onClose}
            className="sm:hidden w-full py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg transition-all font-medium touch-manipulation backdrop-blur-sm border border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
