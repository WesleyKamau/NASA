/**
 * iOS Safari Crash Logger
 * Captures errors and logs to localStorage for debugging
 */

import { isDebugEnabled, DebugFeature } from './configs/componentsConfig';

export interface CrashLog {
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
  private memoryMonitoringInterval?: ReturnType<typeof setInterval>;
  private errorHandler?: (event: ErrorEvent) => void;
  private rejectionHandler?: (event: PromiseRejectionEvent) => void;
  private unloadHandler?: () => void;

  constructor() {
    if (typeof window === 'undefined' || !isDebugEnabled(DebugFeature.ENABLE_CRASH_LOGGER)) return;

    // Load existing logs
    this.loadLogs();

    // Capture unhandled errors
    this.errorHandler = (event) => {
      this.log('error', `Error: ${event.message}`, event.error?.stack);
    };
    window.addEventListener('error', this.errorHandler);

    // Capture unhandled promise rejections
    this.rejectionHandler = (event) => {
      this.log('error', `Unhandled Promise: ${event.reason}`, event.reason?.stack);
    };
    window.addEventListener('unhandledrejection', this.rejectionHandler);

    // Log memory usage periodically
    this.startMemoryMonitoring();

    // Log before page unload (might catch crash info)
    this.unloadHandler = () => {
      this.log('scroll', 'Page unload/refresh');
    };
    window.addEventListener('beforeunload', this.unloadHandler);
  }

  log(type: CrashLog['type'], message: string, stack?: string) {
    if (!isDebugEnabled(DebugFeature.ENABLE_CRASH_LOGGER)) return; // No-op when disabled
    
    const logEntry: CrashLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      stack,
      userAgent: navigator.userAgent,
    };

    // Add memory info if available (Chrome/Edge only, but useful)
    if ('memory' in performance) {
      const mem = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
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
    let retries = 0;
    const maxRetries = this.logs.length; // Don't try more times than there are logs
    while (retries <= maxRetries) {
      try {
        localStorage.setItem('crash-logs', JSON.stringify(this.logs));
        break; // Success
      } catch (e: unknown) {
        // If quota exceeded, remove oldest log and retry
        const error = e as { name?: string; code?: number };
        if (
          e &&
          (error.name === 'QuotaExceededError' ||
            error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
            (typeof error.code === 'number' && error.code === 22))
        ) {
          if (this.logs.length > 0) {
            this.logs.shift(); // Remove oldest log
            retries++;
            continue;
          }
        }
        // Other errors or no logs left: just log and exit
        console.error('Failed to save crash logs', e);
        break;
      }
    }
  }

  private startMemoryMonitoring() {
    // Log memory every 5 seconds
    this.memoryMonitoringInterval = setInterval(() => {
      if ('memory' in performance) {
        const mem = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
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

  cleanup() {
    // Clear memory monitoring interval
    if (this.memoryMonitoringInterval) {
      clearInterval(this.memoryMonitoringInterval);
      this.memoryMonitoringInterval = undefined;
    }
    
    // Remove event listeners
    if (typeof window !== 'undefined') {
      if (this.errorHandler) {
        window.removeEventListener('error', this.errorHandler);
      }
      if (this.rejectionHandler) {
        window.removeEventListener('unhandledrejection', this.rejectionHandler);
      }
      if (this.unloadHandler) {
        window.removeEventListener('beforeunload', this.unloadHandler);
      }
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const crashLogger = new CrashLogger();

// Only expose in development and when debug is enabled
if (
  typeof window !== 'undefined' &&
  isDebugEnabled(DebugFeature.ENABLE_CRASH_LOGGER) &&
  (typeof process === 'undefined' || !process.env || process.env.NODE_ENV !== 'production')
) {
  (window as unknown as { crashLogger: typeof crashLogger }).crashLogger = crashLogger;
}
