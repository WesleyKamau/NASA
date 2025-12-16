describe('scrollManager', () => {
  beforeEach(() => {
    jest.resetModules();
    // Suppress crashLogger console output
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sets isScrolling true on scroll and resets after debounce', () => {
    jest.useFakeTimers();
    const { scrollManager } = require('@/lib/scrollManager');

    expect(scrollManager.getIsScrolling()).toBe(false);
    // dispatch scroll
    window.dispatchEvent(new Event('scroll'));
    expect(scrollManager.getIsScrolling()).toBe(true);

    // after 300ms debounce, should set false
    jest.advanceTimersByTime(300);
    expect(scrollManager.getIsScrolling()).toBe(false);
    jest.useRealTimers();
  });
});
