'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ROCKET_CONFIG } from '@/lib/rocketConfig';

/**
 * Calculate rocket rotation angle based on trajectory.
 * The rocket image points upward (north = 0°), so we calculate the angle
 * to point the rocket in the direction of travel.
 */
function calculateRocketRotation(
  startSide: 'left' | 'right',
  startY: number,
  endY: number
): number {
  // Calculate the trajectory vector
  const deltaX = startSide === 'left' ? 100 : -100;
  const deltaY = -(endY - startY); // Negate to reflect across x-axis
  
  // atan2(y, x) gives angle from positive X-axis (east)
  // Convert to degrees and adjust to measure from north (up)
  const angleFromEast = Math.atan2(deltaY, deltaX);
  const rotation = (angleFromEast * 180 / Math.PI) + 90;
  
  return rotation;
}

export default function RocketConfigPage() {
  const [rocketSize, setRocketSize] = useState<number>(ROCKET_CONFIG.ROCKET_SIZE);
  const [rocketSpeed, setRocketSpeed] = useState<number>(ROCKET_CONFIG.ROCKET_SPEED);
  const [launchInterval, setLaunchInterval] = useState<number>(ROCKET_CONFIG.LAUNCH_INTERVAL / 1000); // Convert to seconds
  const [vibrationIntensity, setVibrationIntensity] = useState<number>(ROCKET_CONFIG.VIBRATION_INTENSITY);
  const [engineGlowOffsetX, setEngineGlowOffsetX] = useState<number>(ROCKET_CONFIG.ENGINE_GLOW_OFFSET_X);
  const [engineGlowOffsetY, setEngineGlowOffsetY] = useState<number>(ROCKET_CONFIG.ENGINE_GLOW_OFFSET_Y);
  const [isLaunching, setIsLaunching] = useState(false);
  const [position, setPosition] = useState<{
    startSide: 'left' | 'right';
    startY: number;
    endY: number;
    rotation: number;
  } | null>(null);

  const triggerLaunch = () => {
    const startSide: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
    const startY = Math.random() * 100;
    const endY = Math.random() * 100;
    
    const rotation = calculateRocketRotation(startSide, startY, endY);

    setPosition({ startSide, startY, endY, rotation });
    setIsLaunching(true);

    setTimeout(() => {
      setIsLaunching(false);
    }, rocketSpeed * 1000);
  };

  const copyConfig = () => {
    const config = `// Shared rocket configuration constants
export const ROCKET_CONFIG = {
  ENABLE_ROCKET: true, // Set to false to disable the rocket animation
  ROCKET_SIZE: ${rocketSize}, // Controls the entire size of the rocket and glow
  ROCKET_SPEED: ${rocketSpeed},
  LAUNCH_INTERVAL: ${launchInterval * 1000}, // milliseconds
  VIBRATION_INTENSITY: ${vibrationIntensity},
  ENGINE_GLOW_OFFSET_X: ${engineGlowOffsetX},
  ENGINE_GLOW_OFFSET_Y: ${engineGlowOffsetY},
} as const;`;
    
    navigator.clipboard.writeText(config);
    alert('Configuration copied to clipboard! Paste into lib/rocketConfig.ts');
  };

  useEffect(() => {
    // Auto-launch for demo
    const timeout = setTimeout(triggerLaunch, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Link 
            href="/"
            className="inline-block mb-4 text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Main Page
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            SLS Rocket Configuration
          </h1>
          <p className="text-slate-400">
            Adjust the rocket animation settings and test them in real-time
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

              {/* Rocket Size */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Rocket Size: {rocketSize}px (controls glow)
                </label>
                <input
                  type="range"
                  min="60"
                  max="300"
                  step="10"
                  value={rocketSize}
                  onChange={(e) => setRocketSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Small (60px)</span>
                  <span>Large (300px)</span>
                </div>
              </div>

              {/* Rocket Speed */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Flight Duration: {rocketSpeed}s
                </label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="0.5"
                  value={rocketSpeed}
                  onChange={(e) => setRocketSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Fast (2s)</span>
                  <span>Slow (20s)</span>
                </div>
              </div>

              {/* Launch Interval */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Time Between Launches: {launchInterval}s
                </label>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={launchInterval}
                  onChange={(e) => setLaunchInterval(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Frequent (5s)</span>
                  <span>Rare (5min)</span>
                </div>
              </div>

              {/* Vibration Intensity */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Vibration Intensity: {vibrationIntensity}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={vibrationIntensity}
                  onChange={(e) => setVibrationIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>None (0px)</span>
                  <span>Strong (5px)</span>
                </div>
              </div>

              {/* Engine Glow Offset X */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Engine Glow Offset X: {engineGlowOffsetX}%
                </label>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="5"
                  value={engineGlowOffsetX}
                  onChange={(e) => setEngineGlowOffsetX(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Left (-200%)</span>
                  <span>Center (0%)</span>
                  <span>Right (200%)</span>
                </div>
              </div>

              {/* Engine Glow Offset Y */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Engine Glow Offset Y: {engineGlowOffsetY}%
                </label>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="5"
                  value={engineGlowOffsetY}
                  onChange={(e) => setEngineGlowOffsetY(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Up (-200%)</span>
                  <span>Center (0%)</span>
                  <span>Down (200%)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={triggerLaunch}
                  disabled={isLaunching}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLaunching ? 'Launching...' : '🚀 Launch Rocket'}
                </button>
                <button
                  onClick={copyConfig}
                  className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  📋 Copy Config
                </button>
              </div>
            </div>

            {/* Current Values */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Current Configuration</h3>
              <div className="bg-slate-900 rounded p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">{`export const ROCKET_CONFIG = {
  ENABLE_ROCKET: true,
  ROCKET_SIZE: ${rocketSize}, // Controls the entire size of the rocket and glow
  ROCKET_SPEED: ${rocketSpeed},
  LAUNCH_INTERVAL: ${launchInterval * 1000},
  VIBRATION_INTENSITY: ${vibrationIntensity},
  ENGINE_GLOW_OFFSET_X: ${engineGlowOffsetX},
  ENGINE_GLOW_OFFSET_Y: ${engineGlowOffsetY},
} as const;`}</pre>
              </div>
              <p className="text-slate-400 text-sm mt-4">
                Click "Copy Config" and paste these values into <code className="bg-slate-700 px-2 py-1 rounded">lib/rocketConfig.ts</code>
              </p>
            </div>

            {/* Last Launch Info */}
            {position && (
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Last Launch Details</h3>
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span>Start Side:</span>
                    <span className="font-semibold">{position.startSide}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start Y Position:</span>
                    <span className="font-semibold">{position.startY.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Y Position:</span>
                    <span className="font-semibold">{position.endY.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rotation Angle:</span>
                    <span className="font-semibold">{position.rotation.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Direction:</span>
                    <span className="font-semibold">
                      {position.endY > position.startY ? '↗ Ascending' : position.endY < position.startY ? '↘ Descending' : '→ Level'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Area */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Preview</h2>
            <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              {/* Grid lines for reference */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute left-0 right-0 border-t border-slate-600"
                    style={{ top: `${i * 10}%` }}
                  />
                ))}
                {[...Array(10)].map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute top-0 bottom-0 border-l border-slate-600"
                    style={{ left: `${i * 10}%` }}
                  />
                ))}
              </div>

              {/* Rocket */}
              {isLaunching && position && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: `${rocketSize}px`,
                    height: `${rocketSize * 2}px`,
                    bottom: `${position.startY}%`,
                    left: position.startSide === 'left' ? '-150px' : 'auto',
                    right: position.startSide === 'right' ? '-150px' : 'auto',
                    animation: `
                      ${position.startSide === 'left' ? 'previewFlyRight' : 'previewFlyLeft'} ${rocketSpeed}s linear forwards,
                      rocketVibrate 0.1s infinite
                    `,
                    '--start-y': `${position.startY}%`,
                    '--end-y': `${position.endY}%`,
                  } as React.CSSProperties}
                >
                  <style jsx>{`
                    @keyframes previewFlyRight {
                      from {
                        left: -150px;
                        bottom: ${position.startY}%;
                      }
                      to {
                        left: calc(100% + 150px);
                        bottom: ${position.endY}%;
                      }
                    }

                    @keyframes previewFlyLeft {
                      from {
                        right: -150px;
                        bottom: ${position.startY}%;
                      }
                      to {
                        right: calc(100% + 150px);
                        bottom: ${position.endY}%;
                      }
                    }

                    @keyframes rocketVibrate {
                      0%, 100% {
                        transform: translate(0, 0) rotate(${position.rotation}deg);
                      }
                      25% {
                        transform: translate(${vibrationIntensity}px, -${vibrationIntensity}px) rotate(${position.rotation}deg);
                      }
                      50% {
                        transform: translate(-${vibrationIntensity}px, ${vibrationIntensity}px) rotate(${position.rotation}deg);
                      }
                      75% {
                        transform: translate(${vibrationIntensity}px, ${vibrationIntensity}px) rotate(${position.rotation}deg);
                      }
                    }
                  `}</style>
                  
                  <Image
                    src="/SLS.png"
                    alt="SLS Rocket"
                    width={rocketSize}
                    height={rocketSize * 2}
                    className="drop-shadow-2xl"
                    style={{ height: 'auto' }}
                  />
                  
                  {/* Engine glow */}
                  <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-orange-500/60 blur-xl animate-pulse"
                    style={{ 
                      width: `${rocketSize * 0.53}px`,
                      height: `${rocketSize * 0.53}px`,
                      transform: `translateX(${engineGlowOffsetX}%) translateY(${engineGlowOffsetY}%)` 
                    }}
                  />
                </div>
              )}

              {/* Instructions */}
              {!isLaunching && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <div className="text-6xl mb-4">🚀</div>
                    <p className="text-lg">Click "Launch Rocket" to test</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">How to Apply Changes</h3>
          <ol className="text-slate-300 space-y-2 list-decimal list-inside">
            <li>Adjust the sliders above until you&apos;re happy with the animation</li>
            <li>Click "Launch Rocket" to test your settings in real-time</li>
            <li>Click "Copy Config" to copy the configuration code</li>
            <li>Open <code className="bg-slate-700 px-2 py-1 rounded">lib/rocketConfig.ts</code></li>
            <li>Replace the entire ROCKET_CONFIG object with your copied values</li>
            <li>Save the file and the changes will apply to the main page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
