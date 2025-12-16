import '@testing-library/jest-dom';

// Basic mock for next/image to behave like an img in tests
jest.mock('next/image', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  const Mock = React.forwardRef(function NextImageMock(props: any, ref: any) {
    const { src, alt, priority, unoptimized, ...rest } = props;
    // Omit next/image specific props that aren't valid DOM attributes
    return React.createElement('img', { ref, src, alt, ...rest });
  });
  return Mock;
});

// IntersectionObserver mock
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
(global as any).IntersectionObserver = MockIntersectionObserver as any;

// ResizeObserver mock
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global as any).ResizeObserver = MockResizeObserver as any;

// requestAnimationFrame mock fallback
if (!(global as any).requestAnimationFrame) {
  (global as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16);
  (global as any).cancelAnimationFrame = (id: number) => clearTimeout(id as unknown as NodeJS.Timeout);
}

// matchMedia mock for components using media queries
if (!(window as any).matchMedia) {
  (window as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
