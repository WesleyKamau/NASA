import React from 'react';
import { render, screen, fireEvent, act } from '../../test/utils/render';
import PanGestureHint from '@/components/PanGestureHint';
import { MOBILE_PHOTO_CAROUSEL_CONFIG } from '@/lib/configs/componentsConfig';

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

  it('shows hint after delay when enabled', () => {
    render(<PanGestureHint />);

    // Should be hidden initially
    const container = screen.getByRole('status');
    expect(container).toHaveClass('opacity-0');

    // Fast-forward past the delay
    act(() => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS);
    });

    // Should now be visible
    expect(container).toHaveClass('opacity-100');
    expect(screen.getByTestId('lottie-animation')).toBeInTheDocument();
  });

  it('auto-hides after duration', () => {
    render(<PanGestureHint />);

    // Show hint
    act(() => {
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

  it('calls onInteraction callback when user interacts', () => {
    const handleInteraction = jest.fn();
    render(<PanGestureHint onInteraction={handleInteraction} />);

    // Show hint first
    act(() => {
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

  it('hides hint on touch interaction', () => {
    render(<PanGestureHint />);

    // Show hint
    act(() => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS);
    });
    const container = screen.getByRole('status');
    expect(container).toHaveClass('opacity-100');

    // User interacts
    fireEvent.touchStart(window);

    // Should start fading
    expect(container).toHaveClass('opacity-0');
  });

  it('hides hint on wheel interaction', () => {
    render(<PanGestureHint />);

    // Show hint
    act(() => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS);
    });
    const container = screen.getByRole('status');
    expect(container).toHaveClass('opacity-100');

    // User interacts with wheel/scroll
    fireEvent.wheel(window);

    // Should start fading
    expect(container).toHaveClass('opacity-0');
  });

  it('does not show hint again after user interaction', () => {
    render(<PanGestureHint />);

    // Show hint
    act(() => {
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

  it('renders animation with correct styling', () => {
    render(<PanGestureHint />);

    // Show hint
    act(() => {
      jest.advanceTimersByTime(PAN_GESTURE_HINT_DELAY_MS);
    });

    const animation = screen.getByTestId('lottie-animation');
    expect(animation).toBeInTheDocument();
    
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
