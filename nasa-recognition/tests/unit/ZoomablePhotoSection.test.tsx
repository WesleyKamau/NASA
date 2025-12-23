import React from 'react';
import { render } from '../../test/utils/render';
import ZoomablePhotoSection from '@/components/ZoomablePhotoSection';

describe('ZoomablePhotoSection', () => {
  const mockPeople = [
    {
      id: '1',
      name: 'John Doe',
      category: 'staff' as const,
      profilePhotoId: 'photo1',
      isHidden: false,
      description: '',
      individualPhoto: 'photo1',
      photoLocations: [{ photoId: 'photo1', x: 0, y: 0, width: 100, height: 100 }],
    },
  ];

  const mockGroupPhotos = [
    {
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
    },
  ];

  it('renders without crashing', () => {
    render(
      <ZoomablePhotoSection
        title="Test Section"
        people={mockPeople}
        groupPhotos={mockGroupPhotos}
      />
    );
  });

  it('renders with multiple group photos', () => {
    const multiplePhotos = [
      { ...mockGroupPhotos[0], id: 'group1' },
      { ...mockGroupPhotos[0], id: 'group2' },
    ];
    
    const { container } = render(
      <ZoomablePhotoSection
        title="Multiple Photos"
        people={mockPeople}
        groupPhotos={multiplePhotos}
      />
    );
    
    // Should render without error
    expect(container).toBeInTheDocument();
  });

  it('renders with empty group photos array', () => {
    render(
      <ZoomablePhotoSection
        title="Empty Photos"
        people={mockPeople}
        groupPhotos={[]}
      />
    );
  });

  it('renders with empty people array', () => {
    render(
      <ZoomablePhotoSection
        title="Empty People"
        people={[]}
        groupPhotos={mockGroupPhotos}
      />
    );
  });
});
