/**
 * Global Scroll Manager
 * Prevents image queue operations during active scrolling to eliminate iOS Safari crashes
 */

import { crashLogger } from './crashLogger';
import { isDebugEnabled, DebugFeature } from './configs/componentsConfig';

class ScrollManager {
  private isScrolling = false;
  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<() => void>();
  private scrollHandler: (() => void) | null = null;
  private scrollCount = 0; // Track scroll frequency for debugging

  constructor() {
    if (typeof window !== 'undefined') {
      this.scrollHandler = () => {
        this.scrollCount++;
        
        // Log rapid scrolling for debugging
        if (isDebugEnabled(DebugFeature.ENABLE_CRASH_LOGGER) && this.scrollCount % 10 === 0) {
          crashLogger.log('scroll', `Rapid scroll detected (${this.scrollCount} events)`);
        }
        
        this.isScrolling = true;
        
        // Clear existing timeout
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        
        // Wait 300ms after last scroll event before allowing queueing
        // This is aggressive but necessary for iOS Safari stability
        this.scrollTimeout = setTimeout(() => {
          if (isDebugEnabled(DebugFeature.ENABLE_CRASH_LOGGER)) {
            crashLogger.log('scroll', `Scroll stopped after ${this.scrollCount} events`);
          }
          this.scrollCount = 0;
          this.isScrolling = false;
          this.notifyListeners();
        }, 300);
      };
      
      // Listen to scroll on window and document
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      document.addEventListener('scroll', this.scrollHandler, { passive: true });
    }
  }

  getIsScrolling(): boolean {
    return this.isScrolling;
  }

  /**
   * Subscribe to scroll state changes
   * Returns unsubscribe function
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  reset() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }
    this.isScrolling = false;
    this.listeners.clear();
    
    if (typeof window !== 'undefined' && this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      document.removeEventListener('scroll', this.scrollHandler);
    }
  }
}

// Singleton instance
export const scrollManager = new ScrollManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    scrollManager.reset();
  });
}
