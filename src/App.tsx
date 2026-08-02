import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CoupleProvider, useCouple } from './context/CoupleContext';
import { MusicProvider } from './context/MusicContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingMusicPlayer } from './components/FloatingMusicPlayer';
import { ParticleCanvas } from './components/ParticleCanvas';

import { Landing } from './pages/Landing';
import { CalendarPage } from './pages/Calendar';
import { Timeline } from './pages/Timeline';
import { Gallery } from './pages/Gallery';
import { Videos } from './pages/Videos';
import { MusicPage } from './pages/Music';
import { Notes } from './pages/Notes';
import { Journal } from './pages/Journal';
import { Countdown } from './pages/Countdown';
import { Letter } from './pages/Letter';
import { Favorites } from './pages/Favorites';
import { Settings } from './pages/Settings';

const AppContent: React.FC = () => {
  const { settings } = useCouple();

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-rose-200 selection:text-rose-900">
      {/* Animated Floating Particles Canvas */}
      <ParticleCanvas type={settings.particle_type || 'hearts'} />

      {/* Navigation */}
      <Navbar />

      {/* Main Page Viewport */}
      <main className="flex-1 relative">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/countdown" element={<Countdown />} />
          <Route path="/letter" element={<Letter />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Side Menu Music Player */}
      <FloatingMusicPlayer />
    </div>
  );
};

export default function App() {
  return (
    <CoupleProvider>
      <MusicProvider>
        <Router>
          <AppContent />
        </Router>
      </MusicProvider>
    </CoupleProvider>
  );
}
