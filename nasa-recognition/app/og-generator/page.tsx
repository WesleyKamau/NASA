'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import StarfieldBackground from '@/components/StarfieldBackground';
import GalaxyBackground from '@/components/GalaxyBackground';
import { ROCKET_CONFIG } from '@/lib/configs/rocketConfig';
import { OG_IMAGE_CONFIG } from '@/lib/configs/ogConfig';
import { OG_GENERATOR_CONFIG } from '@/lib/configs/componentsConfig';

const { ROCKET_SIZE: DEFAULT_ROCKET_SIZE, ENGINE_GLOW_OFFSET_X, ENGINE_GLOW_OFFSET_Y } = ROCKET_CONFIG;

const FONTS = OG_GENERATOR_CONFIG.AVAILABLE_FONTS;

function GeneratorContent() {
  const searchParams = useSearchParams();
  const isCaptureMode = searchParams.get('mode') === 'capture';

  // Hide Next.js dev indicator
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      #__next-build-watcher,
      .__next-dev-overlay-pull-to-refresh-indicator,
      [data-nextjs-dialog-overlay],
      [data-nextjs-toast],
      nextjs-portal {
        display: none !important;
      }
      /* Hide the actual build indicator */
      body > nextjs-portal,
      body > [id^="__next"],
      body > div[style*="position: fixed"][style*="bottom"][style*="left"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // Also try to remove it directly
    const removeIndicator = () => {
      const indicators = document.querySelectorAll('nextjs-portal, [id*="next-build"]');
      indicators.forEach(el => el.remove());
    };
    
    removeIndicator();
    const interval = setInterval(removeIndicator, 100);
    
    return () => {
      document.head.removeChild(style);
      clearInterval(interval);
    };
  }, []);

  const [position, setPosition] = useState<{ x: number; y: number }>({ x: OG_IMAGE_CONFIG.rocketPosition.x, y: OG_IMAGE_CONFIG.rocketPosition.y });
  const [rotation, setRotation] = useState<number>(OG_IMAGE_CONFIG.rocketRotation);
  const [rocketSize, setRocketSize] = useState<number>(OG_IMAGE_CONFIG.rocketSize);
  const [fontFamily, setFontFamily] = useState<string>(OG_IMAGE_CONFIG.fontFamily);
  const [fontSize, setFontSize] = useState<{ line1: number; line2: number }>(OG_IMAGE_CONFIG.fontSize);
  const [isBold, setIsBold] = useState<boolean>(OG_IMAGE_CONFIG.isBold);
  const [availableFonts, setAvailableFonts] = useState<Array<{ name: string; value: string }>>(Array.from(FONTS));
  const [isDragging, setIsDragging] = useState(false);
  const [showRocket, setShowRocket] = useState(true);
  const [useGalaxy, setUseGalaxy] = useState(true);
  
  const dragStartRef = useRef({ x: 0, y: 0 });
  const rocketRef = useRef<HTMLDivElement>(null);

  const glowSize = rocketSize * 0.53;

  const loadSystemFonts = async () => {
    try {
      // @ts-ignore - queryLocalFonts is experimental
      if (window.queryLocalFonts) {
        // @ts-ignore
        const fonts = await window.queryLocalFonts();
        const fontNames = new Set(fonts.map((f: any) => f.family));
        const systemFonts = Array.from(fontNames).map(name => ({
          name: name as string,
          value: `"${name}", sans-serif`
        })).sort((a, b) => a.name.localeCompare(b.name));
        
        setAvailableFonts([...Array.from(FONTS), ...systemFonts] as Array<{ name: string; value: string }>);
      } else {
        alert('Your browser does not support accessing local fonts. Try Chrome or Edge on desktop.');
      }
    } catch (err) {
      console.error('Error loading fonts:', err);
    }
  };

  const exportConfig = () => {
    const config = `export const OG_IMAGE_CONFIG = {
  rocketPosition: { x: ${Math.round(position.x)}, y: ${Math.round(position.y)} },
  rocketRotation: ${Math.round(rotation)},
  rocketSize: ${rocketSize},
  fontFamily: '${fontFamily}',
  fontSize: { line1: ${fontSize.line1}, line2: ${fontSize.line2} },
  isBold: ${isBold},
  showRocket: ${showRocket},
  useGalaxy: ${useGalaxy},
};`;
    
    navigator.clipboard.writeText(config).then(() => {
      alert('✅ Config copied to clipboard!\n\nPaste this into your og-generator/page.tsx file to set these as defaults.');
      console.log('Exported config:', config);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard. Check the console for the config.');
      console.log(config);
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCaptureMode) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      console.log('📍 New Rocket Position:', {
        x: Math.round(position.x),
        y: Math.round(position.y),
        rotation
      });
    }
  };

  // Handle rotation with wheel when hovering rocket
  const handleWheel = (e: React.WheelEvent) => {
    if (isCaptureMode) return;
    if (e.shiftKey) {
      setRotation(prev => prev + (e.deltaY > 0 ? 5 : -5));
    }
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-gray-900 flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Preview Wrapper */}
      <div className="relative shadow-2xl">
        {/* Border Overlay - High Z-Index to ensure visibility over Starfield */}
        {!isCaptureMode && (
          <div className="absolute -inset-[4px] border-[4px] border-white z-[100] pointer-events-none" />
        )}

        {/* 1200x630 Preview Area */}
        <div className="relative w-[1200px] h-[630px] bg-black overflow-hidden isolate">
          {/* Background Container - transform forces it to be contained within this div */}
          <div className="absolute inset-0 transform">
            {useGalaxy ? <GalaxyBackground /> : <StarfieldBackground />}
          </div>
          
          {/* Main Content Container - Centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-center">
              <h1 
                className={`text-white tracking-tight drop-shadow-lg flex flex-col items-center gap-2 ${isBold ? 'font-bold' : 'font-normal'}`}
                style={{ fontFamily }}
              >
                <span style={{ fontSize: `${fontSize.line1}px` }}>Marshall Space Flight Center</span>
                <span style={{ fontSize: `${fontSize.line2}px` }}>Book of Faces</span>
              </h1>
            </div>
          </div>

        {/* Draggable Rocket */}
        {showRocket && (
        <div
          ref={rocketRef}
          className={`absolute z-20 group ${isCaptureMode ? '' : 'cursor-move'}`}
          style={{
            left: position.x,
            top: position.y,
            width: `${rocketSize}px`,
            height: `${rocketSize * 2}px`,
            transform: `rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s',
          }}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
        >
          {/* Tooltip */}
          {!isCaptureMode && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none" style={{ transform: `rotate(${-rotation}deg)` }}>
              Drag to move • Shift+Scroll to rotate
            </div>
          )}

          <Image
            src="/SLS.png"
            alt="SLS Rocket"
            width={rocketSize}
            height={rocketSize * 2}
            className="drop-shadow-2xl pointer-events-none"
            style={{ height: 'auto', width: '100%' }}
            priority
          />
          
          {/* Engine glow effect */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-orange-500/60 blur-xl"
            style={{ 
              width: `${glowSize}px`,
              height: `${glowSize}px`,
              transform: `translateX(${ENGINE_GLOW_OFFSET_X}%) translateY(${ENGINE_GLOW_OFFSET_Y}%)` 
            }}
          />
        </div>
        )}
      </div>
      </div>

      {/* Controls & Instructions Overlay (Hidden in capture mode) */}
      {!isCaptureMode && (
        <div className="absolute bottom-4 left-4 z-50 flex flex-col gap-4">
          {/* Controls Panel */}
          <div className="bg-gray-900/90 p-4 rounded-lg border border-gray-700 backdrop-blur-sm w-80 shadow-xl">
            <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2">Generator Controls</h3>
            
            {/* Font Selector */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-400 text-xs uppercase">Font Family</label>
                <button 
                  onClick={loadSystemFonts}
                  className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded transition-colors"
                  title="Load installed system fonts (Chrome/Edge only)"
                >
                  Load System Fonts
                </button>
              </div>
              <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
              >
                {availableFonts.map(font => (
                  <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option>
                ))}
              </select>
            </div>

            {/* Rocket Size Slider */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-gray-400 text-xs uppercase">Rocket Size</label>
                <span className="text-gray-400 text-xs">{rocketSize}px</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="300" 
                value={rocketSize} 
                onChange={(e) => setRocketSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Font Size Controls */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-gray-400 text-xs uppercase">Line 1 Font Size</label>
                <span className="text-gray-400 text-xs">{fontSize.line1}px</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="120" 
                value={fontSize.line1} 
                onChange={(e) => setFontSize(prev => ({ ...prev, line1: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-gray-400 text-xs uppercase">Line 2 Font Size</label>
                <span className="text-gray-400 text-xs">{fontSize.line2}px</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="150" 
                value={fontSize.line2} 
                onChange={(e) => setFontSize(prev => ({ ...prev, line2: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Bold Toggle & Show Rocket Toggle */}
            <div className="mb-4 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isBold}
                  onChange={(e) => setIsBold(e.target.checked)}
                  className="w-4 h-4 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 text-xs uppercase">Bold Text</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showRocket}
                  onChange={(e) => setShowRocket(e.target.checked)}
                  className="w-4 h-4 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 text-xs uppercase">Show Rocket</span>
              </label>
            </div>

            {/* Background Toggle */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useGalaxy}
                  onChange={(e) => setUseGalaxy(e.target.checked)}
                  className="w-4 h-4 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 text-xs uppercase">Use Galaxy (vs Starfield)</span>
              </label>
            </div>

            {/* Export Config Button */}
            <button
              onClick={exportConfig}
              className="w-full mb-4 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              📋 Export Config
            </button>

            {/* Position Readout */}
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 font-mono bg-black/50 p-2 rounded">
              <div>X: {Math.round(position.x)}</div>
              <div>Y: {Math.round(position.y)}</div>
              <div>R: {Math.round(rotation)}°</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm text-gray-400 text-sm border border-gray-800">
            <p className="font-bold mb-2 text-white">Instructions</p>
            <p>1. Drag rocket to position</p>
            <p>2. Shift+Scroll to rotate</p>
            <p>3. Use controls above to tweak</p>
            <p>4. Run <code className="bg-gray-800 px-1 rounded text-gray-300">node scripts/capture-og.js</code></p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OGGenerator() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <GeneratorContent />
    </Suspense>
  );
}
