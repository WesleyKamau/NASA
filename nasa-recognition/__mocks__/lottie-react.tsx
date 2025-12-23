import React from 'react';

interface LottieProps {
  animationData?: unknown;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

const Lottie = React.forwardRef<HTMLDivElement, LottieProps>((props, ref) => {
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
  animationItem: unknown;
}
