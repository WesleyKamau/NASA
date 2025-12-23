import React from 'react';
import { render, screen, fireEvent } from '../../test/utils/render';
import PersonCard from '@/components/PersonCard';
import { Person, GroupPhoto } from '@/types';

describe('PersonCard', () => {
  const mockPerson: Person = {
    id: 'test-person',
    name: 'Test Person',
    description: 'Test description',
    category: 'interns',
    individualPhoto: '/test.jpg',
    photoLocations: [],
  };

  const mockGroupPhotos: GroupPhoto[] = [];

  it('renders person name and description', () => {
    render(<PersonCard person={mockPerson} groupPhotos={mockGroupPhotos} />);
    expect(screen.getByText('Test Person')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = jest.fn();
    render(<PersonCard person={mockPerson} groupPhotos={mockGroupPhotos} onClick={handleClick} />);
    
    const card = screen.getByRole('button', { name: "View Test Person's profile" });
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies highlighted styles when isHighlighted is true', () => {
    const { container } = render(
      <PersonCard person={mockPerson} groupPhotos={mockGroupPhotos} isHighlighted={true} />
    );
    
    const card = container.querySelector('button');
    expect(card).toHaveClass('border-white/50');
    expect(card).toHaveClass('scale-105');
  });

  it('applies special ring style for Wesley', () => {
    const wesley: Person = { ...mockPerson, id: 'wesley-kamau', name: 'Wesley Kamau' };
    const { container } = render(<PersonCard person={wesley} groupPhotos={mockGroupPhotos} />);
    
    const card = container.querySelector('button');
    expect(card).toHaveClass('ring-2');
    expect(card).toHaveClass('ring-blue-400/60');
  });

  it('calls onMouseEnter and onMouseLeave', () => {
    const handleMouseEnter = jest.fn();
    const handleMouseLeave = jest.fn();
    render(
      <PersonCard
        person={mockPerson}
        groupPhotos={mockGroupPhotos}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
    
    const card = screen.getByRole('button');
    fireEvent.mouseEnter(card);
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    
    fireEvent.mouseLeave(card);
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
  });
});
