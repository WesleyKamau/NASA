'use client';

import { useState, useEffect, useRef } from 'react';

type TestMode = 'starfield' | 'raw-data';

export default function TestPage() {
  const [mode, setMode] = useState<TestMode>('starfield');
  const [tiltData, setTiltData] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
    accelX: 0,
    accelY: 0,
    accelZ: 0,
  });
  const [permissionStatus, setPermissionStatus] = useState('requesting...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tiltRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // DeviceOrientation handler
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = (event.alpha || 0) % 360;
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;

      const normalizedAlpha = Math.sin((alpha * Math.PI) / 180) * 0.3;
      const normalizedGamma = Math.max(-45, Math.min(45, gamma)) / 45 * 0.3;

      tiltRef.current = {
        x: normalizedGamma,
        y: normalizedAlpha,
      };

      setTiltData((prev) => ({
        ...prev,
        alpha,
        beta,
        gamma,
      }));
    };

    // DeviceMotion handler
    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const acc = event.accelerationIncludingGravity;
      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;

      const tiltX = Math.max(-1, Math.min(1, x / 9.8)) * 0.3;
      const tiltY = Math.max(-1, Math.min(1, y / 9.8)) * 0.3;

      tiltRef.current = {
        x: tiltX,
        y: tiltY,
      };

      setTiltData((prev) => ({
        ...prev,
        accelX: x,
        accelY: y,
        accelZ: z,
      }));
    };

    // Request permissions
    const requestPermissions = async () => {
      try {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          // iOS 13+
          try {
            const orientPerm = await (DeviceOrientationEvent as any).requestPermission();
            const motionPerm = await (DeviceMotionEvent as any).requestPermission();
            
            if (orientPerm === 'granted' && motionPerm === 'granted') {
              setPermissionStatus('granted');
              setErrorMessage(null);
              window.addEventListener('deviceorientation', handleOrientation);
              window.addEventListener('devicemotion', handleMotion);
            } else {
              setPermissionStatus('denied');
              setErrorMessage(`Orientation: ${orientPerm}, Motion: ${motionPerm}`);
            }
          } catch (e: any) {
            setPermissionStatus('error');
            setErrorMessage(`iOS permission error: ${e.message || e}`);
          }
        } else {
          // Android and other devices
          setPermissionStatus('granted');
          setErrorMessage(null);
          window.addEventListener('deviceorientation', handleOrientation);
          window.addEventListener('devicemotion', handleMotion);
        }
      } catch (error: any) {
        console.error('Permission error:', error);
        setPermissionStatus('error');
        setErrorMessage(`Error: ${error.message || JSON.stringify(error)}`);
      }
    };

    requestPermissions();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  // Starfield animation
  useEffect(() => {
    if (mode !== 'starfield') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars
    interface Star {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
    }

    const stars: Star[] = [];
    const numStars = 200;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5 + 0.5,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const tilt = tiltRef.current;

      stars.forEach((star) => {
        star.y += star.speed + (tilt.y * star.speed);
        star.x += tilt.x * star.speed;

        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
        if (star.x > canvas.width) {
          star.x = 0;
        }
        if (star.x < 0) {
          star.x = canvas.width;
        }

        star.opacity = Math.sin(Date.now() * 0.001 + star.x) * 0.3 + 0.7;

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [mode]);

  return (
    <div className="fixed inset-0 bg-slate-900 text-white overflow-hidden">
      {/* Canvas for starfield mode */}
      {mode === 'starfield' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, #030712, #0f172a)' }}
        />
      )}

      {/* Raw data display for data mode */}
      {mode === 'raw-data' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-8 border border-blue-500/50 max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Device Tilt Data</h2>
            
            <div className="space-y-4 font-mono text-sm">
              <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                <div className="text-blue-300">DeviceOrientation</div>
                <div>Alpha: <span className="text-green-400">{tiltData.alpha.toFixed(2)}°</span></div>
                <div>Beta: <span className="text-green-400">{tiltData.beta.toFixed(2)}°</span></div>
                <div>Gamma: <span className="text-green-400">{tiltData.gamma.toFixed(2)}°</span></div>
              </div>

              <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                <div className="text-blue-300">Accelerometer (m/s²)</div>
                <div>X: <span className="text-green-400">{tiltData.accelX.toFixed(2)}</span></div>
                <div>Y: <span className="text-green-400">{tiltData.accelY.toFixed(2)}</span></div>
                <div>Z: <span className="text-green-400">{tiltData.accelZ.toFixed(2)}</span></div>
              </div>

              <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                <div className="text-blue-300">Permission Status</div>
                <div className={tiltData.alpha !== 0 || tiltData.accelX !== 0 ? 'text-green-400' : 'text-yellow-400'}>
                  {permissionStatus}
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-900/50 p-3 rounded border border-red-500/50">
                  <div className="text-red-300 font-semibold mb-1">Error Details</div>
                  <div className="text-red-200 text-xs break-words">{errorMessage}</div>
                </div>
              )}

              <div className="pt-2 text-xs text-slate-400">
                Tilt your device to see values change
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle and instructions */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('starfield')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              mode === 'starfield'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Starfield Test
          </button>
          <button
            onClick={() => setMode('raw-data')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              mode === 'raw-data'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Raw Tilt Data
          </button>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30 text-sm text-slate-300">
          {mode === 'starfield' ? (
            <p>Tilt your device to see the stars respond to device orientation.</p>
          ) : (
            <p>Real-time device orientation and accelerometer data. Grant permissions when prompted.</p>
          )}
        </div>
      </div>
    </div>
  );
}
