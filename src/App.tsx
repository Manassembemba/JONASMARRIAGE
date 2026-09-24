/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WeddingDataProvider, useWeddingData } from './context/WeddingDataContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Countdown } from './components/Countdown';
import { CoupleSection } from './components/CoupleSection';
import { StorySection } from './components/StorySection';
import { ProgramSection } from './components/ProgramSection';
import { VenuesSection } from './components/VenuesSection';
import { GallerySection } from './components/GallerySection';
import { EmotionalBanner } from './components/EmotionalBanner';
import { RsvpSection } from './components/RsvpSection';
import { GuestbookSection } from './components/GuestbookSection';
import { Footer } from './components/Footer';
import { AdminModal } from './components/AdminModal';
import { MusicPlayer } from './components/MusicPlayer';
import { RSVPData, GuestbookMessage } from './types';

function WeddingApp() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const {
    rsvps,
    guestbook,
    addRsvp,
    updateRsvp,
    deleteRsvp,
    addGuestbook,
    toggleGuestbookApproval,
    deleteGuestbook,
  } = useWeddingData();

  // Support direct `#admin` or `/admin` hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setIsAdminOpen(true);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans antialiased selection:bg-[#c5a059]/30 selection:text-[#4e3700]">
      {/* Fixed Luxury Navigation */}
      <Navbar onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Main Content Sections */}
      <main className="flex flex-col w-full">
        {/* Section 2: Accueil / Hero */}
        <Hero />

        {/* Section 3: Compte à rebours dynamique */}
        <Countdown />

        {/* Section 4: Présentation des mariés */}
        <CoupleSection />

        {/* Section 5: Notre histoire */}
        <StorySection />

        {/* Section 6, 7 & 8: Programme officiel & Timeline du 29 octobre */}
        <ProgramSection />

        {/* Section 9: Les lieux */}
        <VenuesSection />

        {/* Section 11: Galerie photos (Masonry moderne & Lightbox) */}
        <GallerySection />

        {/* Section 12: Section spéciale émotionnelle */}
        <EmotionalBanner />

        {/* Section 10: RSVP — Confirmation de présence */}
        <RsvpSection onRsvpSubmitted={(data: RSVPData) => addRsvp(data)} />

        {/* Section 13: Livre d'or */}
        <GuestbookSection
          messages={guestbook}
          onAddMessage={(msg: GuestbookMessage) => addGuestbook(msg)}
        />
      </main>

      {/* Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Lecteur de Musique Automatique & Flottant */}
      <MusicPlayer />

      {/* Administration Modal Interface */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          if (window.location.hash === '#admin') {
            window.history.pushState('', document.title, window.location.pathname);
          }
        }}
        rsvps={rsvps}
        guestbook={guestbook}
        onUpdateRsvp={updateRsvp}
        onDeleteRsvp={deleteRsvp}
        onAddRsvp={addRsvp}
        onToggleGuestbookApproval={toggleGuestbookApproval}
        onDeleteGuestbookMessage={deleteGuestbook}
      />
    </div>
  );
}

export default function App() {
  return (
    <WeddingDataProvider>
      <WeddingApp />
    </WeddingDataProvider>
  );
}
