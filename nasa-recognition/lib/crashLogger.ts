/**
 * iOS Safari Crash Logger
 * Captures errors and logs to localStorage for debugging
 */

import { isDebugEnabled } from './configs/componentsConfig';

interface CrashLog {
  timestamp: string;
  type: 'error' | 'memory' | 'image' | 'scroll';
  message: string;
  stack?: string;
  userAgent: string;
  memory?: {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  };
}

class CrashLogger {
  private logs: CrashLog[] = [];
  private maxLogs = 50;

  constructor() {
    if (typeof window === 'undefined' || !isDebugEnabled('ENABLE_CRASH_LOGGER')) return;

    // Load existing logs
    this.loadLogs();

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.log('error', `Error: ${event.message}`, event.error?.stack);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.log('error', `Unhandled Promise: ${event.reason}`, event.reason?.stack);
    });

    // Log memory usage periodically
    this.startMemoryMonitoring();

    // Log before page unload (might catch crash info)
    window.addEventListener('beforeunload', () => {
      this.log('scroll', 'Page unload/refresh');
    });
  }

  log(type: CrashLog['type'], message: string, stack?: string) {
    if (!isDebugEnabled('ENABLE_CRASH_LOGGER')) return; // No-op when disabled
    
    const logEntry: CrashLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      stack,
      userAgent: navigator.userAgent,
    };

    // Add memory info if available (Chrome/Edge only, but useful)
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      logEntry.memory = {
        usedJSHeapSize: mem.usedJSHeapSize,
        totalJSHeapSize: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
      };
    }

    this.logs.push(logEntry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Save to localStorage
    this.saveLogs();

    // Also log to console for immediate visibility
    console.log(`[CrashLogger ${type}]`, message, logEntry);
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem('crash-logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load crash logs', e);
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem('crash-logs', JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to save crash logs', e);
    }
  }

  private startMemoryMonitoring() {
    // Log memory every 5 seconds
    setInterval(() => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        const usedMB = Math.round(mem.usedJSHeapSize / 1024 / 1024);
        const limitMB = Math.round(mem.jsHeapSizeLimit / 1024 / 1024);
        const percent = Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100);
        
        // Log if memory is high
        if (percent > 70) {
          this.log('memory', `High memory usage: ${usedMB}MB / ${limitMB}MB (${percent}%)`);
        }
      }
    }, 5000);
  }

  getLogs(): CrashLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('crash-logs');
    } catch (e) {
      console.error('Failed to clear crash logs', e);
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const crashLogger = new CrashLogger();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).crashLogger = crashLogger;
}
