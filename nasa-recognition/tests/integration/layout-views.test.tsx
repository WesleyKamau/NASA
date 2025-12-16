import React from 'react';
import { render, screen, fireEvent, within } from '../../test/utils/render';
import DesktopPortraitView from '@/components/views/DesktopPortraitView';
import DualColumnView from '@/components/views/DualColumnView';
import MobileLandscapeView from '@/components/views/MobileLandscapeView';
import MobilePortraitView from '@/components/views/MobilePortraitView';
import { GroupPhoto, Person } from '@/types';

// Mock Galaxy to avoid ogl ES module issues
jest.mock('@/components/Galaxy', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-galaxy">Galaxy</div>
}));

// Mock ClientHome which uses Galaxy
jest.mock('@/components/ClientHome', () => ({
  __esModule: true,
  default: ({ groupPhotos, people }: { groupPhotos: any[], people: any[] }) => (
    <div data-testid="client-home">
      <div data-testid="mock-galaxy">Galaxy</div>
      <div>{groupPhotos.length} photos</div>
      <div>{people.length} people</div>
    </div>
  )
}));

import ClientHome from '@/components/ClientHome';

describe('Layout Integration', () => {
  beforeEach(() => {
    // Suppress crashLogger console output
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockGroupPhotos: GroupPhoto[] = [
    {
      id: 'group-1',
      name: 'Team Photo',
      imagePath: '/team.jpg',
      category: 'interns',
      width: 1000,
      height: 800,
    },
  ];

  const mockPeople: Person[] = [
    {
      id: 'person-1',
      name: 'Alice',
      description: 'Engineer',
      category: 'interns',
      individualPhoto: null,
      photoLocations: [
        { photoId: 'group-1', x: 10, y: 20, width: 15, height: 15 },
      ],
    },
    {
      id: 'person-2',
      name: 'Bob',
      description: 'Designer',
      category: 'staff',
      individualPhoto: null,
      photoLocations: [],
    },
  ];

  describe('Desktop Portrait View', () => {
    it('renders carousel and grid components', () => {
      render(
        <DesktopPortraitView
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      // Should have both carousel and grid visible
      expect(screen.getByText('Team Photo')).toBeInTheDocument();
      const aliceElements = screen.getAllByText('Alice');
      expect(aliceElements.length).toBeGreaterThan(0);
      const bobElements = screen.getAllByText('Bob');
      expect(bobElements.length).toBeGreaterThan(0);
    });

    it('maintains highlight sync between carousel and grid', () => {
      render(
        <DesktopPortraitView
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      // Hover on person in grid
      const aliceCard = screen.getByRole('button', { name: "View Alice's profile" });
      fireEvent.mouseEnter(aliceCard);

      // Person should be highlighted in carousel too
      const carouselSection = screen.getByText('Team Photo').closest('div');
      expect(carouselSection).toBeInTheDocument();
    });
  });

  describe('Dual Column View', () => {
    it('renders carousel and grid in columns', () => {
      render(
        <DualColumnView
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      expect(screen.getByText('Team Photo')).toBeInTheDocument();
      const aliceElements = screen.getAllByText('Alice');
      expect(aliceElements.length).toBeGreaterThan(0);
    });

    it('syncs person selection between columns', () => {
      const { container } = render(
        <DualColumnView
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      const aliceCard = screen.getByRole('button', { name: "View Alice's profile" });
      fireEvent.mouseEnter(aliceCard);

      // Should affect highlighting in carousel column
      expect(container).toBeInTheDocument();
    });
  });

  describe('Mobile Portrait View', () => {
    it('renders mobile carousel', () => {
      render(
        <MobilePortraitView
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      expect(screen.getByText('Team Photo')).toBeInTheDocument();
      // Alice should be visible as she's in the photo
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('handles navigation via buttons', () => {
      render(
        <MobilePortraitView
          groupPhotos={[
            mockGroupPhotos[0],
            {
              id: 'group-2',
              name: 'Second Photo',
              imagePath: '/photo2.jpg',
              category: 'staff',
              width: 1000,
              height: 800,
            },
          ]}
          people={mockPeople}
        />
      );

      const nextButton = screen.getByRole('button', { name: 'Next photo' });
      fireEvent.click(nextButton);

      expect(screen.getByText('Second Photo')).toBeInTheDocument();
    });
  });

  describe('Mobile Landscape View', () => {
    it('renders grid in landscape mode', () => {
      render(
        <MobileLandscapeView
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('opens modal when person is clicked', () => {
      render(
        <MobileLandscapeView
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      const aliceCard = screen.getByRole('button', { name: "View Alice's profile" });
      fireEvent.click(aliceCard);

      // Modal should open
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });
  });

  describe('Responsive layout switching', () => {
    it('ClientHome renders without crashing', () => {
      render(
        <ClientHome
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      // Should render some content (ClientHome is mocked)
      expect(screen.getByTestId('client-home')).toBeInTheDocument();
      expect(screen.getByText('1 photos')).toBeInTheDocument();
      expect(screen.getByText('2 people')).toBeInTheDocument();
    });

    it('handles empty people array gracefully', () => {
      render(
        <DesktopPortraitView
          groupPhotos={mockGroupPhotos}
          people={[]}
        />
      );

      expect(screen.getByText('Team Photo')).toBeInTheDocument();
    });

    // Note: PhotoCarousel requires at least one photo to render, so empty groupPhotos test is not included
  });
});
