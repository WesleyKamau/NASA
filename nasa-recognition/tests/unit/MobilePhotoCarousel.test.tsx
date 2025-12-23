import React from 'react';
import { render, screen, fireEvent } from '../../test/utils/render';
// import { waitFor } from '../../test/utils/render'; // TODO: Not currently used
import MobilePhotoCarousel from '@/components/MobilePhotoCarousel';
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

describe('MobilePhotoCarousel', () => {
  it('renders initial photo and name', () => {
    const { groupPhotos, people } = makeData();
    render(<MobilePhotoCarousel groupPhotos={groupPhotos} people={people} />);
    expect(screen.getByText('Group One')).toBeInTheDocument();
  });

  it('navigates photos via next/prev buttons', () => {
    const { groupPhotos, people } = makeData();
    render(<MobilePhotoCarousel groupPhotos={groupPhotos} people={people} />);

    const nextBtn = screen.getByRole('button', { name: 'Next photo' });
    fireEvent.click(nextBtn);
    expect(screen.getByText('Group Two')).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: 'Previous photo' });
    fireEvent.click(prevBtn);
    expect(screen.getByText('Group One')).toBeInTheDocument();
  });

  it('navigates photos via dots', () => {
    const { groupPhotos, people } = makeData();
    render(<MobilePhotoCarousel groupPhotos={groupPhotos} people={people} />);
    const dot = screen.getByRole('button', { name: 'View Group Two' });
    fireEvent.click(dot);
    expect(screen.getByText('Group Two')).toBeInTheDocument();
  });
});
