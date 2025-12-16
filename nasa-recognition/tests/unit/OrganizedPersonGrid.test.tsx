import React from 'react';
import { render, screen, fireEvent } from '../../test/utils/render';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';
import { Person, GroupPhoto } from '@/types';

describe('OrganizedPersonGrid', () => {
  const mockPeople: Person[] = [
    {
      id: 'person-1',
      name: 'Alice',
      description: 'Family member',
      category: 'family',
      individualPhoto: null,
      photoLocations: [],
    },
    {
      id: 'person-2',
      name: 'Bob',
      description: 'Intern',
      category: 'interns',
      individualPhoto: null,
      photoLocations: [],
    },
    {
      id: 'wesley-kamau',
      name: 'Wesley Kamau',
      description: 'Me',
      category: 'family',
      individualPhoto: null,
      photoLocations: [],
    },
  ];

  const mockGroupPhotos: GroupPhoto[] = [];

  it('renders all visible people organized by category', () => {
    render(<OrganizedPersonGrid people={mockPeople} groupPhotos={mockGroupPhotos} />);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Wesley Kamau')).toBeInTheDocument();
    // 'Me' appears as both section heading and description
    expect(screen.getAllByText('Me').length).toBeGreaterThan(0);
    expect(screen.getByText('Family & Special Guest')).toBeInTheDocument();
    expect(screen.getByText('Fellow Interns')).toBeInTheDocument();
  });

  it('calls onPersonClick when provided instead of opening modal', () => {
    const handlePersonClick = jest.fn();
    render(
      <OrganizedPersonGrid
        people={mockPeople}
        groupPhotos={mockGroupPhotos}
        onPersonClick={handlePersonClick}
      />
    );
    
    const aliceCard = screen.getByRole('button', { name: "View Alice's profile" });
    fireEvent.click(aliceCard);
    
    expect(handlePersonClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'person-1', name: 'Alice' })
    );
  });

  it('opens PersonModal when card is clicked and no onPersonClick is provided', () => {
    render(<OrganizedPersonGrid people={mockPeople} groupPhotos={mockGroupPhotos} />);
    
    const bobCard = screen.getByRole('button', { name: "View Bob's profile" });
    fireEvent.click(bobCard);
    
    // Modal should appear with close button
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('highlights person when highlightedPersonId matches', () => {
    const { container } = render(
      <OrganizedPersonGrid
        people={mockPeople}
        groupPhotos={mockGroupPhotos}
        highlightedPersonId="person-2"
      />
    );
    
    const bobCard = container.querySelector('#person-card-person-2');
    expect(bobCard).toHaveClass('border-white/50');
    expect(bobCard).toHaveClass('scale-105');
  });

  it('calls onPersonHover on mouse enter/leave', () => {
    const handleHover = jest.fn();
    render(
      <OrganizedPersonGrid
        people={mockPeople}
        groupPhotos={mockGroupPhotos}
        onPersonHover={handleHover}
      />
    );
    
    const aliceCard = screen.getByRole('button', { name: "View Alice's profile" });
    fireEvent.mouseEnter(aliceCard);
    expect(handleHover).toHaveBeenCalledWith('person-1');
    
    fireEvent.mouseLeave(aliceCard);
    expect(handleHover).toHaveBeenCalledWith(null);
  });

  it('filters out hidden people', () => {
    const peopleWithHidden: Person[] = [
      ...mockPeople,
      {
        id: 'hidden-person',
        name: 'Hidden Person',
        description: 'Should not appear',
        category: 'interns',
        individualPhoto: null,
        photoLocations: [],
        hidden: true,
      },
    ];
    
    render(<OrganizedPersonGrid people={peopleWithHidden} groupPhotos={mockGroupPhotos} />);
    
    expect(screen.queryByText('Hidden Person')).not.toBeInTheDocument();
  });

  it('renders uniformLayout when uniformLayout prop is true', () => {
    render(
      <OrganizedPersonGrid
        people={mockPeople}
        groupPhotos={mockGroupPhotos}
        uniformLayout={true}
      />
    );
    
    // In uniform layout, Wesley is merged into family category, no "Me" section heading
    expect(screen.queryByRole('heading', { name: 'Me' })).not.toBeInTheDocument();
    expect(screen.getByText('Family & Special Guest')).toBeInTheDocument();
    expect(screen.getByText('Wesley Kamau')).toBeInTheDocument();
  });
});
