import React from 'react';
import { Share2, Heart } from 'lucide-react';
import { useWeddingData } from '../context/WeddingDataContext';
import { shareOnWhatsApp } from '../utils/calendar';
import { WeddingLogo } from './WeddingLogo';

export const Hero: React.FC = () => {
  const { details } = useWeddingData();

  const handleShare = () => {
    window.open(shareOnWhatsApp(), '_blank');
  };

  return (
    <section
      id="accueil"
      className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#fbf9f5]"
    >
      {/* Delicate background ambient aura */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ffdea5]/30 via-transparent to-transparent"></div>

      <div className="max-w-[1180px] w-full mx-auto relative z-10 flex flex-col items-center text-center">
        {/* Top Monogram Badge */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative group">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white p-2 shadow-xl shadow-[#c5a059]/15 flex items-center justify-center border border-[#c5a059]/40 transition-transform duration-500 group-hover:scale-105">
              <WeddingLogo
                src={details.monogramUrl}
                alt="Monogramme Jonas & Flora"
                className="w-16 h-16 md:w-20 md:h-20"
                imgClassName="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
            </div>
            <div className="absolute -inset-1 rounded-full border border-[#c5a059]/30 pointer-events-none animate-spin-slow opacity-60"></div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <span className="w-8 md:w-12 h-[1px] bg-[#c5a059]"></span>
            <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#775a19]">
              {details.heroBadge || 'Célébration Nuptiale Privée'}
            </span>
            <span className="w-8 md:w-12 h-[1px] bg-[#c5a059]"></span>
          </div>
        </div>

        {/* Main Couple Names - Refined letter-spacing and line-height */}
        <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] text-[#1b1c1a] tracking-[0.07em] sm:tracking-[0.09em] md:tracking-[0.11em] uppercase font-semibold leading-[1.36] sm:leading-[1.28] md:leading-[1.24] mb-4 max-w-3xl">
          {details.groom.fullName.toUpperCase()}{' '}
          <span className="text-[#775a19] inline-block font-editorial italic font-normal text-xl sm:text-2xl md:text-3xl mx-2 lowercase align-middle">
            &
          </span>{' '}
          {details.bride.fullName.toUpperCase()}
        </h1>

        {/* Subtitle & Date */}
        <p className="font-editorial text-base sm:text-lg md:text-xl text-[#4e4639] max-w-2xl mb-3 font-light leading-relaxed tracking-widest">
          {details.announcementText || 'Nous avons le bonheur de vous annoncer notre mariage'}
        </p>
        <p className="font-sans text-xs sm:text-sm font-semibold tracking-[0.22em] leading-normal text-[#775a19] uppercase mb-8">
          {(details.dateString || '29 OCTOBRE 2026').toUpperCase()} — {details.cityCountry || 'KINSHASA, RDC'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto">
          <a
            href="#rsvp"
            id="hero-rsvp-cta"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1b1c1a] text-[#ffdea5] hover:bg-[#775a19] hover:text-white rounded-lg text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-lg shadow-black/10 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
          >
            <span>Confirmer ma présence</span>
          </a>

          <a
            href="#histoire"
            id="hero-story-cta"
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#1b1c1a] hover:bg-[#eae8e4] border border-[#d1c5b4] rounded-lg text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 shadow-sm flex items-center justify-center"
          >
            <span>Découvrir notre histoire</span>
          </a>
        </div>

        {/* Share Quick Utility */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12 text-xs">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white text-[#4e4639] border border-[#d1c5b4] rounded-full transition-colors shadow-2xs"
            title="Partager l'invitation sur WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Partager l'invitation</span>
          </button>
        </div>

        {/* Grand Visuel Central des Futurs Mariés */}
        <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl shadow-[#775a19]/10 border border-[#c5a059]/30 group">
          <div className="aspect-[16/9] w-full overflow-hidden bg-[#e4e2de]">
            <img
              src={details.coupleHeroPhoto}
              alt={`${details.groom.fullName} et ${details.bride.fullName}`}
              className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
            />
          </div>

          {/* Bottom Luxury Plaque */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1b1c1a]/85 via-[#1b1c1a]/35 to-transparent p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between text-white text-center sm:text-left">
            <div className="mb-3 sm:mb-0">
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] text-[#ffdea5] uppercase block">
                {details.cityCountry || 'Kinshasa — République Démocratique du Congo'}
              </span>
              <span className="font-editorial text-lg sm:text-2xl font-normal text-white">
                {details.heroTagline || "Deux âmes réunies pour l'éternité"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs tracking-wider">
              <Heart className="w-3.5 h-3.5 text-[#ffdea5] fill-[#ffdea5]/50" />
              <span className="font-medium">{details.dateString}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
