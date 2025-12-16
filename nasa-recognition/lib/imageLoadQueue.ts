/**
 * Image Load Queue Manager
 * Limits concurrent image loading to prevent iOS Safari crashes
 */

class ImageLoadQueue {
  private queue: Array<(done: () => void) => void> = [];
  private loading = 0;
  private readonly maxConcurrent = 3; // Only load 3 images at a time

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
        setTimeout(() => {
          if (!completed) {
            done();
          }
        }, 5000);

        try {
          loadFn(done);
        } catch (e) {
          console.error('Error in image load queue', e);
          done();
        }
      }
    }
  }
}

export const imageLoadQueue = new ImageLoadQueue();
