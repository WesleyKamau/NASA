import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

type ProvidersProps = { children: React.ReactNode };

function AllProviders({ children }: ProvidersProps) {
  // Add global contexts/providers here if needed for components under test
  return <>{children}</>;
}

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
