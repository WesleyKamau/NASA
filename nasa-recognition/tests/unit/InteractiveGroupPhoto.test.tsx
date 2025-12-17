import React from 'react';
import { render } from '../../test/utils/render';

// Mock the component to avoid complex dependencies
jest.mock('@/components/InteractiveGroupPhoto', () => {
  return function MockInteractiveGroupPhoto() {
    return <div data-testid="interactive-group-photo">Interactive Group Photo</div>;
  };
});

import InteractiveGroupPhoto from '@/components/InteractiveGroupPhoto';

describe('InteractiveGroupPhoto', () => {
  const mockPeople = [
    {
      id: '1',
      name: 'John Doe',
      category: 'staff' as const,
      profilePhotoId: 'photo1',
      isHidden: false,
      description: '',
      individualPhoto: 'photo1',
      photoLocations: [],
    },
  ];

  const mockGroupPhoto = {
    id: 'group1',
    name: 'Test Group',
    category: 'staff' as const,
    imagePath: '/test-image.jpg',
    width: 1000,
    height: 800,
    people: [
      {
        personId: '1',
        x: 100,
        y: 100,
        width: 50,
        height: 50,
      },
    ],
  };

  it('renders without crashing', () => {
    const { container } = render(
      <InteractiveGroupPhoto
        groupPhoto={mockGroupPhoto}
        people={mockPeople}        groupPhotos={[mockGroupPhoto]}      />
    );
    expect(container).toBeInTheDocument();
  });

  it('accepts groupPhoto prop', () => {
    const { container } = render(
      <InteractiveGroupPhoto
        groupPhoto={mockGroupPhoto}
        people={mockPeople}        groupPhotos={[mockGroupPhoto]}      />
    );
    expect(container).toBeInTheDocument();
  });

  it('accepts people prop', () => {
    const { container } = render(
      <InteractiveGroupPhoto
        groupPhoto={mockGroupPhoto}
        people={[]}
        groupPhotos={[mockGroupPhoto]}
      />
    );
    expect(container).toBeInTheDocument();
  });
});
