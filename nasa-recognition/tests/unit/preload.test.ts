import { preloadImage, preloadCarouselImages, preloadPersonImages, preloadCarouselHighlights, preloadAll, cleanupHighlights } from '@/lib/preload';

function mockRAFDeferred() {
  const calls: FrameRequestCallback[] = [];
  const raf = (cb: FrameRequestCallback) => { calls.push(cb); return calls.length; };
  const caf = (_: number) => void 0;
  const flush = () => { const cbs = calls.splice(0); cbs.forEach(cb => cb(Date.now())); };
  return { raf, caf, flush };
}

describe('preload utilities', () => {
  beforeEach(() => {
    // use jsdom Image; no override here
  });

  it('preloadImage resolves on manual load trigger', async () => {
    const promise = preloadImage('/x.jpg');
    // Find the appended img and trigger onload
    const container = document.getElementById('preload-images-container')!;
    const img = container.querySelector('img') as any;
    expect(img).toBeTruthy();
    img.onload();
    await expect(promise).resolves.toBeUndefined();
  });

  it('preloadImage rejects on error', async () => {
    const promise = preloadImage('/y.jpg');
    const container = document.getElementById('preload-images-container')!;
    const img = container.querySelector('img:last-of-type') as any;
    img.onerror();
    await expect(promise).rejects.toBeInstanceOf(Error);
  });

  it('preloads carousel and person images with logging on failure', async () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const groupPhotos = [ { id: 'p1', name: 'p1', imagePath: '/p1.jpg', category: 'interns' } as any ];
    const people = [ { id: 'a', name: 'A', category: 'interns', individualPhoto: '/a.jpg', photoLocations: [] } as any ];

    const p1 = preloadCarouselImages(groupPhotos);
    // trigger onload for all preloaded images
    const c1 = document.getElementById('preload-images-container')!;
    c1.querySelectorAll('img').forEach((img: any) => img.onload());
    await p1;

    const p2 = preloadPersonImages(people);
    const c2 = document.getElementById('preload-images-container')!;
    c2.querySelectorAll('img').forEach((img: any) => img.onload());
    await p2;
    expect(consoleWarn).not.toHaveBeenCalled();
    consoleWarn.mockRestore();
  });

  it('preloads highlights and cleans up', async () => {
    const { raf, caf, flush } = mockRAFDeferred();
    (global as any).requestAnimationFrame = raf as any;
    (global as any).cancelAnimationFrame = caf as any;

    const groupPhotos = [ { id: 'p1', name: 'p1', imagePath: '/p1.jpg', category: 'interns' } as any ];
    const people = [ { id: 'a', name: 'A', category: 'interns', individualPhoto: null, photoLocations: [ { photoId: 'p1', x: 1, y: 2, width: 3, height: 4 } ] } as any ];

    await preloadCarouselHighlights(groupPhotos, people);
    const container = document.getElementById('preload-highlights-container');
    expect(container).toBeInTheDocument();
    // Now flush RAF to trigger cleanupHighlights inside module
    flush();
    flush();
    expect(document.getElementById('preload-highlights-container')).toBeNull();
  });

  it('preloadAll runs all and resets guards', async () => {
    await preloadAll([], []);
    // call again to hit guard reuse path
    await preloadAll([], []);
  });
});
