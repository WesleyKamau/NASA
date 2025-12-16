'use client';

import { useRef } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import swipeGestureAnimation from '@/components/animations/finger_swipe_animation.json';
import Link from 'next/link';

export default function LottiePreviewPage() {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const handlePlay = () => {
    lottieRef.current?.play();
  };

  const handlePause = () => {
    lottieRef.current?.pause();
  };

  const handleStop = () => {
    lottieRef.current?.stop();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/"
            className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Lottie Animation Preview</h1>
          <p className="text-slate-400">Tap gesture animation for the carousel hint</p>
        </div>

        {/* Main Preview Area */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-12 border border-slate-700 mb-8">
          <div className="flex flex-col items-center justify-center">
            {/* Animation Container */}
            <div className="relative w-full max-w-3xl h-[600px] bg-gradient-to-b from-slate-700/50 to-slate-900/50 rounded-xl flex items-center justify-center border border-slate-700 mb-8">
              <div className="w-[500px] h-[500px]">
                <Lottie
                  lottieRef={lottieRef}
                  animationData={swipeGestureAnimation}
                  loop={true}
                  autoplay={true}
                  style={{
                    width: '100%',
                    height: '100%',
                    filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.3))'
                  }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 flex-wrap justify-center">
              <button
                onClick={handlePlay}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
              >
                ▶ Play
              </button>
              <button
                onClick={handlePause}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-semibold transition-colors"
              >
                ⏸ Pause
              </button>
              <button
                onClick={handleStop}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-colors"
              >
                ⏹ Stop
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4 text-cyan-400">Animation Details</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><strong>Duration:</strong> 6 seconds</li>
              <li><strong>Frame Rate:</strong> 30 fps</li>
              <li><strong>Total Frames:</strong> 180</li>
              <li><strong>Loop:</strong> Continuous</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4 text-cyan-400">Gesture Sequence</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>🎯 <strong>Tap and Hold</strong> on left</li>
              <li>👉 <strong>Drag</strong> right and up</li>
              <li>🤚 <strong>Release</strong></li>
              <li>⏳ <strong>Wait</strong> briefly</li>
              <li>🎯 <strong>Tap and Hold</strong> on right</li>
              <li>👈 <strong>Drag</strong> left and up</li>
            </ul>
          </div>
        </div>

        {/* File Info */}
        <div className="mt-6 bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold mb-3 text-cyan-400">File Location</h2>
          <code className="text-sm text-slate-300 break-all bg-slate-900/50 p-3 rounded">
            components/animations/finger_swipe_animation.json
          </code>
        </div>
      </div>
    </div>
  );
}
