'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { MOBILE_PHOTO_CAROUSEL_CONFIG } from '@/lib/configs/componentsConfig';
import swipeGestureAnimation from './animations/finger_swipe_animation.json';

interface PanGestureHintProps {
  onInteraction?: () => void; // Called when user interacts, to reset timer
  isVisible?: boolean; // Override visibility (for external control)
}

export default function PanGestureHint({ onInteraction, isVisible: externalVisible }: PanGestureHintProps) {
  const [showHint, setShowHint] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInteractedRef = useRef(false);

  const { 
    ENABLE_PAN_GESTURE_HINT, 
    SHOW_PAN_GESTURE_TEXT,
    PAN_GESTURE_TEXT_CONTENT,
    PAN_GESTURE_HINT_DELAY_MS, 
    PAN_GESTURE_HINT_DURATION_MS,
    PAN_GESTURE_FADE_OUT_MS
  } = MOBILE_PHOTO_CAROUSEL_CONFIG;

  // Hide hint and reset timer
  const hideHint = useCallback(() => {
    setIsFadingOut(true);
    // Keep isFadingOut true until parent unmounts - don't reset states here
    // The parent's onInteraction callback will handle unmounting after the transition
  }, []);

  // Start the hint timer
  const startTimer = useCallback(() => {
    if (!ENABLE_PAN_GESTURE_HINT || hasInteractedRef.current) return;
    
    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (durationTimerRef.current) clearTimeout(durationTimerRef.current);
    
    timerRef.current = setTimeout(() => {
      if (!hasInteractedRef.current) {
        setShowHint(true);
        setIsFadingOut(false);
        
        // Auto-hide after duration
        durationTimerRef.current = setTimeout(() => {
          hideHint();
        }, PAN_GESTURE_HINT_DURATION_MS);
      }
    }, PAN_GESTURE_HINT_DELAY_MS);
  }, [ENABLE_PAN_GESTURE_HINT, PAN_GESTURE_HINT_DELAY_MS, PAN_GESTURE_HINT_DURATION_MS, hideHint]);

  // Handle user interaction - hide hint and mark as interacted
  const handleInteraction = useCallback(() => {
    // If we're already fading out due to interaction, don't trigger again
    if (hasInteractedRef.current) return;

    hasInteractedRef.current = true;
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearTimeout(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    
    // Always trigger fade and delay callback - don't check showHint state
    // (closure might be stale if interaction happens right as hint appears)
    hideHint();
    setTimeout(() => {
      onInteraction?.();
    }, PAN_GESTURE_FADE_OUT_MS + 50);
  }, [hideHint, onInteraction, PAN_GESTURE_FADE_OUT_MS]);

  // Start timer on mount
  useEffect(() => {
    startTimer();
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (durationTimerRef.current) clearTimeout(durationTimerRef.current);
    };
  }, [startTimer]);

  // Listen for touch/pan interactions to dismiss
  useEffect(() => {
    const handleTouch = () => handleInteraction();
    const handleWheel = () => handleInteraction();
    
    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    
    return () => {
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleInteraction]);

  // Only disable if feature is off
  if (!ENABLE_PAN_GESTURE_HINT) {
    return null;
  }

  // Determine opacity: visible when showHint is true AND not fading out
  const isVisible = showHint && !isFadingOut;

  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        transition: `opacity ${PAN_GESTURE_FADE_OUT_MS}ms ease-out`,
      }}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Semi-transparent backdrop for better visibility */}
        <div className="absolute inset-0 -m-6 bg-black/20 rounded-full blur-xl" />
        
        {/* Lottie animation container without clipping */}
        <div 
          className="relative z-10 w-72 h-72 md:w-[500px] md:h-[500px] opacity-75"
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={swipeGestureAnimation}
            loop={true}
            autoplay={true}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid meet'
            }}
            style={{ 
              width: '100%', 
              height: '100%',
              filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.3))'
            }}
          />
        </div>
        
        {/* Helper text */}
        {SHOW_PAN_GESTURE_TEXT && (
          <p className="relative z-10 -mt-12 text-white/90 text-lg font-medium drop-shadow-lg">
            {PAN_GESTURE_TEXT_CONTENT}
          </p>
        )}
      </div>
    </div>
  );
}
