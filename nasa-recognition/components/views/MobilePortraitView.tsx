'use client';

import { useState, useEffect } from 'react';
import { GroupPhoto, Person } from '@/types';
import MobilePhotoCarousel from '@/components/MobilePhotoCarousel';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';
import PersonModal from '@/components/PersonModal';

interface MobilePortraitViewProps {
  groupPhotos: GroupPhoto[];
  people: Person[];
}

export default function MobilePortraitView({ groupPhotos, people }: MobilePortraitViewProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Check if user has seen onboarding before
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding === 'true') {
      setShowOnboarding(false);
    }
  }, []);

  // Hide scroll hint after user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowScrollHint(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handlePersonClick = (person: Person) => {
    setSelectedPerson(person);
  };

  const onboardingSteps = [
    {
      title: "Welcome!",
      description: "Tap faces on photos to learn about the amazing people from my NASA internship",
      icon: "👋"
    },
    {
      title: "Pan & Zoom",
      description: "Use two fingers to zoom and drag to pan around photos",
      icon: "🔍"
    },
    {
      title: "Scroll Down",
      description: "Scroll down to see everyone's profiles",
      icon: "📖"
    },
    {
      title: "Tap to Learn More",
      description: "Tap on any profile card to see full details and swipe down to close",
      icon: "✨"
    }
  ];

  return (
    <>
      {/* Main Content - Continuous Scroll */}
      <main className="relative z-10 min-h-screen">
        {/* Photo Carousel Section - Larger for touch interaction */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-3 py-6">
          <div className="w-full max-w-2xl">
            <MobilePhotoCarousel
              groupPhotos={groupPhotos}
              people={people}
              onPersonClick={handlePersonClick}
              hideInstructions={showOnboarding}
            />
            
            {/* Instructions below carousel */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-slate-400 text-sm font-light tracking-wide">
                Tap faces to interact • Pinch to zoom
              </p>
            </div>
          </div>

          {/* Scroll Hint - Animated */}
          {showScrollHint && !showOnboarding && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
              <p className="text-slate-400 text-sm font-light">
                Scroll to see profiles
              </p>
              <svg 
                className="w-6 h-6 text-slate-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          )}
        </section>

        {/* Decorative Transition */}
        <div className="relative z-10 py-8">
          <div className="flex items-center gap-4 px-4 opacity-50">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="text-white/40 text-xl animate-spin-slow">✦</div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>

        {/* Intro Text */}
        <div className="relative z-10 px-6 pb-12 text-center">
          <p className="text-lg font-light leading-relaxed text-slate-200 max-w-2xl mx-auto">
            One of the most impactful parts of my NASA internship was all of the people I got to meet. 
            This lets you learn more about the people who made it special! :)
          </p>
        </div>

        {/* People Section */}
        <section className="relative z-10 px-4 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-4 tracking-tight">
              The People
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
            <p className="text-slate-400 mt-4 text-sm font-light">
              Tap anyone to learn more
            </p>
          </div>

          <OrganizedPersonGrid
            people={people}
            groupPhotos={groupPhotos}
            onPersonClick={setSelectedPerson}
            idPrefix="mobile-portrait-"
            uniformLayout={true}
          />
        </section>

        {/* Footer */}
        <footer className="relative z-10 text-center py-8 px-4 border-t border-white/5">
          <p className="text-slate-500 text-sm font-light">
            Made by <a className="text-slate-400 hover:text-white transition-colors" href="https://wesleykamau.com" target="_blank" rel="noreferrer">Wesley Kamau</a>
          </p>
        </footer>
      </main>

      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{onboardingSteps[onboardingStep].icon}</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {onboardingSteps[onboardingStep].title}
              </h3>
              <p className="text-slate-300 text-base leading-relaxed">
                {onboardingSteps[onboardingStep].description}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === onboardingStep
                      ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {onboardingStep > 0 && (
                <button
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 font-medium"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => {
                  if (onboardingStep < onboardingSteps.length - 1) {
                    setOnboardingStep(onboardingStep + 1);
                  } else {
                    handleOnboardingComplete();
                  }
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 font-medium shadow-lg"
              >
                {onboardingStep < onboardingSteps.length - 1 ? 'Next' : 'Get Started'}
              </button>
            </div>

            {/* Skip Button */}
            <button
              onClick={handleOnboardingComplete}
              className="w-full mt-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      )}

      {/* Person Modal */}
      {selectedPerson && (
        <PersonModal
          person={selectedPerson}
          groupPhotos={groupPhotos}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </>
  );
}
