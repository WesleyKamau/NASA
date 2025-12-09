import { getPeopleData } from '@/lib/data';
import ZoomablePhotoSection from '@/components/ZoomablePhotoSection';
import StarfieldBackground from '@/components/StarfieldBackground';
import SLSRocket from '@/components/SLSRocket';

export default function Home() {
  const data = getPeopleData();
  const staffPhotos = data.groupPhotos.filter(p => p.category === 'staff' || p.category === 'girlfriend' || p.category === 'family');
  const internPhotos = data.groupPhotos.filter(p => p.category === 'interns');

  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <StarfieldBackground />
      
      {/* Flying SLS rocket decoration */}
      <SLSRocket />

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16 pt-8">
          <div className="inline-block mb-6">
            <div className="text-6xl mb-4">🚀</div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            NASA Internship Recognition
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Honoring the incredible people who made my NASA experience unforgettable
          </p>
        </header>

        {/* Staff Section */}
        <ZoomablePhotoSection
          people={data.people}
          groupPhotos={staffPhotos}
          title="Staff & Mentors"
        />

        {/* Interns Section */}
        {internPhotos.length > 0 && (
          <ZoomablePhotoSection
            people={data.people}
            groupPhotos={internPhotos}
            title="Fellow Interns"
          />
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-800/50">
          <p className="text-slate-500 text-xs">
            NASA Interns • Spring {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  );
}
