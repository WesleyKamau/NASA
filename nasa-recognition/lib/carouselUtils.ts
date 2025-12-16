import { Person } from '@/types';
import { getEffectivePeopleCount, getHighlightDuration, isLastPersonInCycle } from '@/lib/autoCycleUtils';
import { MutableRefObject } from 'react';

export const getPeopleInPhoto = (people: Person[], photoId: string): Person[] => {
  return people.filter(person => person.photoLocations.some(loc => loc.photoId === photoId));
};

export const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export interface AutoCycleTimers {
  highlightTimer: MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  autoCycleResetTimer: MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  transitionDelayTimer: MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
}

export interface StartAutoCycleParams {
  enabled: boolean;
  peopleInPhotoCount: number;
  groupPhotosLength: number;
  setHighlightedPersonIndex: (index: number) => void;
  setCurrentPhotoIndex: (updater: (prev: number) => number) => void;
  timers: AutoCycleTimers;
  currentHighlightIndex?: number; // Optional: current highlight index to avoid resetting mid-cycle
}

// Starts the unified auto-highlight cycle and optional photo advance.
// Returns a cleanup function to clear pending timers.
export const startAutoCycle = ({
  enabled,
  peopleInPhotoCount,
  groupPhotosLength,
  setHighlightedPersonIndex,
  setCurrentPhotoIndex,
  timers,
  currentHighlightIndex = 0,
}: StartAutoCycleParams): (() => void) => {
  // Early exit and no-op cleanup when disabled or nothing to cycle
  if (!enabled || peopleInPhotoCount === 0) {
    return () => {
      if (timers.highlightTimer.current) clearTimeout(timers.highlightTimer.current);
      if (timers.autoCycleResetTimer.current) clearTimeout(timers.autoCycleResetTimer.current);
      if (timers.transitionDelayTimer.current) clearTimeout(timers.transitionDelayTimer.current);
    };
  }

  const effectivePeopleCount = getEffectivePeopleCount(peopleInPhotoCount);
  // Start from current index or 0 if starting fresh
  let currentIndex = Math.min(currentHighlightIndex, effectivePeopleCount - 1);
  
  // Only reset to 0 if we're actually starting from the beginning
  if (currentHighlightIndex === 0) {
    setHighlightedPersonIndex(0);
  }

  const scheduleNext = () => {
    const duration = getHighlightDuration(currentIndex, effectivePeopleCount);

    timers.highlightTimer.current = setTimeout(() => {
      if (isLastPersonInCycle(currentIndex, effectivePeopleCount)) {
        if (groupPhotosLength > 1) {
          if (timers.autoCycleResetTimer.current) clearTimeout(timers.autoCycleResetTimer.current);
          if (timers.transitionDelayTimer.current) clearTimeout(timers.transitionDelayTimer.current);

          timers.transitionDelayTimer.current = setTimeout(() => {
            setCurrentPhotoIndex(prev => (prev + 1) % groupPhotosLength);
            timers.autoCycleResetTimer.current = setTimeout(() => {
              setHighlightedPersonIndex(0);
            }, 400);
          }, 100);
        } else {
          currentIndex = 0;
          setHighlightedPersonIndex(0);
          scheduleNext();
        }
      } else {
        currentIndex++;
        setHighlightedPersonIndex(currentIndex);
        scheduleNext();
      }
    }, duration);
  };

  scheduleNext();

  return () => {
    if (timers.highlightTimer.current) clearTimeout(timers.highlightTimer.current);
    if (timers.autoCycleResetTimer.current) clearTimeout(timers.autoCycleResetTimer.current);
    if (timers.transitionDelayTimer.current) clearTimeout(timers.transitionDelayTimer.current);
  };
};
