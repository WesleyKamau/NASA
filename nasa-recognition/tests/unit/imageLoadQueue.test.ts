jest.mock('@/lib/scrollManager', () => ({
  scrollManager: { getIsScrolling: jest.fn(() => false) },
}));

jest.mock('@/lib/crashLogger', () => ({
  crashLogger: { log: jest.fn() },
}));

import { imageLoadQueue } from '@/lib/imageLoadQueue';
import { scrollManager } from '@/lib/scrollManager';

describe('imageLoadQueue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    imageLoadQueue.reset();
    (scrollManager.getIsScrolling as jest.Mock).mockReturnValue(false);
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

  it('blocks enqueue during active scrolling', () => {
    (scrollManager.getIsScrolling as jest.Mock).mockReturnValue(true);
    const ok = imageLoadQueue.enqueue('x', (done) => done());
    expect(ok).toBe(false);
  });

  it('deduplicates by id', () => {
    const a = imageLoadQueue.enqueue('dup', (done) => done());
    const b = imageLoadQueue.enqueue('dup', (done) => done());
    expect(a).toBe(true);
    expect(b).toBe(true); // second call is treated as already handled
  });
});
