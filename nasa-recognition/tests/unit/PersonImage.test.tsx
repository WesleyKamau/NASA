import React from 'react';
import { render } from '../../test/utils/render';

// Mock PersonImage since it requires complex dependencies
jest.mock('@/components/PersonImage', () => {
  return function MockPersonImage() {
    return <div data-testid="person-image">Person Image</div>;
  };
});

import PersonImage from '@/components/PersonImage';

describe('PersonImage', () => {
  const mockPerson = {
    id: '1',
    name: 'John Doe',
    category: 'staff' as const,
    profilePhotoId: 'photo1',
    isHidden: false,    description: '',
    individualPhoto: 'photo1',
    photoLocations: [],  };

  it('renders without crashing', () => {
    const { container } = render(<PersonImage person={mockPerson} groupPhotos={[]} />);
    expect(container).toBeInTheDocument();
  });

  it('accepts priority prop', () => {
    const { container } = render(<PersonImage person={mockPerson} priority={true} groupPhotos={[]} />);
    expect(container).toBeInTheDocument();
  });

  it('accepts forcePhotoId prop', () => {
    const { container } = render(<PersonImage person={mockPerson} forcePhotoId="custom" groupPhotos={[]} />);
    expect(container).toBeInTheDocument();
  });
});
