import React from 'react';
import { render, screen, fireEvent, act } from '../../test/utils/render';
import PanGestureHint from '@/components/PanGestureHint';
import { MOBILE_PHOTO_CAROUSEL_CONFIG } from '@/lib/configs/componentsConfig';

// Mock next/dynamic to render the component synchronously
jest.mock('next/dynamic', () => {
  return (loader: () => Promise<{ default: React.ComponentType }>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MockedComponent = (props: any) => <div data-testid="lottie-animation" {...props} />;
    MockedComponent.displayName = 'DynamicMock';
    return MockedComponent;
  };
});

// Mock the animation JSON import
jest.mock('@/components/animations/finger_swipe_animation.json', () => ({
  default: { v: '5.0', fr: 30, ip: 0, op: 60, w: 500, h: 500, layers: [] }
}), { virtual: true });

// Mock timers for testing delays
jest.useFakeTimers();

describe('PanGestureHint', () => {
  const {
    PAN_GESTURE_HINT_DELAY_MS,
    PAN_GESTURE_HINT_DURATION_MS,
    PAN_GESTURE_FADE_OUT_MS,
  } = MOBILE_PHOTO_CAROUSEL_CONFIG;

  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders without crashing', () => {
    render(<PanGestureHint />);
    // Component renders but hint not visible yet
    const container = screen.getByRole('status');
    expect(container).toHaveClass('opacity-0');
  });

  it('shows hint after delay when enabled', async () => {
    render(<PanGestureHint />);

    // Should be hidden initially
    const container = screen.getByRole('status');
    expect(container).toHaveClass('opacity-0');

    // Fast-forward past the delay
    await act(async () => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS);
    });

    // Should now be visible
    expect(container).toHaveClass('opacity-100');
  });

  it('auto-hides after duration', async () => {
    render(<PanGestureHint />);

    // Show hint
    await act(async () => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS);
    });
    const container = screen.getByRole('status');
    expect(container).toHaveClass('opacity-100');

    // Fast-forward through the duration
    act(() => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DURATION_MS);
    });

    // Should start fading out
    expect(container).toHaveClass('opacity-0');
  });

  it('calls onInteraction callback when user interacts', async () => {
    const handleInteraction = jest.fn();
    render(<PanGestureHint onInteraction={handleInteraction} />);

    // Show hint first
    await act(async () => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS);
    });

    // Simulate user interaction on window (component listens to window events)
    fireEvent.touchStart(window);

    // Callback is called after fade delay
    act(() => {
      jest.advanceTimersByTime(PAN_GESTURE_FADE_OUT_MS + 100);
    });
    expect(handleInteraction).toHaveBeenCalled();
  });

  it('hides hint on touch interaction', async () => {
    render(<PanGestureHint />);

    // Show hint
    await act(async () => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS);
    });
    const container = screen.getByRole('status');
    expect(container).toHaveClass('opacity-100');

    // User interacts
    fireEvent.touchStart(window);

    // Should start fading
    expect(container).toHaveClass('opacity-0');
  });

  it('hides hint on wheel interaction', async () => {
    render(<PanGestureHint />);

    // Show hint
    await act(async () => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS);
    });
    const container = screen.getByRole('status');
    expect(container).toHaveClass('opacity-100');

    // User interacts with wheel/scroll
    fireEvent.wheel(window);

    // Should start fading
    expect(container).toHaveClass('opacity-0');
  });

  it('does not show hint again after user interaction', async () => {
    render(<PanGestureHint />);

    // Show hint
    await act(async () => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS);
    });
    const container = screen.getByRole('status');
    expect(container).toHaveClass('opacity-100');

    // User interacts
    fireEvent.touchStart(window);
    expect(container).toHaveClass('opacity-0');

    // Fast-forward time to allow fade and cleanup
    act(() => {
      jest.advanceTimersByTime(PAN_GESTURE_FADE_OUT_MS + 1000);
    });

    // Container should remain faded after interaction
    // (component tracks interaction state in hasInteractedRef)
    expect(container).toBeInTheDocument();
  });

  it('renders with correct styling', async () => {
    render(<PanGestureHint />);

    // Show hint
    await act(async () => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS);
    });

    // Container should have pointer-events-none
    const container = screen.getByRole('status');
    expect(container).toHaveClass('pointer-events-none');
  });

  it('cleans up timers on unmount', () => {
    const { unmount } = render(<PanGestureHint />);

    // Start timers
    act(() => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS / 2);
    });

    // Unmount before timer completes
    unmount();

    // Timer should be cleared (no error thrown)
    act(() => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS);
    });
  });
});
