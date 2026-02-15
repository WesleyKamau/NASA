'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MOBILE_PHOTO_CAROUSEL_CONFIG } from '@/lib/configs/componentsConfig';

// Lazy-load Lottie - it's ~150KB and only needed after a 9-second delay
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface PanGestureHintProps {
  onInteraction?: () => void;
}

export default function PanGestureHint({ onInteraction }: PanGestureHintProps) {
  const [showHint, setShowHint] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInteractedRef = useRef(false);

  const {
    ENABLE_PAN_GESTURE_HINT,
    SHOW_PAN_GESTURE_TEXT,
    PAN_GESTURE_TEXT_CONTENT,
    PAN_GESTURE_HINT_DELAY_MS,
    PAN_GESTURE_HINT_DURATION_MS,
    PAN_GESTURE_FADE_OUT_MS,
    PAN_GESTURE_FADE_BUFFER_MS
  } = MOBILE_PHOTO_CAROUSEL_CONFIG;

  const hideHint = useCallback(() => {
    setIsFadingOut(true);
  }, []);

  const startTimer = useCallback(() => {
    if (!ENABLE_PAN_GESTURE_HINT || hasInteractedRef.current) return;

    // Skip animated hint when user prefers reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (durationTimerRef.current) clearTimeout(durationTimerRef.current);

    timerRef.current = setTimeout(() => {
      if (!hasInteractedRef.current) {
        // Lazy-load animation data only when hint is about to show
        import('./animations/finger_swipe_animation.json').then(mod => {
          setAnimationData(mod.default);
        });
        setShowHint(true);
        setIsFadingOut(false);

        durationTimerRef.current = setTimeout(() => {
          hideHint();
        }, PAN_GESTURE_HINT_DURATION_MS);
      }
    }, PAN_GESTURE_HINT_DELAY_MS);
  }, [ENABLE_PAN_GESTURE_HINT, PAN_GESTURE_HINT_DELAY_MS, PAN_GESTURE_HINT_DURATION_MS, hideHint]);

  const handleInteraction = useCallback(() => {
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

    hideHint();
    setTimeout(() => {
      onInteraction?.();
    }, PAN_GESTURE_FADE_OUT_MS + PAN_GESTURE_FADE_BUFFER_MS);
  }, [hideHint, onInteraction, PAN_GESTURE_FADE_OUT_MS, PAN_GESTURE_FADE_BUFFER_MS]);

  useEffect(() => {
    startTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (durationTimerRef.current) clearTimeout(durationTimerRef.current);
    };
  }, [startTimer]);

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

  if (!ENABLE_PAN_GESTURE_HINT) {
    return null;
  }

  const isVisible = showHint && !isFadingOut;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transition: `opacity ${PAN_GESTURE_FADE_OUT_MS}ms ease-out`,
      }}
      role="status"
      aria-live="polite"
      aria-label={isVisible ? "Pan gesture hint: Swipe to look around the photo" : ""}
    >
      <span className="sr-only">
        {isVisible && "Tip: You can swipe or drag to pan around the photo and explore different areas"}
      </span>

      <div className="relative flex flex-col items-center justify-center">
        <div className="absolute inset-0 -m-6 bg-black/20 rounded-full blur-xl" />

        <div
          className="relative z-10 w-72 h-72 md:w-[500px] md:h-[500px] opacity-75"
        >
          {animationData && (
            <Lottie
              animationData={animationData}
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
          )}
        </div>

        {SHOW_PAN_GESTURE_TEXT && (
          <p className="relative z-10 -mt-12 text-white/90 text-lg font-medium drop-shadow-lg">
            {PAN_GESTURE_TEXT_CONTENT}
          </p>
        )}
      </div>
    </div>
  );
}
