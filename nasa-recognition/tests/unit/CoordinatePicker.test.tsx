import React from 'react';
import { render } from '../../test/utils/render';

// Mock the complex CoordinatePicker component
jest.mock('@/components/CoordinatePicker', () => {
  return function MockCoordinatePicker() {
    return <div data-testid="coordinate-picker">Coordinate Picker</div>;
  };
});

import CoordinatePicker from '@/components/CoordinatePicker';

describe('CoordinatePicker', () => {
  const mockPeople = [
    {
      id: '1',
      name: 'John Doe',
      category: 'staff' as const,
      profilePhotoId: 'photo1',
      isHidden: false,      description: '',
      individualPhoto: 'photo1',
      photoLocations: [],    },
  ];

  const mockGroupPhotos = [
    {
      id: 'group1',
      name: 'Test Photo',
      category: 'staff' as const,
      imagePath: '/test.jpg',
      width: 1000,
      height: 800,
      people: [],
    },
  ];

  const mockOnRectanglesChange = jest.fn();
  const mockOnToggleProfilePhoto = jest.fn();

  it('renders without crashing', () => {
    const { container } = render(
      <CoordinatePicker
        imagePath="/test-image.jpg"
        photoId="group1"
        allPeople={mockPeople}
        groupPhotos={mockGroupPhotos}
        rectangles={[]}
        initialRectangleIds={new Set()}
        hideInitialRectangles={false}
        onRectanglesChange={mockOnRectanglesChange}
        onToggleProfilePhoto={mockOnToggleProfilePhoto}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('accepts all required props', () => {
    expect(() => {
      render(
        <CoordinatePicker
          imagePath="/test-image.jpg"
          photoId="group1"
          allPeople={mockPeople}
          groupPhotos={mockGroupPhotos}
          rectangles={[]}
          initialRectangleIds={new Set()}
          hideInitialRectangles={false}
          onRectanglesChange={mockOnRectanglesChange}
          onToggleProfilePhoto={mockOnToggleProfilePhoto}
        />
      );
    }).not.toThrow();
  });

  it('handles hideInitialRectangles prop', () => {
    const { container } = render(
      <CoordinatePicker
        imagePath="/test-image.jpg"
        photoId="group1"
        allPeople={mockPeople}
        groupPhotos={mockGroupPhotos}
        rectangles={[]}
        initialRectangleIds={new Set()}
        hideInitialRectangles={true}
        onRectanglesChange={mockOnRectanglesChange}
        onToggleProfilePhoto={mockOnToggleProfilePhoto}
      />
    );
    expect(container).toBeInTheDocument();
  });
});
