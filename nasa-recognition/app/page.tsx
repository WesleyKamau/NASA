import { getPeopleData } from '@/lib/data';
import PhotoCarousel from '@/components/PhotoCarousel';
import MobilePhotoCarousel from '@/components/MobilePhotoCarousel';
import DesktopSplitView from '@/components/DesktopSplitView';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';
import StarfieldBackground from '@/components/StarfieldBackground';
import SLSRocket from '@/components/SLSRocket';

export default function Home() {
  const data = getPeopleData();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated background */}
      <StarfieldBackground />
      
      {/* Flying SLS rocket decoration - positioned absolutely within page */}
      <div className="absolute inset-0 pointer-events-none overflow-x-hidden">
        <SLSRocket />
      </div>

      {/* Desktop Split View (xl screens and above) */}
      <div className="hidden xl:block relative z-10">
        <DesktopSplitView
          groupPhotos={data.groupPhotos}
          people={data.people}
        />
      </div>

      {/* Tablet/Mobile View (below xl) */}
      <main className="xl:hidden relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-12 sm:mb-16 pt-4 sm:pt-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent px-4">
            My NASA Internship Book of Faces
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto px-4">
            One of the most impactful parts of my NASA internship was all of the people I got to meet. This lets you learn more about the people who made it special! :)
          </p>
        </header>

        {/* Photo Carousel Section */}
        <section className="mb-16 sm:mb-24">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Group Photos
            </h2>
            <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
            <p className="text-slate-400 mt-4 text-sm sm:text-base">
              Watch as we highlight everyone in the photos • Click on faces to learn more
            </p>
          </div>
          
          <MobilePhotoCarousel
            groupPhotos={data.groupPhotos}
            people={data.people}
          />
        </section>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 my-12 sm:my-16">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-slate-600" />
          <div className="text-slate-500 text-xl sm:text-2xl">✦</div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-600 to-slate-600" />
        </div>

        {/* People Section */}
        <section className="mb-16 sm:mb-24">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              The People
            </h2>
            <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
            <p className="text-slate-400 mt-4 text-sm sm:text-base">
              Click on anyone to learn more about them
            </p>
          </div>
          
          <OrganizedPersonGrid
            people={data.people}
            groupPhotos={data.groupPhotos}
            idPrefix="mobile-"
          />
        </section>

        {/* Footer */}
        <footer className="text-center py-6 sm:py-8 border-t border-slate-800/50 mt-16">
          <p className="text-slate-500 text-xs sm:text-sm">
            NASA Interns • Spring {new Date().getFullYear()}
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Made with ❤️ and gratitude
          </p>
        </footer>
      </main>
    </div>
  );
}
