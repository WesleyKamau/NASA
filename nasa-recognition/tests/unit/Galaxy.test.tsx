import React from 'react';
import { render } from '../../test/utils/render';
// import { fireEvent, act } from '../../test/utils/render'; // TODO: Not currently used
import GalaxyBackground from '@/components/GalaxyBackground';

// Mock the Galaxy component since it uses WebGL (ogl library with ES modules)
jest.mock('@/components/Galaxy', () => {
  return function MockGalaxy(props: Record<string, unknown>) {
    return (
      <div 
        className="w-full h-full relative" 
        data-testid="mock-galaxy"
        data-props={JSON.stringify(props)}
      />
    );
  };
});

describe('GalaxyBackground', () => {
  it('renders without crashing', () => {
    const { container } = render(<GalaxyBackground />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('has fixed positioning', () => {
    const { container } = render(<GalaxyBackground />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('fixed');
    expect(wrapper).toHaveClass('inset-0');
  });

  it('has z-0 for background layering', () => {
    const { container } = render(<GalaxyBackground />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('z-0');
  });

  it('has pointer-events-none', () => {
    const { container } = render(<GalaxyBackground />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('pointer-events-none');
  });

  it('is aria-hidden for accessibility', () => {
    const { container } = render(<GalaxyBackground />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute('aria-hidden');
  });

  it('renders Galaxy component with correct props', () => {
    const { getByTestId } = render(<GalaxyBackground />);
    const galaxy = getByTestId('mock-galaxy');
    expect(galaxy).toBeInTheDocument();
    
    const props = JSON.parse(galaxy.getAttribute('data-props') || '{}');
    expect(props.focal).toEqual([0.5, 0.5]);
    expect(props.mouseInteraction).toBe(false);
    expect(props.transparent).toBe(true);
  });

  it('configures Galaxy with correct visual settings', () => {
    const { getByTestId } = render(<GalaxyBackground />);
    const galaxy = getByTestId('mock-galaxy');
    
    const props = JSON.parse(galaxy.getAttribute('data-props') || '{}');
    expect(props.density).toBe(1.2);
    expect(props.hueShift).toBe(200);
    expect(props.speed).toBe(0.4);
    expect(props.glowIntensity).toBe(0.1);
    expect(props.saturation).toBe(0.08);
  });

  it('configures Galaxy with no mouse interaction', () => {
    const { getByTestId } = render(<GalaxyBackground />);
    const galaxy = getByTestId('mock-galaxy');
    
    const props = JSON.parse(galaxy.getAttribute('data-props') || '{}');
    expect(props.mouseInteraction).toBe(false);
    expect(props.mouseRepulsion).toBe(false);
  });

  it('configures Galaxy with animation settings', () => {
    const { getByTestId } = render(<GalaxyBackground />);
    const galaxy = getByTestId('mock-galaxy');
    
    const props = JSON.parse(galaxy.getAttribute('data-props') || '{}');
    expect(props.starSpeed).toBe(0.25);
    expect(props.twinkleIntensity).toBe(0.4);
    expect(props.rotationSpeed).toBe(0.05);
  });
});
