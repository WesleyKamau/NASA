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

  it('shifts horizontally when the label would overflow on mobile', () => {
    const viewportWidth = 360;
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { writable: true, value: viewportWidth });
    const addListenerSpy = jest.spyOn(window, 'addEventListener');

    const mobileLocation = { ...location, x: 2, width: 10 } as PhotoLocation;
    const longName = 'Aurora Nova';

    render(
      <CarouselNameTag
        person={{ ...person, name: longName }}
        isVisible
        location={mobileLocation}
        variant="mobile"
      />
    );

    const wrapper = screen.getByText(longName).parentElement?.parentElement as HTMLElement;

    const calculateShift = (loc: PhotoLocation, label: string) => {
      const faceCenterX = loc.x + loc.width / 2;
      const scaleFactor = viewportWidth < 400 ? 1.3 : viewportWidth < 768 ? 1.1 : 0.7;
      const basePadding = viewportWidth < 400 ? 9 : viewportWidth < 768 ? 7 : 5;
      const estimatedLabelWidthPct = label.length * scaleFactor + basePadding;
      const halfLabelWidth = estimatedLabelWidthPct / 2;
      const edgeBuffer = viewportWidth < 768 ? 4 : 2;
      const leftOverflow = Math.max(0, (halfLabelWidth + edgeBuffer) - faceCenterX);
      const rightOverflow = Math.max(0, (faceCenterX + halfLabelWidth + edgeBuffer) - 100);
      let horizontalShift = 0;
      if (leftOverflow > 0) horizontalShift = leftOverflow;
      else if (rightOverflow > 0) horizontalShift = -rightOverflow;
      return (horizontalShift / loc.width) * 100;
    };

    const expectedShift = calculateShift(mobileLocation, longName);
    const renderedLeft = parseFloat(wrapper.style.left);
    expect(renderedLeft).toBeCloseTo(50 + expectedShift, 2);
    expect(addListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    Object.defineProperty(window, 'innerWidth', { writable: true, value: originalWidth });
  });
});
