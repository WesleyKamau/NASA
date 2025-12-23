import React from 'react';
import { render, screen } from '../../test/utils/render';
import CenterIndicator from '@/components/CenterIndicator';
import { GroupPhoto, Person } from '@/types';

const groupPhoto: GroupPhoto = {
  id: 'g1',
  name: 'Test Group',
  imagePath: '/test.jpg',
  width: 1200,
  height: 800,
  category: 'interns',
};

const basePerson: Person = {
  id: 'p1',
  name: 'Beacon',
  description: '',
  category: 'interns',
  individualPhoto: null,
  photoLocations: [{ photoId: groupPhoto.id, x: 40, y: 40, width: 10, height: 10 }],
};

const containerRef = {
  current: {
    getBoundingClientRect: () => ({ width: 200, height: 100, left: 0, top: 0, right: 200, bottom: 100 }),
  },
} as React.RefObject<HTMLDivElement>;

describe('CenterIndicator', () => {
  it('returns null when hidden', () => {
    const { queryByTestId } = render(
      <CenterIndicator
        show={false}
        position={{ x: 0, y: 0 }}
        scale={1}
        currentPhoto={groupPhoto}
        shuffledPeople={[basePerson]}
        isAutoHighlighting
        centerIndicatorForce={0}
        convertPhotoToContainerCoords={() => ({ photoId: 'test', x: 0, y: 0, width: 0, height: 0 })}
        containerRef={containerRef}
        FACE_HITBOX_PADDING={6}
      />
    );

    expect(queryByTestId('center-indicator')).toBeNull();
  });

  it('renders the center circle when auto-highlighting', () => {
    render(
      <CenterIndicator
        show
        position={{ x: 0, y: 0 }}
        scale={1}
        currentPhoto={groupPhoto}
        shuffledPeople={[basePerson]}
        isAutoHighlighting
        centerIndicatorForce={0}
        convertPhotoToContainerCoords={() => ({ photoId: 'test', x: 5, y: 5, width: 12, height: 12 })}
        containerRef={containerRef}
        FACE_HITBOX_PADDING={6}
      />
    );

    const indicator = screen.getByTestId('center-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle('transform: translate(-50%, -50%)');
  });

  it('selects the closest face when auto-highlighting is disabled', () => {
    const convertPhotoToContainerCoords = jest.fn().mockReturnValue({ x: 8, y: 8, width: 14, height: 20 });
    const onHighlightedPersonChange = jest.fn();

    const personWithCenter: Person = {
      ...basePerson,
      id: 'p-center',
      photoLocations: [{ photoId: groupPhoto.id, x: 48, y: 48, width: 4, height: 4 }],
    };

    render(
      <CenterIndicator
        show
        position={{ x: 0, y: 0 }}
        scale={1}
        currentPhoto={groupPhoto}
        shuffledPeople={[personWithCenter]}
        isAutoHighlighting={false}
        centerIndicatorForce={0}
        convertPhotoToContainerCoords={convertPhotoToContainerCoords}
        containerRef={containerRef}
        FACE_HITBOX_PADDING={8}
        onHighlightedPersonChange={onHighlightedPersonChange}
      />
    );

    expect(convertPhotoToContainerCoords).toHaveBeenCalledWith(personWithCenter.photoLocations[0]);
    expect(onHighlightedPersonChange).toHaveBeenCalledWith('p-center');
    const indicator = screen.getByTestId('center-indicator');
    expect(indicator).toHaveStyle('left: 8%');
  });
});
