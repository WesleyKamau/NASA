import React from 'react';
import { render } from '../../test/utils/render';
import BackToTop from '@/components/BackToTop';

describe('BackToTop', () => {
  it('renders without crashing', () => {
    render(<BackToTop />);
  });

  it('renders back to top button', () => {
    const { container } = render(<BackToTop />);
    
    // Button should be in the DOM (may be hidden with CSS)
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
  });

  it('button contains expected text', () => {
    const { container } = render(<BackToTop />);
    
    // Should contain "Back to Top" text
    expect(container.textContent).toMatch(/Back to Top/i);
  });

  it('handles click events', () => {
    const { container } = render(<BackToTop />);
    
    const button = container.querySelector('button');
    expect(() => {
      button?.click();
    }).not.toThrow();
  });

  it('includes visual indicator (icon or emoji)', () => {
    const { container } = render(<BackToTop />);
    
    // Should have some visual indicator (arrow, rocket, etc.)
    const hasIcon = container.querySelector('svg') || container.querySelector('[class*="icon"]') || container.textContent?.includes('🚀');
    expect(hasIcon).toBeTruthy();
  });
});
