import '@testing-library/jest-dom';

// Suppress React warnings about boolean attributes on SVG elements in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Received `true` for a non-boolean attribute') ||
       args[0].includes('for a non-boolean attribute'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Basic mock for next/image to behave like an img in tests
jest.mock('next/image', () => {
   
  const React = require('react');
  interface NextImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    [key: string]: unknown;
  }
  const Mock = React.forwardRef<HTMLImageElement, NextImageProps>(function NextImageMock(props, ref) {
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
(global as unknown as { IntersectionObserver: typeof MockIntersectionObserver }).IntersectionObserver = MockIntersectionObserver;

// ResizeObserver mock
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global as unknown as { ResizeObserver: typeof MockResizeObserver }).ResizeObserver = MockResizeObserver;

// requestAnimationFrame mock fallback
if (!((global as unknown as { requestAnimationFrame?: unknown }).requestAnimationFrame)) {
  (global as unknown as { requestAnimationFrame: (cb: FrameRequestCallback) => number }).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16);
  (global as unknown as { cancelAnimationFrame: (id: number) => void }).cancelAnimationFrame = (id: number) => clearTimeout(id as unknown as NodeJS.Timeout);
}

// matchMedia mock for components using media queries
if (!((window as unknown as { matchMedia?: unknown }).matchMedia)) {
  (window as unknown as { matchMedia: (query: string) => unknown }).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// window.scrollTo mock to suppress 'Not implemented' warnings in jsdom
window.scrollTo = jest.fn();
