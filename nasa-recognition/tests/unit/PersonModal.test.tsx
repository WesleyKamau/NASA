import React from 'react';
import { render, screen, fireEvent } from '../../test/utils/render';
import PersonModal from '@/components/PersonModal';
import { Person } from '@/types';

const person: Person = {
  id: 'p1',
  name: 'Test User',
  description: 'Desc',
  category: 'interns',
  individualPhoto: null,
  photoLocations: [],
};

describe('PersonModal', () => {
  it('renders and closes via close button', () => {
    const onClose = jest.fn();
    render(<PersonModal person={person} onClose={onClose} isOpen />);
    expect(screen.getByText('Test User')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape key', () => {
    const onClose = jest.fn();
    render(<PersonModal person={person} onClose={onClose} isOpen />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
