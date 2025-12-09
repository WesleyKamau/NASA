import { getPeopleData } from '@/lib/data';
import PersonGrid from '@/components/PersonGrid';
import InteractiveGroupPhoto from '@/components/InteractiveGroupPhoto';
import StarfieldBackground from '@/components/StarfieldBackground';
import SLSRocket from '@/components/SLSRocket';

export default function Home() {
  const data = getPeopleData();
  const staffPeople = data.people.filter(p => p.category === 'staff');
  const internPeople = data.people.filter(p => p.category === 'interns');
  const staffPhotos = data.groupPhotos.filter(p => p.category === 'staff');
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
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-2">
              Staff & Mentors
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
          </div>

          {/* Staff Group Photos */}
          {staffPhotos.length > 0 && (
            <div className="mb-12 space-y-12">
              {staffPhotos.map((photo) => (
                <InteractiveGroupPhoto
                  key={photo.id}
                  groupPhoto={photo}
                  people={staffPeople}
                />
              ))}
            </div>
          )}

          {/* Staff Grid */}
          <PersonGrid people={staffPeople} />
        </section>

        {/* Interns Section */}
        {internPeople.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-2">
                Fellow Interns
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
            </div>

            {/* Intern Group Photos */}
            {internPhotos.length > 0 && (
              <div className="mb-12 space-y-12">
                {internPhotos.map((photo) => (
                  <InteractiveGroupPhoto
                    key={photo.id}
                    groupPhoto={photo}
                    people={internPeople}
                  />
                ))}
              </div>
            )}

            {/* Interns Grid */}
            <PersonGrid people={internPeople} />
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-12 border-t border-slate-800">
          <p className="text-slate-400 text-sm">
            Built with ❤️ to remember an amazing internship experience
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Spring {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  );
}
