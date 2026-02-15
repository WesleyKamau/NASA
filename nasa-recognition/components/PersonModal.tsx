'use client';

import { useState, useEffect } from 'react';
import { Person, GroupPhoto } from '@/types';
import PersonImage from './PersonImage';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PersonModalProps {
  person: Person | null;
  groupPhotos: GroupPhoto[];
  onClose: () => void;
}

function PersonContent({ person, groupPhotos }: { person: Person; groupPhotos: GroupPhoto[] }) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Photo */}
        <div className="w-full sm:w-48 sm:h-48 rounded-xl overflow-hidden bg-slate-800/50 relative flex-shrink-0 mx-auto sm:mx-0 max-w-xs aspect-square">
          <PersonImage person={person} groupPhotos={groupPhotos} className="text-5xl sm:text-6xl !object-contain !object-center" priority />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col text-left">
          <div className="mb-3">
            <span className="text-xs sm:text-sm px-3 py-1.5 rounded-full inline-block bg-blue-500/15 text-blue-300 border border-blue-400/30">
              {person.category === 'sil-lab' ? 'SIL Lab' : person.category === 'staff' ? 'Staff & Mentors' : person.category === 'family' ? 'Family' : 'Fellow Interns'}
            </span>
          </div>

          {/* Title — rendered by parent wrapper (DrawerTitle / DialogTitle) for a11y, so we just style it here */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {person.name}
          </h2>

          {person.description && (
            <div className="bg-white/5 rounded-xl p-5 flex-grow border border-white/10 backdrop-blur-sm">
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light">
                {person.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* LinkedIn */}
      {person.linkedIn && (
        <a
          href={person.linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600/80 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg transition-all font-medium touch-manipulation backdrop-blur-sm border border-blue-500/50 mt-4"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          View LinkedIn Profile
        </a>
      )}
    </>
  );
}

function MobileDrawer({ person, groupPhotos, onClose }: PersonModalProps) {
  return (
    <Drawer
      open={!!person}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      shouldScaleBackground={false}
    >
      <DrawerContent className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 max-h-[92vh] outline-none">
        {person && (
          <div className="overflow-y-auto px-6 pt-4 pb-6">
            <DrawerClose className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all duration-200 touch-manipulation z-10 backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </DrawerClose>

            <DrawerHeader className="p-0 pt-6 pb-4">
              {/* Hidden accessible title for the drawer */}
              <DrawerTitle className="sr-only">{person.name}</DrawerTitle>
              <DrawerDescription className="sr-only">{person.description || `Details about ${person.name}`}</DrawerDescription>
            </DrawerHeader>

            <PersonContent person={person} groupPhotos={groupPhotos} />
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function DesktopDialog({ person, groupPhotos, onClose }: PersonModalProps) {
  return (
    <Dialog
      open={!!person}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 max-h-[90vh] overflow-y-auto p-8 shadow-[0_0_40px_rgba(96,165,250,0.15)]">
        {person && (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">{person.name}</DialogTitle>
              <DialogDescription className="sr-only">{person.description || `Details about ${person.name}`}</DialogDescription>
            </DialogHeader>
            <PersonContent person={person} groupPhotos={groupPhotos} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function PersonModal({ person, groupPhotos, onClose }: PersonModalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNarrow = window.innerWidth < 768;
      setIsMobile(isTouchDevice && isNarrow);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // SSR / pre-mount: render nothing (both are portalled anyway)
  if (!mounted) return null;

  if (isMobile) {
    return <MobileDrawer person={person} groupPhotos={groupPhotos} onClose={onClose} />;
  }

  return <DesktopDialog person={person} groupPhotos={groupPhotos} onClose={onClose} />;
}
