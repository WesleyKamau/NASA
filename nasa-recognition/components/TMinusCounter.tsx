'use client';

import { useEffect, useRef, useState } from 'react';
import { ROCKET_CONFIG } from '@/lib/configs/rocketConfig';
import { getNextLaunchTimestamp, subscribeToNextLaunch } from '@/lib/rocketSchedule';

const { LAUNCH_INITIAL_DELAY_MS } = ROCKET_CONFIG;

function formatCountdown(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `T - ${minutes}:${seconds}`;
}

export default function TMinusCounter() {
  const [nextLaunchTs, setNextLaunchTs] = useState(() => getNextLaunchTimestamp() ?? (Date.now() + LAUNCH_INITIAL_DELAY_MS));
  const [now, setNow] = useState(Date.now());
  const [justLaunched, setJustLaunched] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const launchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Use setInterval instead of RAF - more efficient for a simple counter
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 1000); // Update once per second is sufficient for countdown

    const unsubscribe = subscribeToNextLaunch((ts) => {
      setNextLaunchTs(ts);
      setJustLaunched(true);
      // Track timeout for cleanup
      if (launchTimeoutRef.current) clearTimeout(launchTimeoutRef.current);
      launchTimeoutRef.current = setTimeout(() => setJustLaunched(false), 1000);
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (launchTimeoutRef.current) clearTimeout(launchTimeoutRef.current);
      unsubscribe();
    };
  }, []);

  const timeRemaining = Math.max(0, nextLaunchTs - now);
  const isAtZero = timeRemaining <= 0;

  return (
    <div className={`inline-flex items-center gap-2 rounded-md bg-black/50 border border-white/10 px-3 py-2 shadow-[0_0_20px_rgba(0,0,0,0.35)] relative overflow-hidden transition-all duration-300 ${
      justLaunched ? 'scale-105 border-amber-400/30' : ''
    }`}>
      <div className={`h-2 w-2 rounded-full bg-amber-400 transition-all duration-300 ${
        justLaunched ? 'scale-150 bg-amber-300' : 'animate-pulse'
      }`} aria-hidden />
      <p className="font-mono text-xs tracking-[0.25em] text-amber-100 select-none">
        {formatCountdown(timeRemaining)}
      </p>
      {isAtZero && (
        <span className="absolute inset-0 bg-amber-400/10 animate-ping pointer-events-none" aria-hidden />
      )}
    </div>
  );
}
