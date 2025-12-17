import React from 'react';
import { render, screen } from '../../test/utils/render';
import LoadingWrapper from '@/components/LoadingWrapper';

describe('LoadingWrapper', () => {
  it('renders children', () => {
    render(
      <LoadingWrapper>
        <div>Test Child</div>
      </LoadingWrapper>
    );
    
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() => {
      render(
        <LoadingWrapper>
          <div>Content</div>
        </LoadingWrapper>
      );
    }).not.toThrow();
  });

  it('renders multiple children', () => {
    render(
      <LoadingWrapper>
        <div>Child 1</div>
        <div>Child 2</div>
      </LoadingWrapper>
    );
    
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});
