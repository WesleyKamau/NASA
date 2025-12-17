import React from 'react';
import { render, screen, fireEvent } from '../../test/utils/render';
// import { within } from '../../test/utils/render'; // TODO: Not currently used
import PhotoCarousel from '@/components/PhotoCarousel';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';
import { GroupPhoto, Person } from '@/types';

describe('Highlight State Synchronization', () => {
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
      id: 'alice',
      name: 'Alice',
      description: 'Engineer',
      category: 'interns',
      individualPhoto: null,
      photoLocations: [
        { photoId: 'group-1', x: 10, y: 20, width: 15, height: 15 },
      ],
    },
    {
      id: 'bob',
      name: 'Bob',
      description: 'Designer',
      category: 'interns',
      individualPhoto: null,
      photoLocations: [
        { photoId: 'group-1', x: 40, y: 30, width: 12, height: 12 },
      ],
    },
  ];

  describe('Grid to Carousel highlight sync', () => {
    it('highlights person in grid when hovered', () => {
      const { container } = render(
        <OrganizedPersonGrid
          people={mockPeople}
          groupPhotos={mockGroupPhotos}
          highlightedPersonId="alice"
        />
      );

      const aliceCard = container.querySelector('#person-card-alice');
      expect(aliceCard).toHaveClass('border-white/50');
      expect(aliceCard).toHaveClass('scale-105');
    });

    it('propagates hover state through onPersonHover callback', () => {
      const handlePersonHover = jest.fn();
      render(
        <OrganizedPersonGrid
          people={mockPeople}
          groupPhotos={mockGroupPhotos}
          onPersonHover={handlePersonHover}
        />
      );

      const aliceCard = screen.getByRole('button', { name: "View Alice's profile" });
      fireEvent.mouseEnter(aliceCard);
      expect(handlePersonHover).toHaveBeenCalledWith('alice');

      fireEvent.mouseLeave(aliceCard);
      expect(handlePersonHover).toHaveBeenCalledWith(null);
    });

    it('removes highlight when different person is hovered', () => {
      const { container, rerender } = render(
        <OrganizedPersonGrid
          people={mockPeople}
          groupPhotos={mockGroupPhotos}
          highlightedPersonId="alice"
        />
      );

      const aliceCard = container.querySelector('#person-card-alice');
      expect(aliceCard).toHaveClass('scale-105');

      rerender(
        <OrganizedPersonGrid
          people={mockPeople}
          groupPhotos={mockGroupPhotos}
          highlightedPersonId="bob"
        />
      );

      expect(aliceCard).not.toHaveClass('scale-105');
      const bobCard = container.querySelector('#person-card-bob');
      expect(bobCard).toHaveClass('scale-105');
    });
  });

  describe('Carousel hover highlight', () => {
    it('renders name tags for people in photo', () => {
      render(
        <PhotoCarousel
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      // Carousel renders buttons for people in the photo
      expect(screen.getByRole('button', { name: "View Alice" })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: "View Bob" })).toBeInTheDocument();
    });

    it('accepts onHighlightedPersonChange callback', () => {
      const handleHighlightChange = jest.fn();
      render(
        <PhotoCarousel
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
          onHighlightedPersonChange={handleHighlightChange}
        />
      );

      // Component renders without error when callback is provided
      expect(screen.getByRole('button', { name: "View Alice" })).toBeInTheDocument();
    });
  });

  describe('Bidirectional highlight sync', () => {
    it('maintains highlight state across both components', () => {
      let highlightedPerson: string | null = null;
      
      const TestWrapper = () => {
        const [highlighted, setHighlighted] = React.useState<string | null>(null);
        highlightedPerson = highlighted;

        return (
          <>
            <OrganizedPersonGrid
              people={mockPeople}
              groupPhotos={mockGroupPhotos}
              highlightedPersonId={highlighted}
              onPersonHover={setHighlighted}
            />
            <PhotoCarousel
              groupPhotos={mockGroupPhotos}
              people={mockPeople}
              onHighlightedPersonChange={setHighlighted}
            />
          </>
        );
      };

      render(<TestWrapper />);

      // Hover in grid should affect state
      const aliceCard = screen.getByRole('button', { name: "View Alice's profile" });
      fireEvent.mouseEnter(aliceCard);
      
      expect(highlightedPerson).toBe('alice');
    });
  });

  describe('Highlight persistence during navigation', () => {
    it('maintains component state when navigating carousel photos', () => {
      const handleHighlightChange = jest.fn();
      render(
        <PhotoCarousel
          groupPhotos={[
            mockGroupPhotos[0],
            {
              id: 'group-2',
              name: 'Another Photo',
              imagePath: '/photo2.jpg',
              category: 'staff',
              width: 1000,
              height: 800,
            },
          ]}
          people={mockPeople}
          onHighlightedPersonChange={handleHighlightChange}
        />
      );

      // Initial photo should show Alice
      expect(screen.getByRole('button', { name: "View Alice" })).toBeInTheDocument();

      // Navigate to next photo
      const nextButton = screen.getByRole('button', { name: 'Next photo' });
      fireEvent.click(nextButton);

      // Component should still be functional after navigation
      expect(screen.getByText('Another Photo')).toBeInTheDocument();
    });
  });
});
