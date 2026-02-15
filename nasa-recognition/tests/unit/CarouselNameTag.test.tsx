import React from 'react';
import { render, screen, fireEvent } from '../../test/utils/render';
import CarouselNameTag from '@/components/CarouselNameTag';
import { Person, PhotoLocation } from '@/types';

const person: Person = {
  id: 'p1',
  name: 'Nebula',
  description: '',
  category: 'interns',
  individualPhoto: null,
  photoLocations: [],
};

const location: PhotoLocation = {
  photoId: 'g1',
  x: 4,
  y: 30,
  width: 12,
  height: 18,
};

describe('CarouselNameTag', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ignores clicks when the tag is hidden', () => {
    const onClick = jest.fn();
    render(
      <CarouselNameTag
        person={person}
        isVisible={false}
        location={location}
        onClick={onClick}
        variant="gradient"
      />
    );

    const wrapper = screen.getByText('Nebula').parentElement?.parentElement as HTMLElement;
    fireEvent.click(wrapper);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick when the tag is visible', () => {
    const onClick = jest.fn();
    render(
      <CarouselNameTag
        person={person}
        isVisible
        location={location}
        onClick={onClick}
        variant="desktop"
      />
    );

    const wrapper = screen.getByText('Nebula').parentElement?.parentElement as HTMLElement;
    fireEvent.click(wrapper);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('uses CSS max-width for overflow prevention instead of JS calculations', () => {
    render(
      <CarouselNameTag
        person={{ ...person, name: 'Aurora Nova' }}
        isVisible
        location={location}
        variant="mobile"
      />
    );

    const wrapper = screen.getByText('Aurora Nova').parentElement?.parentElement as HTMLElement;
    // Name tag is always centered at 50% — CSS handles overflow via max-width
    expect(wrapper.style.left).toBe('50%');
    expect(wrapper.style.maxWidth).toBe('calc(100vw - 2rem)');
  });
});
