import React from 'react';
import { render, screen } from '../../test/utils/render';
import { GENERAL_COMPONENT_CONFIG } from '@/lib/configs/componentsConfig';

describe('Sanity', () => {
  it('renders a simple element', () => {
    render(<div>hello test</div>);
    expect(screen.getByText('hello test')).toBeInTheDocument();
  });

  it('can import via @ alias', () => {
    expect(GENERAL_COMPONENT_CONFIG).toBeTruthy();
  });
});
