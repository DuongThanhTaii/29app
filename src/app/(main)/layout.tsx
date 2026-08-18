import { ReactNode } from 'react';
import BottomNav from '@/components/ui/BottomNav';
import FilmGrainOverlay from '@/components/ui/FilmGrainOverlay';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen vintage-texture">
      <FilmGrainOverlay />
      <div className="pb-20">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
