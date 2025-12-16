import React from 'react';

const Lottie = React.forwardRef((props: any, ref: any) => {
  return React.createElement('div', {
    ref,
    'data-testid': 'lottie-animation',
    'data-animation-data': JSON.stringify(props.animationData),
    className: props.className,
    style: props.style,
  });
});

Lottie.displayName = 'LottieMock';

export default Lottie;

export interface LottieRefCurrentProps {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  goToAndStop: (frame: number, isFrame?: boolean) => void;
  goToAndPlay: (frame: number, isFrame?: boolean) => void;
  setDirection: (direction: number) => void;
  playSegments: (segments: [number, number] | [number, number][], forceFlag?: boolean) => void;
  setSubframe: (useSubframes: boolean) => void;
  getDuration: (inFrames?: boolean) => number;
  destroy: () => void;
  animationContainerRef: React.RefObject<HTMLDivElement>;
  animationLoaded: boolean;
  animationItem: any;
}
