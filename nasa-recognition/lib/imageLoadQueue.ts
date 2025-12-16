/**
 * Image Load Queue Manager
 * Limits concurrent image loading to prevent iOS Safari crashes
 * 
 * CRITICAL: This is a module-level singleton that persists across HMR/refreshes.
 * Must track all timers and provide cleanup to prevent accumulation.
 */

import { scrollManager } from './scrollManager';
import { crashLogger } from './crashLogger';

interface QueueItem {
  id: string;
  loadFn: (done: () => void) => void;
}

class ImageLoadQueue {
  private queue: QueueItem[] = [];
  private loading = 0;
  private readonly maxConcurrent = 3; // Only load 3 images at a time
  private readonly maxQueueSize = 20; // Aggressive limit - prevents queue explosion during rapid scroll
  private timeoutRefs: Set<ReturnType<typeof setTimeout>> = new Set();
  private activeIds: Set<string> = new Set(); // Track images currently loading/queued
  private processedIds: Set<string> = new Set(); // Track completed images

  enqueue(id: string, loadFn: (done: () => void) => void): boolean {
    // CRITICAL: Block ALL queueing during active scrolling
    // This prevents memory spikes from rapid scroll events
    if (scrollManager.getIsScrolling()) {
      crashLogger.log('scroll', `Queue blocked during scroll: ${id}`);
      return false; // Return false so caller knows to retry later
    }

    // Deduplicate: skip if already processed, loading, or queued
    if (this.processedIds.has(id) || this.activeIds.has(id)) {
      return true; // Return true - already handled, no retry needed
    }

    // Prevent queue explosion: if queue is full, skip this image
    // It will be retried when it comes back into viewport
    if (this.queue.length >= this.maxQueueSize) {
      crashLogger.log('image', `Queue full (${this.queue.length}/${this.maxQueueSize}), skipping ${id}`);
      return false; // Return false so caller knows to retry later
    }

    crashLogger.log('image', `Enqueuing image: ${id} (queue: ${this.queue.length}, loading: ${this.loading})`);
    this.activeIds.add(id);
    this.queue.push({ id, loadFn });
    this.processQueue();
    return true; // Successfully queued
  }

  private processQueue() {
    while (this.loading < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        this.loading++;
        
        let completed = false;
        const done = () => {
          if (completed) return;
          completed = true;
          this.loading--;
          this.activeIds.delete(item.id);
          this.processedIds.add(item.id);
          this.processQueue();
        };

        // Safety timeout: if image takes too long (e.g. 5s), move on to prevent stalling
        // Track this timeout to allow cleanup
        const timeoutId = setTimeout(() => {
          this.timeoutRefs.delete(timeoutId);
          if (!completed) {
            done();
          }
        }, 5000);
        this.timeoutRefs.add(timeoutId);

        try {
          item.loadFn(done);
        } catch (e) {
          console.error('Error in image load queue', e);
          done();
        }
      }
    }
  }

  /**
   * Reset the queue state and clear all pending timers.
   * Call this when component unmounts or on page unload to prevent accumulation.
   */
  reset() {
    // Clear all pending timeouts
    this.timeoutRefs.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeoutRefs.clear();
    
    // Reset queue state
    this.queue = [];
    this.loading = 0;
    this.activeIds.clear();
    this.processedIds.clear();
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    scrollManager.reset();
  });
}

export const imageLoadQueue = new ImageLoadQueue();

// Auto-cleanup on page unload to prevent accumulation across refreshes
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    imageLoadQueue.reset();
  });
}
