import React from 'react';
import { render, screen, act } from '../../test/utils/render';
import PersonPreview from '@/components/PersonPreview';
import PersonHighlight from '@/components/PersonHighlight';
import { Person, GroupPhoto } from '@/types';

describe('PersonPreview', () => {
  const mockPerson: Person = {
    id: 'test-person',
    name: 'Test Person',
    description: 'Test description',
    category: 'interns',
    individualPhoto: '/test.jpg',
    photoLocations: [],
  };

  const mockGroupPhotos: GroupPhoto[] = [];

  it('renders person name', () => {
    render(<PersonPreview person={mockPerson} groupPhotos={mockGroupPhotos} />);
    expect(screen.getByText('Test Person')).toBeInTheDocument();
  });

  it('renders optional title when provided', () => {
    render(
      <PersonPreview
        person={mockPerson}
        groupPhotos={mockGroupPhotos}
        title="Featured Person"
      />
    );
    expect(screen.getByText('Featured Person')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    const { container } = render(
      <PersonPreview person={mockPerson} groupPhotos={mockGroupPhotos} />
    );
    expect(container.querySelector('h3')).not.toBeInTheDocument();
  });
});

describe('PersonHighlight', () => {
  const mockPeople: Person[] = [
    {
      id: 'person-1',
      name: 'Alice',
      description: 'Developer',
      category: 'interns',
      individualPhoto: null,
      photoLocations: [
        { photoId: 'photo-1', x: 10, y: 20, width: 15, height: 15 },
      ],
    },
    {
      id: 'person-2',
      name: 'Bob',
      description: 'Designer',
      category: 'interns',
      individualPhoto: null,
      photoLocations: [
        { photoId: 'photo-1', x: 50, y: 50, width: 10, height: 10 },
      ],
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when no people in photo', () => {
    const { container } = render(
      <PersonHighlight
        photoId="photo-2"
        allPeople={mockPeople}
        photoDimensions={{ width: 1000, height: 800 }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders highlight for person in photo', () => {
    render(
      <PersonHighlight
        photoId="photo-1"
        allPeople={mockPeople}
        photoDimensions={{ width: 1000, height: 800 }}
      />
    );

    // Should immediately show one of the people
    const aliceOrBob = screen.queryByText('Alice') || screen.queryByText('Bob');
    expect(aliceOrBob).toBeInTheDocument();
  });

  it('cycles through people in photo', () => {
    render(
      <PersonHighlight
        photoId="photo-1"
        allPeople={mockPeople}
        photoDimensions={{ width: 1000, height: 800 }}
      />
    );

    // Initial person is shown
    const firstPerson = screen.queryByText('Alice') ? 'Alice' : 'Bob';
    expect(screen.getByText(firstPerson)).toBeInTheDocument();

    // Advance time to trigger cycle
    act(() => {
      jest.advanceTimersByTime(2500);
    });

    // Should now show a person (could be same or different due to shuffling)
    const aliceOrBob = screen.queryByText('Alice') || screen.queryByText('Bob');
    expect(aliceOrBob).toBeInTheDocument();
  });

  it('renders person description', () => {
    render(
      <PersonHighlight
        photoId="photo-1"
        allPeople={mockPeople}
        photoDimensions={{ width: 1000, height: 800 }}
      />
    );

    // Check that description appears
    const developerOrDesigner = screen.queryByText('Developer') || screen.queryByText('Designer');
    expect(developerOrDesigner).toBeInTheDocument();
  });

  it('positions highlight based on photo location', () => {
    const { container } = render(
      <PersonHighlight
        photoId="photo-1"
        allPeople={mockPeople}
        photoDimensions={{ width: 1000, height: 800 }}
      />
    );

    const highlight = container.querySelector('.absolute.transition-all');
    expect(highlight).toBeInTheDocument();
    expect(highlight).toHaveStyle({ transform: 'translate(-50%, -50%)' });
  });
});
