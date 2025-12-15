'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { ROCKET_CONFIG } from '@/lib/configs/rocketConfig';
import { setNextLaunchTimestamp } from '@/lib/rocketSchedule';

// Destructure config for easier access
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

// Calculate glow size based on rocket size (approx 50% of rocket width)
const GLOW_SIZE = ROCKET_SIZE * 0.53;

interface RocketPosition {
  startSide: 'left' | 'right';
  startY: number; // pixels
  endY: number; // pixels
  rotation: number;
}

/**
 * Calculate rocket rotation angle based on trajectory.
 * @param startSide - Which side the rocket starts from
 * @param startY - Starting Y position (pixels)
 * @param endY - Ending Y position (pixels)
 * @returns Rotation angle in degrees (0° = north/up)
 */
function calculateRocketRotation(
  startSide: 'left' | 'right',
  startY: number,
  endY: number
): number {
  // Calculate the trajectory vector
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  // The rocket travels from -150px to 100vw + 150px, so total X distance is viewportWidth + 300
  const totalDistanceX = viewportWidth + 300;
  const deltaX = startSide === 'left' ? totalDistanceX : -totalDistanceX;
  const deltaY = endY - startY; // Positive when going down, negative when going up
  
  const angleFromEast = Math.atan2(deltaY, deltaX);
  const rotation = (angleFromEast * 180 / Math.PI) + 90;
  
  return rotation;
}

export default function SLSRocket() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [position, setPosition] = useState<RocketPosition | null>(null);
  const [pageHeight, setPageHeight] = useState(0);
  const launchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get total page height on mount and window resize
  useEffect(() => {
    const updatePageHeight = () => {
      setPageHeight(document.documentElement.scrollHeight);
    };
    
    updatePageHeight();
    window.addEventListener('resize', updatePageHeight);
    
    // Also update when content loads
    const interval = setInterval(updatePageHeight, 1000);
    const timeoutId = setTimeout(() => clearInterval(interval), 5000);
    
    return () => {
      window.removeEventListener('resize', updatePageHeight);
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!ENABLE_ROCKET || pageHeight === 0) return;
    
    // Set initial countdown target immediately
    setNextLaunchTimestamp(Date.now() + LAUNCH_INITIAL_DELAY_MS);

    const computeInterval = () => {
      if (!RANDOMIZE_LAUNCH_INTERVALS) return BASE_LAUNCH_INTERVAL_MS;
      const variance = BASE_LAUNCH_INTERVAL_MS * LAUNCH_INTERVAL_JITTER_PERCENT;
      const delta = (Math.random() * 2 * variance) - variance; // range [-variance, +variance]
      return BASE_LAUNCH_INTERVAL_MS + delta;
    };

    const scheduleLaunch = () => {
      console.log('🚀 SLS Rocket Launch Initiated');
      
      // Get current scroll position
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      
      console.log('📊 Scroll Info:', {
        scrollY,
        viewportHeight,
        pageHeight,
        visibleStart: scrollY,
        visibleEnd: scrollY + viewportHeight
      });
      
      // Randomly choose which side to start from
      const startSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
      
      // Random Y positions in pixels (within current viewport)
      const startY = scrollY + (Math.random() * viewportHeight);
      const endY = scrollY + (Math.random() * viewportHeight);
      
      console.log('📍 Rocket Positions:', {
        startSide,
        startY: `${startY.toFixed(2)}px`,
        endY: `${endY.toFixed(2)}px`,
        startYRelativeToViewport: `${(startY - scrollY).toFixed(2)}px`,
        endYRelativeToViewport: `${(endY - scrollY).toFixed(2)}px`
      });
      
      // Calculate rotation to match trajectory
      const rotation = calculateRocketRotation(startSide, startY, endY);
      
      console.log('🔄 Rocket Rotation:', `${rotation.toFixed(2)}°`);

      setPosition({
        startSide,
        startY,
        endY,
        rotation,
      });
      
      setIsLaunching(true);
      const nextInterval = computeInterval();
      setNextLaunchTimestamp(Date.now() + nextInterval);
      console.log('✅ Rocket Launch Scheduled');

      // Reset after animation completes
      setTimeout(() => {
        setIsLaunching(false);
        console.log('🏁 Rocket Animation Complete');
      }, (ROCKET_SPEED * 1000) + 500); // Add 500ms buffer to ensure it's off screen

      // Schedule next launch with potential jitter
      if (launchTimeoutRef.current) clearTimeout(launchTimeoutRef.current);
      launchTimeoutRef.current = setTimeout(scheduleLaunch, nextInterval);
    };

    // Initial launch after configured delay
    const initialTimeout = setTimeout(() => {
      scheduleLaunch();
    }, LAUNCH_INITIAL_DELAY_MS);

    return () => {
      clearTimeout(initialTimeout);
      if (launchTimeoutRef.current) clearTimeout(launchTimeoutRef.current);
    };
  }, [pageHeight]);

  if (!ENABLE_ROCKET || !isLaunching || !position) return null;

  const { startSide, startY, endY, rotation } = position;

  return (
    <div
      className="absolute pointer-events-none z-0"
      style={{
        width: `${ROCKET_SIZE}px`,
        height: `${ROCKET_SIZE * 2}px`,
        top: `${startY}px`,
        willChange: 'transform',
        left: startSide === 'left' ? '-150px' : 'auto',
        right: startSide === 'right' ? '-150px' : 'auto',
        transform: `rotate(${rotation}deg)`,
        animation: `
          ${startSide === 'left' ? 'flyRightPixels' : 'flyLeftPixels'} ${ROCKET_SPEED}s linear forwards,
          rocketVibrate 0.1s infinite
        `,
      }}
    >
      <style jsx>{`
        @keyframes flyRightPixels {
          from {
            left: -150px;
            top: ${startY}px;
          }
          to {
            left: calc(100vw + 300px);
            top: ${endY}px;
          }
        }

        @keyframes flyLeftPixels {
          from {
            right: -150px;
            top: ${startY}px;
          }
          to {
            right: calc(100vw + 300px);
            top: ${endY}px;
          }
        }

        @keyframes rocketVibrate {
          0% { transform: rotate(${rotation}deg) translate(0, 0); }
          25% { transform: rotate(${rotation}deg) translate(${VIBRATION_INTENSITY}px, -${VIBRATION_INTENSITY}px); }
          50% { transform: rotate(${rotation}deg) translate(-${VIBRATION_INTENSITY}px, ${VIBRATION_INTENSITY}px); }
          75% { transform: rotate(${rotation}deg) translate(${VIBRATION_INTENSITY}px, ${VIBRATION_INTENSITY}px); }
          100% { transform: rotate(${rotation}deg) translate(0, 0); }
        }
      `}</style>
      
      <Image
        src="/SLS.png"
        alt="SLS Rocket"
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
  );
}
