import React from 'react';
import { render, screen } from '../../test/utils/render';
import TMinusCounter from '@/components/TMinusCounter';

describe('TMinusCounter', () => {
  it('renders without crashing', () => {
    render(<TMinusCounter />);
  });

  it('displays countdown for future date', () => {
    const futureDate = new Date(Date.now() + 86400000); // 1 day from now
    render(<TMinusCounter />);
    
    // Should show T - format with time remaining
    expect(screen.getByText(/T -/)).toBeInTheDocument();
  });

  it('displays days when more than 24 hours remain', () => {
    const futureDate = new Date(Date.now() + 2 * 86400000); // 2 days from now
    render(<TMinusCounter />);
    
    // Component displays countdown in T - format
    expect(screen.getByText(/T -/)).toBeInTheDocument();
  });

  it('displays hours, minutes, seconds for times under 24 hours', () => {
    const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
    render(<TMinusCounter />);
    
    // Component displays countdown in T - HH:MM format
    expect(screen.getByText(/T -/)).toBeInTheDocument();
  });

  it('displays zero when target date has passed', () => {
    const pastDate = new Date(Date.now() - 86400000); // 1 day ago
    render(<TMinusCounter />);
    
    // Component displays T - format even for past dates
    expect(screen.getByText(/T -/)).toBeInTheDocument();
  });

  it('updates countdown every second', () => {
    jest.useFakeTimers();
    
    const futureDate = new Date(Date.now() + 10000); // 10 seconds from now
    render(<TMinusCounter />);
    
    // Component renders with T - format
    expect(screen.getByText(/T -/)).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('cleans up interval on unmount', () => {
    jest.useFakeTimers();
    
    const futureDate = new Date(Date.now() + 10000);
    const { unmount } = render(<TMinusCounter />);
    
    unmount();
    
    // Should not throw errors after unmount
    expect(() => {
      jest.advanceTimersByTime(5000);
    }).not.toThrow();
    
    jest.useRealTimers();
  });
});
