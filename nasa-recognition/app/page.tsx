import { getPeopleData } from '@/lib/data';
import DesktopSplitView from '@/components/DesktopSplitView';
import SingleColumnView from '@/components/SingleColumnView';
import OrganizedPersonGrid from '@/components/OrganizedPersonGrid';
import StarfieldBackground from '@/components/StarfieldBackground';
import GalaxyBackground from '@/components/GalaxyBackground';
import SLSRocket from '@/components/SLSRocket';
import BackToTop from '@/components/BackToTop';

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
        {title}
      </h2>
      <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
      {subtitle && (
        <p className="text-slate-400 mt-4 text-sm sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const data = getPeopleData();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated backgrounds: legacy starfield on mobile/tablet, galaxy on desktop */}
      <div className="xl:hidden">
        <StarfieldBackground />
      </div>
      <div className="hidden xl:block">
        <GalaxyBackground />
      </div>
      
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
        {/* Header removed per request */}

        {/* Photo Carousel Section */}
        <section className="mb-12">
          <SingleColumnView
            groupPhotos={data.groupPhotos}
            people={data.people}
          />
          <p className="text-center text-slate-500 text-sm mt-4">
            Hover or tap faces to interact
          </p>
        </section>

        <div className="text-center mb-12">
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto px-4">
            One of the most impactful parts of my NASA internship was all of the people I got to meet. This lets you learn more about the people who made it special! :)
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 my-12 sm:my-16">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-slate-600" />
          <div className="text-slate-500 text-xl sm:text-2xl animate-spin-slow">✦</div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-600 to-slate-600" />
        </div>

        {/* People Section */}
        <section className="mb-16 sm:mb-24">
          <SectionHeader 
            title="The People"
            subtitle="Click on anyone to learn more about them"
          />
          
          <OrganizedPersonGrid
            people={data.people}
            groupPhotos={data.groupPhotos}
            idPrefix="mobile-"
          />
        </section>

        {/* Footer */}
        <BackToTop />
        <footer className="text-center py-6 sm:py-8 border-t border-slate-800/50 mt-4">
          <p className="text-slate-500 text-sm">
            Made by <a className="underline hover:text-slate-300 transition" href="https://wesleykamau.com" target="_blank" rel="noreferrer">Wesley Kamau</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
