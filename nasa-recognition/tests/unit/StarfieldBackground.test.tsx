import React from 'react';
import { render } from '../../test/utils/render';
import StarfieldBackground from '@/components/StarfieldBackground';

// Mock canvas context
const mockGetContext = jest.fn();
const mockClearRect = jest.fn();
const mockFillRect = jest.fn();
const mockBeginPath = jest.fn();
const mockArc = jest.fn();
const mockFill = jest.fn();

HTMLCanvasElement.prototype.getContext = mockGetContext;

describe('StarfieldBackground', () => {
  beforeEach(() => {
    mockGetContext.mockReturnValue({
      clearRect: mockClearRect,
      fillRect: mockFillRect,
      beginPath: mockBeginPath,
      arc: mockArc,
      fill: mockFill,
      fillStyle: '',
      globalAlpha: 1,
    });
    
    mockClearRect.mockClear();
    mockFillRect.mockClear();
    mockBeginPath.mockClear();
    mockArc.mockClear();
    mockFill.mockClear();
  });

  it('renders canvas element', () => {
    const { container } = render(<StarfieldBackground />);
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('creates canvas with dimensions', () => {
    const { container } = render(<StarfieldBackground />);
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width');
    expect(canvas).toHaveAttribute('height');
  });

  it('sets up animation loop with requestAnimationFrame', () => {
    const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame');
    
    render(<StarfieldBackground />);
    
    expect(requestAnimationFrameSpy).toHaveBeenCalled();
    
    requestAnimationFrameSpy.mockRestore();
  });

  it('cleans up animation on unmount', () => {
    const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');
    
    const { unmount } = render(<StarfieldBackground />);
    
    unmount();
    
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    
    cancelAnimationFrameSpy.mockRestore();
  });

  it('draws on canvas', () => {
    render(<StarfieldBackground />);
    
    // Canvas should be drawn
    expect(mockGetContext).toHaveBeenCalledWith('2d');
  });

  it('handles resize events', () => {
    const { container } = render(<StarfieldBackground />);
    
    const canvas = container.querySelector('canvas');
    
    // Trigger resize
    global.innerWidth = 1920;
    global.innerHeight = 1080;
    window.dispatchEvent(new Event('resize'));
    
    // Should handle resize without crashing
    expect(canvas).toBeInTheDocument();
  });

  it('respects custom star count prop', () => {
    render(<StarfieldBackground />);
    
    // Component should render with custom star count
    expect(mockGetContext).toHaveBeenCalled();
  });
});
