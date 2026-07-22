'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { ROCKET_CONFIG } from '@/lib/configs/rocketConfig';
import { setNextLaunchTimestamp } from '@/lib/rocketSchedule';

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return prefersReduced;
}

const {
  ENABLE_ROCKET,
  ROCKET_SIZE,
  ROCKET_SPEED,
  LAUNCH_INITIAL_DELAY_MS,
  BASE_LAUNCH_INTERVAL_MS,
  RANDOMIZE_LAUNCH_INTERVALS,
  LAUNCH_INTERVAL_JITTER_PERCENT,
  VIBRATION_INTENSITY,
  ENGINE_GLOW_OFFSET_X,
  ENGINE_GLOW_OFFSET_Y,
} = ROCKET_CONFIG;

const GLOW_SIZE = ROCKET_SIZE * 0.53;

interface RocketPosition {
  startSide: 'left' | 'right';
  startY: number;
  endY: number;
  rotation: number;
}

function calculateRocketRotation(
  startSide: 'left' | 'right',
  startY: number,
  endY: number
): number {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const totalDistanceX = viewportWidth + 300;
  const deltaX = startSide === 'left' ? totalDistanceX : -totalDistanceX;
  const deltaY = endY - startY;

  const angleFromEast = Math.atan2(deltaY, deltaX);
  return (angleFromEast * 180 / Math.PI) + 90;
}

export default function SLSRocket() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isLaunching, setIsLaunching] = useState(false);
  const [position, setPosition] = useState<RocketPosition | null>(null);
  const [pageHeight, setPageHeight] = useState(0);
  const launchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use ResizeObserver instead of setInterval polling for page height
  useEffect(() => {
    const updatePageHeight = () => {
      setPageHeight(document.documentElement.scrollHeight);
    };

    updatePageHeight();

    // Debounced resize handler
    const handleResize = () => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(updatePageHeight, 200);
    };

    // Use ResizeObserver on body for content changes
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(handleResize);
      observer.observe(document.body);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (observer) observer.disconnect();
      else window.removeEventListener('resize', handleResize);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
  }, []);

  const scheduleLaunch = useCallback(() => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;

    const startSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
    const startY = scrollY + (Math.random() * viewportHeight);
    const endY = scrollY + (Math.random() * viewportHeight);
    const rotation = calculateRocketRotation(startSide, startY, endY);

    setPosition({ startSide, startY, endY, rotation });
    setIsLaunching(true);

    const computeInterval = () => {
      if (!RANDOMIZE_LAUNCH_INTERVALS) return BASE_LAUNCH_INTERVAL_MS;
      const variance = BASE_LAUNCH_INTERVAL_MS * LAUNCH_INTERVAL_JITTER_PERCENT;
      const delta = (Math.random() * 2 * variance) - variance;
      return BASE_LAUNCH_INTERVAL_MS + delta;
    };

    const nextInterval = computeInterval();
    setNextLaunchTimestamp(Date.now() + nextInterval);

    // Reset after animation completes
    animEndTimeoutRef.current = setTimeout(() => {
      setIsLaunching(false);
    }, (ROCKET_SPEED * 1000) + 500);

    // Schedule next launch
    if (launchTimeoutRef.current) clearTimeout(launchTimeoutRef.current);
    launchTimeoutRef.current = setTimeout(scheduleLaunch, nextInterval);
  }, []);

  useEffect(() => {
    if (!ENABLE_ROCKET || pageHeight === 0) return;

    setNextLaunchTimestamp(Date.now() + LAUNCH_INITIAL_DELAY_MS);

    const initialTimeout = setTimeout(scheduleLaunch, LAUNCH_INITIAL_DELAY_MS);

    return () => {
      clearTimeout(initialTimeout);
      if (launchTimeoutRef.current) clearTimeout(launchTimeoutRef.current);
      if (animEndTimeoutRef.current) clearTimeout(animEndTimeoutRef.current);
    };
  }, [pageHeight, scheduleLaunch]);

  if (!ENABLE_ROCKET || prefersReducedMotion || !isLaunching || !position) return null;

  const { startSide, startY, endY, rotation } = position;

  // CSS custom properties consumed by flyRight/flyLeft/rocketVibrate keyframes
  // in globals.css. Flight (outer) and vibration (inner) live on separate
  // elements so both can be pure-transform animations.
  const cssVars = {
    '--delta-y': `${endY - startY}px`,
    '--rotation': `${rotation}deg`,
    '--vibration': `${VIBRATION_INTENSITY}px`,
  } as React.CSSProperties;

  return (
    <div
      className="absolute pointer-events-none z-0"
      style={{
        ...cssVars,
        width: `${ROCKET_SIZE}px`,
        height: `${ROCKET_SIZE * 2}px`,
        top: `${startY}px`,
        willChange: 'transform',
        left: startSide === 'left' ? '-150px' : 'auto',
        right: startSide === 'right' ? '-150px' : 'auto',
        animation: `${startSide === 'left' ? 'flyRight' : 'flyLeft'} ${ROCKET_SPEED}s linear forwards`,
      }}
    >
      <div
        className="relative w-full h-full"
        style={{ animation: 'rocketVibrate 0.1s infinite' }}
      >
      <Image
        src="/SLS.png"
        alt=""
        width={ROCKET_SIZE}
        height={ROCKET_SIZE * 2}
        className="drop-shadow-2xl"
        style={{ height: 'auto' }}
        priority={false}
      />

      {/* Engine glow effect */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-orange-500/60 blur-xl animate-pulse"
        style={{
          width: `${GLOW_SIZE}px`,
          height: `${GLOW_SIZE}px`,
          transform: `translateX(${ENGINE_GLOW_OFFSET_X}%) translateY(${ENGINE_GLOW_OFFSET_Y}%)`
        }}
      />
      </div>
    </div>
  );
}
