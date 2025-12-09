'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// Configuration constants
// const ROCKET_SIZE = 120; // Adjust this to change rocket size
// const ROCKET_SPEED = 8; // Seconds to cross screen (lower = faster)
// const LAUNCH_INTERVAL = 60000; // 60 seconds between launches
// const VIBRATION_INTENSITY = 1; // Vibration/shake intensity in pixels (0 to disable)
// const ENGINE_GLOW_OFFSET_X = -80; // Horizontal offset of engine glow in percentage (-200 to 200)
// const ENGINE_GLOW_OFFSET_Y = 10; // Vertical offset of engine glow in percentage (-200 to 200)

const ROCKET_SIZE = 120;
const ROCKET_SPEED = 8;
const LAUNCH_INTERVAL = 60000;
const VIBRATION_INTENSITY = 1;
const ENGINE_GLOW_OFFSET_X = 0;
const ENGINE_GLOW_OFFSET_Y = 200;

interface RocketPosition {
  startSide: 'left' | 'right';
  startY: number;
  endY: number;
  rotation: number;
}

/**
 * Calculate rocket rotation angle based on trajectory.
 * The rocket image points upward (north = 0°), so we calculate the angle
 * to point the rocket in the direction of travel.
 * @param startSide - Which side the rocket starts from
 * @param startY - Starting Y position (percentage)
 * @param endY - Ending Y position (percentage)
 * @returns Rotation angle in degrees (0° = north/up)
 */
function calculateRocketRotation(
  startSide: 'left' | 'right',
  startY: number,
  endY: number
): number {
  // Calculate the trajectory vector
  // X: positive if going right, negative if going left
  // Y: positive if going down (CSS coordinates), negative if going up
  const deltaX = startSide === 'left' ? 100 : -100;
  const deltaY = -(endY - startY); // Negate to reflect across x-axis
  
  // atan2(y, x) gives angle from positive X-axis (east)
  // We need to convert this to rotation from north (up)
  // atan2 returns [-π, π], with 0 = east, π/2 = south, -π/2 = north, ±π = west
  const angleFromEast = Math.atan2(deltaY, deltaX);
  
  // Convert to degrees and adjust:
  // - atan2 measures from east (0°)
  // - We need rotation from north (0°)
  // - North is -90° from east, so we add 90° to convert
  const rotation = (angleFromEast * 180 / Math.PI) + 90;
  
  return rotation;
}

export default function SLSRocket() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [position, setPosition] = useState<RocketPosition | null>(null);

  useEffect(() => {
    const scheduleLaunch = () => {
      // Randomly choose which side to start from
      const startSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
      
      // Random Y positions (0-100% of screen height)
      const startY = Math.random() * 100;
      const endY = Math.random() * 100;
      
      // Calculate rotation to match trajectory
      const rotation = calculateRocketRotation(startSide, startY, endY);

      setPosition({
        startSide,
        startY,
        endY,
        rotation,
      });
      
      setIsLaunching(true);

      // Reset after animation completes
      setTimeout(() => {
        setIsLaunching(false);
      }, ROCKET_SPEED * 1000);
    };

    // Initial launch after 5 seconds
    const initialTimeout = setTimeout(scheduleLaunch, 5000);

    // Subsequent launches
    const interval = setInterval(scheduleLaunch, LAUNCH_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!isLaunching || !position) return null;

  const { startSide, startY, endY, rotation } = position;

  return (
    <div
      className="fixed pointer-events-none z-10"
      style={{
        width: `${ROCKET_SIZE}px`,
        height: `${ROCKET_SIZE * 2}px`,
        bottom: `${startY}vh`,
        left: startSide === 'left' ? '-150px' : 'auto',
        right: startSide === 'right' ? '-150px' : 'auto',
        animation: `
          ${startSide === 'left' ? `flyRight-${startY}-${endY}` : `flyLeft-${startY}-${endY}`} ${ROCKET_SPEED}s linear forwards,
          rocketVibrate 0.1s infinite
        `,
        '--start-y': `${startY}vh`,
        '--end-y': `${endY}vh`,
        '--rotation': `${rotation}deg`,
        '--vibration': `${VIBRATION_INTENSITY}px`,
      } as React.CSSProperties & { '--start-y': string; '--end-y': string; '--rotation': string; '--vibration': string }}
    >
      <style jsx>{`
        @keyframes flyRight-${startY}-${endY} {
          from {
            left: -150px;
            bottom: ${startY}vh;
          }
          to {
            left: calc(100vw + 150px);
            bottom: ${endY}vh;
          }
        }

        @keyframes flyLeft-${startY}-${endY} {
          from {
            right: -150px;
            bottom: ${startY}vh;
          }
          to {
            right: calc(100vw + 150px);
            bottom: ${endY}vh;
          }
        }
      `}</style>
      
      <Image
        src="/SLS.png"
        alt="SLS Rocket"
        width={ROCKET_SIZE}
        height={ROCKET_SIZE * 2}
        className="drop-shadow-2xl"
        priority={false}
      />
      
      {/* Engine glow effect */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-orange-500/60 blur-xl animate-pulse"
        style={{ transform: `translateX(${ENGINE_GLOW_OFFSET_X}%) translateY(${ENGINE_GLOW_OFFSET_Y}%)` }}
      />
    </div>
  );
}
