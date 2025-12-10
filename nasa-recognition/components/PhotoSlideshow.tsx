/**
 * UNUSED COMPONENT
 * This component is not currently used in the application.
 * Requires 'swiper' package to be installed if ever needed.
 * Install with: npm install swiper
 */

/* eslint-disable */
// @ts-nocheck

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import Image from 'next/image';
import { GroupPhoto, Person } from '@/types';
import PersonHighlight from './PersonHighlight';

interface PhotoSlideshowProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
  title: string;
}

const PhotoSlideshow: React.FC<PhotoSlideshowProps> = ({ groupPhotos, people, title }) => {
  const [swiper, setSwiper] = useState<any>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleInteraction = () => {
    setIsUserInteracting(true);
    if (swiper) {
      swiper.autoplay.stop();
    }
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current);
    }
    interactionTimeout.current = setTimeout(() => {
      setIsUserInteracting(false);
      if (swiper) {
        swiper.autoplay.start();
      }
    }, 5000); // 5 second cooldown
  };

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-white text-center mb-8">{title}</h2>
      <Swiper
        modules={[Autoplay, EffectFade]}
        spaceBetween={50}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        effect="fade"
        onSwiper={setSwiper}
        onSliderMove={handleInteraction}
        onClick={handleInteraction}
        className="w-full"
      >
        {groupPhotos.map((photo) => (
          <SwiperSlide key={photo.id}>
            <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden">
              <Image
                src={photo.imagePath}
                alt={photo.name}
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-lg"
              />
              {!isUserInteracting && (
                <PersonHighlight
                  photoId={photo.id}
                  allPeople={people}
                  photoDimensions={{ width: photo.width, height: photo.height }}
                />
              )}
            </div>
            <p className="text-center text-slate-400 mt-2">{photo.name}</p>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default PhotoSlideshow;
