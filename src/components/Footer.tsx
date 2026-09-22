import React from 'react';
import { useWeddingData } from '../context/WeddingDataContext';
import { WeddingLogo } from './WeddingLogo';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { details } = useWeddingData();

  return (
    <footer className="w-full bg-[#f5f3ef] border-t border-[#c5a059]/20 pt-16 pb-12">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Decorative gold hairline divider */}
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mb-8"></div>

        {/* Monogram */}
        <WeddingLogo
          src={details.monogramUrl}
          alt="Monogramme Jonas & Flora"
          className="h-16 w-16 mb-6 opacity-95 transition-transform duration-300 hover:scale-105"
          imgClassName="h-16 w-16 object-contain"
        />

        {/* Couple Names (Cahier des charges 18) */}
        <h3 className="font-editorial text-base sm:text-xl text-[#1b1c1a] tracking-[0.08em] sm:tracking-[0.1em] uppercase font-semibold leading-[1.3] mb-2">
          {details.groom.fullName.toUpperCase()}{' '}
          <span className="text-[#775a19] text-base sm:text-xl font-light italic mx-1.5 inline-block align-middle">
            &
          </span>{' '}
          {details.bride.fullName.toUpperCase()}
        </h3>

        {/* Date (Cahier des charges 18) */}
        <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] leading-normal text-[#775a19] uppercase mb-4">
          {(details.dateString || '29 OCTOBRE 2026').toUpperCase()}
        </p>

        {/* Message de fin (Cahier des charges 18) */}
        <p className="text-xs sm:text-sm text-[#4e4639] italic max-w-lg mb-8 leading-relaxed">
          {details.footerMessage || "Merci de partager avec nous ce moment unique, prélude d'une éternelle célébration de notre amour."}
        </p>

        {/* Liens de navigation du footer */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-[#605e5c] mb-8 font-medium">
          <a href="#accueil" className="hover:text-[#775a19] transition-colors">
            Accueil
          </a>
          <span>•</span>
          <a href="#histoire" className="hover:text-[#775a19] transition-colors">
            Notre Histoire
          </a>
          <span>•</span>
          <a href="#programme" className="hover:text-[#775a19] transition-colors">
            Programme
          </a>
          <span>•</span>
          <a href="#lieux" className="hover:text-[#775a19] transition-colors">
            Lieux & Accès
          </a>
          <span>•</span>
          <a href="#galerie" className="hover:text-[#775a19] transition-colors">
            Galerie
          </a>
          <span>•</span>
          <a href="#rsvp" className="hover:text-[#775a19] transition-colors">
            RSVP
          </a>
          <span>•</span>
          <a href="#livredor" className="hover:text-[#775a19] transition-colors">
            Livre d'or
          </a>
        </div>

        {/* Hairline */}
        <div className="w-full max-w-sm h-[1px] bg-gradient-to-r from-transparent via-[#d1c5b4] to-transparent mb-6"></div>

        {/* Copyright */}
        <p className="text-[10px] font-medium tracking-widest text-[#7f7667] uppercase">
          © 2026 {details.groom.fullName} & {details.bride.fullName} • {details.cityCountry || 'Kinshasa, RDC'}
        </p>
      </div>
    </footer>
  );
};
