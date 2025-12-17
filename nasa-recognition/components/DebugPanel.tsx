'use client';

import { useState, useEffect, useRef } from 'react';
import { crashLogger } from '@/lib/crashLogger';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<Array<{ message: string; timestamp: number }>>([]);
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleTap = () => {
      // Use ref to avoid stale closure
      const newCount = tapCountRef.current + 1;
      tapCountRef.current = newCount;
      console.log('Tap detected, current count:', newCount);
      
      // Clear existing timeout
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      
      // Check immediately if we hit 3 taps
      if (newCount >= 3) {
        console.log('Opening debug panel!');
        setIsOpen(prev => {
          const newState = !prev;
          if (newState) {
            setLogs(crashLogger.getLogs());
          }
          return newState;
        });
        tapCountRef.current = 0;
      } else {
        // Reset tap count after 500ms if we didn't hit 3
        tapTimeoutRef.current = setTimeout(() => {
          console.log('Resetting tap count');
          tapCountRef.current = 0;
        }, 500);
      }
    };
    
    // Add keyboard shortcut for accessibility
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+D or Cmd+Shift+D to toggle debug panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(prev => {
          const newState = !prev;
          if (newState) {
            setLogs(crashLogger.getLogs());
          }
          return newState;
        });
      }
    };

    window.addEventListener('click', handleTap);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleTap);
      window.removeEventListener('keydown', handleKeyDown);
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 overflow-auto p-4 font-mono text-xs">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-black pb-2">
          <h2 className="text-white font-bold text-lg">Crash Debug Logs</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setLogs(crashLogger.getLogs())}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                const data = crashLogger.exportLogs();
                const blob = new Blob([data], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'crash-logs.json';
                a.click();
              }}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Export
            </button>
            <button
              onClick={() => {
                crashLogger.clearLogs();
                setLogs([]);
              }}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="text-gray-400">No logs yet. Scroll around and try to reproduce the crash.</div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={`p-2 rounded border ${
                  log.type === 'error' ? 'bg-red-900/20 border-red-500' :
                  log.type === 'memory' ? 'bg-yellow-900/20 border-yellow-500' :
                  log.type === 'image' ? 'bg-blue-900/20 border-blue-500' :
                  'bg-gray-900/20 border-gray-500'
                }`}
              >
                <div className="flex justify-between text-gray-400 mb-1">
                  <span className="font-bold text-white">[{log.type.toUpperCase()}]</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-white mb-1">{log.message}</div>
                {log.memory && (
                  <div className="text-gray-400 text-[10px]">
                    Memory: {Math.round(log.memory.usedJSHeapSize / 1024 / 1024)}MB / 
                    {Math.round(log.memory.jsHeapSizeLimit / 1024 / 1024)}MB
                    ({Math.round((log.memory.usedJSHeapSize / log.memory.jsHeapSizeLimit) * 100)}%)
                  </div>
                )}
                {log.stack && (
                  <details className="mt-1">
                    <summary className="text-gray-400 cursor-pointer">Stack trace</summary>
                    <pre className="text-[10px] text-gray-300 mt-1 overflow-x-auto">{log.stack}</pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
