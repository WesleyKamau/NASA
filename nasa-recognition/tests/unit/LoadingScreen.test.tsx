import React from 'react';
import { render, screen } from '../../test/utils/render';
import LoadingScreen from '@/components/LoadingScreen';

describe('LoadingScreen', () => {
  it('renders without crashing', () => {
    render(<LoadingScreen assetsLoaded={false} fontsLoaded={false} />);
  });

  it('displays site title', () => {
    render(<LoadingScreen assetsLoaded={false} fontsLoaded={false} />);
    expect(screen.getByText('MSFC Book of Faces')).toBeInTheDocument();
  });

  it('handles loaded assets prop', () => {
    const { container } = render(<LoadingScreen assetsLoaded={true} fontsLoaded={false} />);
    expect(container).toBeInTheDocument();
  });

  it('handles loaded fonts prop', () => {
    const { container } = render(<LoadingScreen assetsLoaded={false} fontsLoaded={true} />);
    expect(container).toBeInTheDocument();
  });

  it('handles onLoadingComplete callback', () => {
    const onLoadingComplete = jest.fn();
    const { container } = render(<LoadingScreen assetsLoaded={true} fontsLoaded={true} onLoadingComplete={onLoadingComplete} />);
    expect(container).toBeInTheDocument();
  });
});
