import { preloadAll } from '@/lib/preload';

describe('preload utilities', () => {
  it('preloadAll resolves immediately (preloading disabled)', async () => {
    await expect(preloadAll([], [])).resolves.toBeUndefined();
  });

  it('preloadAll can be called multiple times', async () => {
    await preloadAll([], []);
    await preloadAll([], []);
  });
});
