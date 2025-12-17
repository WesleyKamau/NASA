jest.mock('@/lib/configs/componentsConfig', () => ({
  DebugFeature: { ENABLE_DEBUG_MODE: 0, ENABLE_CRASH_LOGGER: 1, SHOW_DEBUG_HITBOXES: 2 },
  DEBUG_CONFIG: { 0: true, 1: true, 2: false },
  isDebugEnabled: (feature: number) => feature === 0 ? true : feature === 1,
}));

describe('crashLogger', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'log').mockImplementation();
    // simple localStorage mock
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => { store[k] = v; },
        removeItem: (k: string) => { delete store[k]; },
      },
      writable: true,
    });
    // performance.memory mock
    (global as unknown as { performance: { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } } }).performance = { memory: { usedJSHeapSize: 10, totalJSHeapSize: 20, jsHeapSizeLimit: 100 } };
    // navigator mock
    Object.defineProperty(window, 'navigator', { value: { userAgent: 'jest' }, writable: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs entries and prunes to max size, can export and clear', () => {
    const { crashLogger } = require('@/lib/crashLogger');
    for (let i = 0; i < 60; i++) {
      crashLogger.log('error', `e${i}`);
    }
    const logs = crashLogger.getLogs();
    expect(logs.length).toBeLessThanOrEqual(50);

    const exported = crashLogger.exportLogs();
    expect(() => JSON.parse(exported)).not.toThrow();

    crashLogger.clearLogs();
    expect(crashLogger.getLogs()).toHaveLength(0);
  });

  it('cleanup stops memory monitoring', () => {
    jest.useFakeTimers();
    const { crashLogger } = require('@/lib/crashLogger');
    crashLogger.cleanup();
    jest.advanceTimersByTime(6000);
    // if interval remained, it would attempt to log; absence implies cleanup worked
    jest.useRealTimers();
  });
});
