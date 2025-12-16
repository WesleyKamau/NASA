import React from 'react';
import { render, screen, fireEvent, act } from '../../test/utils/render';
import PhotoCarousel from '@/components/PhotoCarousel';
import MobilePhotoCarousel from '@/components/MobilePhotoCarousel';
import PersonModal from '@/components/PersonModal';
import { GroupPhoto, Person } from '@/types';

describe('Navigation Flow Integration', () => {
  const mockGroupPhotos: GroupPhoto[] = [
    {
      id: 'photo-1',
      name: 'First Photo',
      imagePath: '/photo1.jpg',
      category: 'interns',
      width: 1000,
      height: 800,
    },
    {
      id: 'photo-2',
      name: 'Second Photo',
      imagePath: '/photo2.jpg',
      category: 'staff',
      width: 1200,
      height: 900,
    },
    {
      id: 'photo-3',
      name: 'Third Photo',
      imagePath: '/photo3.jpg',
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
        { photoId: 'photo-1', x: 10, y: 20, width: 15, height: 15 },
      ],
    },
  ];

  describe('Desktop Carousel Navigation', () => {
    it('navigates forward through photos with next button', () => {
      render(
        <PhotoCarousel
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      expect(screen.getByText('First Photo')).toBeInTheDocument();

      const nextButton = screen.getByRole('button', { name: 'Next photo' });
      fireEvent.click(nextButton);

      expect(screen.getByText('Second Photo')).toBeInTheDocument();
    });

    it('navigates backward through photos with prev button', () => {
      render(
        <PhotoCarousel
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      // Go to second photo first
      const nextButton = screen.getByRole('button', { name: 'Next photo' });
      fireEvent.click(nextButton);
      expect(screen.getByText('Second Photo')).toBeInTheDocument();

      // Go back to first
      const prevButton = screen.getByRole('button', { name: 'Previous photo' });
      fireEvent.click(prevButton);
      expect(screen.getByText('First Photo')).toBeInTheDocument();
    });

    it('wraps around when navigating past last photo', () => {
      render(
        <PhotoCarousel
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      const nextButton = screen.getByRole('button', { name: 'Next photo' });
      
      // Click next 3 times (should wrap to first)
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(screen.getByText('First Photo')).toBeInTheDocument();
    });

    it('wraps around when navigating before first photo', () => {
      render(
        <PhotoCarousel
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      const prevButton = screen.getByRole('button', { name: 'Previous photo' });
      fireEvent.click(prevButton);

      // Should wrap to last photo
      expect(screen.getByText('Third Photo')).toBeInTheDocument();
    });

    it('navigates using dot indicators', () => {
      render(
        <PhotoCarousel
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      const thirdPhotoDot = screen.getByRole('button', { name: 'View Third Photo' });
      fireEvent.click(thirdPhotoDot);

      expect(screen.getByText('Third Photo')).toBeInTheDocument();
    });
  });

  describe('Mobile Carousel Navigation', () => {
    it('navigates using prev/next buttons', () => {
      render(
        <MobilePhotoCarousel
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      const nextButton = screen.getByRole('button', { name: 'Next photo' });
      fireEvent.click(nextButton);

      expect(screen.getByText('Second Photo')).toBeInTheDocument();
    });

    it('navigates using dot navigation', () => {
      render(
        <MobilePhotoCarousel
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      const secondPhotoDot = screen.getByRole('button', { name: 'View Second Photo' });
      fireEvent.click(secondPhotoDot);

      expect(screen.getByText('Second Photo')).toBeInTheDocument();
    });
  });

  describe('Modal Navigation', () => {
    it('opens modal and closes with close button', () => {
      render(
        <PersonModal
          person={mockPeople[0]}
          groupPhotos={mockGroupPhotos}
          onClose={jest.fn()}
        />
      );

      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      render(
        <PersonModal
          person={mockPeople[0]}
          groupPhotos={mockGroupPhotos}
          onClose={handleClose}
        />
      );

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes modal with Escape key', () => {
      const handleClose = jest.fn();
      render(
        <PersonModal
          person={mockPeople[0]}
          groupPhotos={mockGroupPhotos}
          onClose={handleClose}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Person Selection Flow', () => {
    it('opens person details when clicking from carousel', () => {
      const handlePersonClick = jest.fn();
      render(
        <PhotoCarousel
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
          onPersonClick={handlePersonClick}
        />
      );

      const aliceButton = screen.getByRole('button', { name: "View Alice" });
      fireEvent.click(aliceButton);

      expect(handlePersonClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'alice', name: 'Alice' })
      );
    });

    it('maintains carousel state when person is selected', () => {
      const handlePersonClick = jest.fn();
      render(
        <PhotoCarousel
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
          onPersonClick={handlePersonClick}
        />
      );

      // Navigate to second photo
      const nextButton = screen.getByRole('button', { name: 'Next photo' });
      fireEvent.click(nextButton);
      expect(screen.getByText('Second Photo')).toBeInTheDocument();

      // Go back to first
      const prevButton = screen.getByRole('button', { name: 'Previous photo' });
      fireEvent.click(prevButton);

      // Click person
      const aliceButton = screen.getByRole('button', { name: "View Alice" });
      fireEvent.click(aliceButton);

      // Carousel should still show first photo
      expect(screen.getByText('First Photo')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('modal responds to Escape key', () => {
      const handleClose = jest.fn();
      render(
        <PersonModal
          person={mockPeople[0]}
          groupPhotos={mockGroupPhotos}
          onClose={handleClose}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });

    it('carousel buttons are keyboard accessible', () => {
      render(
        <PhotoCarousel
          groupPhotos={mockGroupPhotos}
          people={mockPeople}
        />
      );

      const nextButton = screen.getByRole('button', { name: 'Next photo' });
      nextButton.focus();
      expect(nextButton).toHaveFocus();
    });
  });
});
