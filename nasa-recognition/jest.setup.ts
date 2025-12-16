import '@testing-library/jest-dom';

// Suppress React warnings about boolean attributes on SVG elements in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
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

// window.scrollTo mock to suppress 'Not implemented' warnings in jsdom
window.scrollTo = jest.fn();
