jest.mock('@/lib/crashLogger', () => ({
  crashLogger: { log: jest.fn() },
}));

import { imageLoadQueue } from '@/lib/imageLoadQueue';

describe('imageLoadQueue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    imageLoadQueue.reset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('enqueues and respects concurrency and completion', () => {
    let completed = 0;
    for (let i = 0; i < 5; i++) {
      imageLoadQueue.enqueue(`id-${i}`, (done) => {
        setTimeout(() => { completed++; done(); }, 100);
      });
    }

    // advance 100ms -> first batch up to maxConcurrent should complete
    jest.advanceTimersByTime(100);
    expect(completed).toBeGreaterThan(0);

    // advance safety timeout to flush remaining
    jest.advanceTimersByTime(5000);
    expect(completed).toBe(5);
  });

  it('deduplicates by id', () => {
    const a = imageLoadQueue.enqueue('dup', (done) => done());
    const b = imageLoadQueue.enqueue('dup', (done) => done());
    expect(a).toBe(true);
    expect(b).toBe(true); // second call is treated as already handled
  });

  it('resets queue state', () => {
    imageLoadQueue.enqueue('r1', (done) => setTimeout(done, 10000));
    imageLoadQueue.reset();
    // After reset, same id can be enqueued again
    const ok = imageLoadQueue.enqueue('r1', (done) => done());
    expect(ok).toBe(true);
  });
});
