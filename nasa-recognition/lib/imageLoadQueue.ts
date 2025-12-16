/**
 * Image Load Queue Manager
 * Limits concurrent image loading to prevent iOS Safari crashes
 * 
 * CRITICAL: This is a module-level singleton that persists across HMR/refreshes.
 * Must track all timers and provide cleanup to prevent accumulation.
 */

class ImageLoadQueue {
  private queue: Array<(done: () => void) => void> = [];
  private loading = 0;
  private readonly maxConcurrent = 3; // Only load 3 images at a time
  private timeoutRefs: Set<ReturnType<typeof setTimeout>> = new Set();

  enqueue(loadFn: (done: () => void) => void) {
    this.queue.push(loadFn);
    this.processQueue();
  }

  private processQueue() {
    while (this.loading < this.maxConcurrent && this.queue.length > 0) {
      const loadFn = this.queue.shift();
      if (loadFn) {
        this.loading++;
        
        let completed = false;
        const done = () => {
          if (completed) return;
          completed = true;
          this.loading--;
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
          loadFn(done);
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
  }
}

export const imageLoadQueue = new ImageLoadQueue();

// Auto-cleanup on page unload to prevent accumulation across refreshes
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    imageLoadQueue.reset();
  });
}
