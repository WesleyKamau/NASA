import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test/utils/render';
import PhotoCarousel from '@/components/PhotoCarousel';
import { GroupPhoto, Person } from '@/types';

function makeData() {
  const groupPhotos: GroupPhoto[] = [
    { id: 'g1', name: 'Group One', imagePath: '/g1.jpg', category: 'interns', width: 1000, height: 500 },
    { id: 'g2', name: 'Group Two', imagePath: '/g2.jpg', category: 'interns', width: 1000, height: 500 },
  ];
  const people: Person[] = [
    {
      id: 'p1', name: 'Alice', description: '', category: 'interns', individualPhoto: null,
      photoLocations: [ { photoId: 'g1', x: 10, y: 10, width: 20, height: 20 } ],
    },
  ];
  return { groupPhotos, people };
}

describe('PhotoCarousel', () => {
  it('renders current photo name and navigates via dots', () => {
    const { groupPhotos, people } = makeData();
    render(
      <PhotoCarousel groupPhotos={groupPhotos} people={people} />
    );
    // shows first photo name
    expect(screen.getByText('Group One')).toBeInTheDocument();

    // click dot for Group Two
    const dot = screen.getByRole('button', { name: 'View Group Two' });
    fireEvent.click(dot);
    expect(screen.getByText('Group Two')).toBeInTheDocument();
  });

  it('triggers onHighlightedPersonChange when hovering inside face area', async () => {
    const { groupPhotos, people } = makeData();
    const onHighlightedPersonChange = jest.fn();
    render(
      <PhotoCarousel groupPhotos={groupPhotos} people={people} onHighlightedPersonChange={onHighlightedPersonChange} />
    );
    const img = screen.getByAltText('Group One');
    const container = img.parentElement as HTMLDivElement; // containerRef
    // mock bounding box for consistent coords
    const rect = { left: 0, top: 0, width: 1000, height: 500, right: 1000, bottom: 500 } as DOMRect;
    container.getBoundingClientRect = () => rect;

    // move mouse near the center of person box at 20% x, 20% y
    fireEvent.mouseEnter(container);
    // pause auto-highlighting by entering the face button overlay
    const faceBtn = await screen.findByRole('button', { name: 'View Alice' });
    fireEvent.mouseEnter(faceBtn);
    fireEvent.mouseMove(container, { clientX: rect.left + rect.width * 0.2, clientY: rect.top + rect.height * 0.2 });

    await waitFor(() => expect(onHighlightedPersonChange).toHaveBeenCalledWith('p1'));
  });

  it('calls onPersonClick when clicking a face', () => {
    const { groupPhotos, people } = makeData();
    const onPersonClick = jest.fn();
    render(
      <PhotoCarousel groupPhotos={groupPhotos} people={people} onPersonClick={onPersonClick} />
    );
    const btn = screen.getByRole('button', { name: 'View Alice' });
    fireEvent.click(btn);
    expect(onPersonClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }));
  });
});
