import React from 'react';
import { render } from '../../test/utils/render';
import FloatingRocket from '@/components/FloatingRocket';

describe('FloatingRocket', () => {
  it('renders without crashing', () => {
    const { container } = render(<FloatingRocket />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders rocket SVG elements', () => {
    const { container } = render(<FloatingRocket />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '60');
    expect(svg).toHaveAttribute('height', '80');
  });

  it('has fixed positioning at bottom right', () => {
    const { container } = render(<FloatingRocket />);
    
    const wrapper = container.querySelector('.fixed');
    expect(wrapper).toHaveClass('bottom-10');
    expect(wrapper).toHaveClass('right-10');
  });

  it('has pointer-events-none class', () => {
    const { container } = render(<FloatingRocket />);
    
    const wrapper = container.querySelector('.fixed');
    expect(wrapper).toHaveClass('pointer-events-none');
  });

  it('has animate-float class for animation', () => {
    const { container } = render(<FloatingRocket />);
    
    const wrapper = container.querySelector('.fixed');
    expect(wrapper).toHaveClass('animate-float');
  });

  it('renders flame animation with pulse', () => {
    const { container } = render(<FloatingRocket />);
    
    const flames = container.querySelector('g.animate-pulse');
    expect(flames).toBeInTheDocument();
  });

  it('renders rocket body parts', () => {
    const { container } = render(<FloatingRocket />);
    
    // Check for various rocket elements
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
    
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('renders glow effect', () => {
    const { container } = render(<FloatingRocket />);
    
    const glow = container.querySelector('.blur-xl.bg-blue-500\\/20');
    expect(glow).toBeInTheDocument();
    expect(glow).toHaveClass('animate-pulse');
  });
});
