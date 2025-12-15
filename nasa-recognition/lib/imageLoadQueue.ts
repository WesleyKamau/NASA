/**
 * Image Load Queue Manager
 * Limits concurrent image loading to prevent iOS Safari crashes
 */

class ImageLoadQueue {
  private queue: Array<() => void> = [];
  private loading = 0;
  private readonly maxConcurrent = 3; // Only load 3 images at a time

  enqueue(loadFn: () => void) {
    this.queue.push(loadFn);
    this.processQueue();
  }

  private processQueue() {
    while (this.loading < this.maxConcurrent && this.queue.length > 0) {
      const loadFn = this.queue.shift();
      if (loadFn) {
        this.loading++;
        loadFn();
        // Assume image load completes, decrement counter after a delay
        setTimeout(() => {
          this.loading--;
          this.processQueue();
        }, 100); // Short delay between batches
      }
    }
  }
}

export const imageLoadQueue = new ImageLoadQueue();
