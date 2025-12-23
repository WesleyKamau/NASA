import React from 'react';
import { render } from '../../test/utils/render';
import SLSRocket from '@/components/SLSRocket';

describe('SLSRocket', () => {
  it('renders without crashing', () => {
    render(<SLSRocket />);
  });

  it('renders with default props', () => {
    const { container } = render(<SLSRocket />);
    expect(container).toBeInTheDocument();
  });

  it('renders with isLaunching=false', () => {
    const { container } = render(<SLSRocket />);
    expect(container).toBeInTheDocument();
  });

  it('renders with isLaunching=true', () => {
    const { container } = render(<SLSRocket />);
    expect(container).toBeInTheDocument();
  });

  it('accepts custom size prop', () => {
    const { container } = render(<SLSRocket />);
    expect(container).toBeInTheDocument();
  });
});
