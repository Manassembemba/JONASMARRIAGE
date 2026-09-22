import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Heart } from 'lucide-react';
import { useWeddingData } from '../context/WeddingDataContext';
import { WeddingLogo } from './WeddingLogo';

interface NavbarProps {
  onOpenAdmin: (tab?: string) => void;
  onOpenCalendarModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin }) => {
  const { details } = useWeddingData();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Triple-clic secret sur le logo pour ouvrir l'espace d'administration
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    // Si l'utilisateur clique 3 fois de suite rapidement (ou si e.detail vaut 3)
    if (clickCountRef.current >= 3 || e.detail >= 3) {
      e.preventDefault();
      e.stopPropagation();
      clickCountRef.current = 0;
      onOpenAdmin();
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 700);
  };

  const navLinks = [
    { label: 'Accueil', href: '#accueil' },
    { label: 'Histoire', href: '#histoire' },
    { label: 'Programme', href: '#programme' },
    { label: 'Lieux', href: '#lieux' },
    { label: 'Galerie', href: '#galerie' },
    { label: 'RSVP', href: '#rsvp' },
    { label: "Livre d'or", href: '#livredor' },
  ];

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#fbf9f5]/90 backdrop-blur-md shadow-md border-b border-[#c5a059]/20 py-2.5'
          : 'bg-[#fbf9f5]/75 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Monogramme & Noms — Triple-clic pour ouvrir l'Administration */}
        <a
          href="#accueil"
          onClick={handleLogoClick}
          className="flex items-center gap-3 group select-none cursor-pointer"
          title="Jonas & Flora — Kinshasa 2026"
        >
          <div className="relative w-10 h-10 rounded-full bg-white p-1 border border-[#c5a059]/40 shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-105 active:scale-95">
            <WeddingLogo
              src={details.monogramUrl}
              alt="Monogramme Jonas & Flora"
              className="w-8 h-8"
              imgClassName="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-editorial text-lg tracking-[0.06em] text-[#775a19] font-medium leading-tight">
              {details.groom.shortName} & {details.bride.shortName}
            </span>
            <span className="font-sans text-[10px] tracking-[0.22em] leading-normal text-[#605e5c] uppercase">
              {details.dateString || '29 & 31.10.2026'}
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3 py-1.5 text-xs font-medium tracking-[0.16em] uppercase text-[#4e4639] hover:text-[#775a19] hover:bg-[#c5a059]/10 rounded-md transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick RSVP Button */}
          <a
            href="#rsvp"
            id="nav-rsvp-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b1c1a] hover:bg-[#775a19] text-[#ffdea5] hover:text-white rounded-md text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 shadow-sm transform hover:-translate-y-0.5"
          >
            <Heart className="w-3.5 h-3.5 text-[#ffdea5]" />
            <span>Confirmer</span>
          </a>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            id="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1b1c1a] hover:text-[#775a19] rounded-md transition-colors"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fbf9f5] border-b border-[#c5a059]/20 px-6 py-5 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm uppercase tracking-[0.2em] font-medium text-[#1b1c1a] hover:text-[#775a19] border-b border-[#eae8e4] last:border-none"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3">
              <a
                href="#rsvp"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 text-center bg-[#1b1c1a] text-[#ffdea5] rounded-md text-xs font-bold uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-2"
              >
                <Heart className="w-3.5 h-3.5 text-[#ffdea5]" />
                <span>Confirmer ma présence</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
