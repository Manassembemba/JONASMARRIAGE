import React from 'react';
import { useWeddingData } from '../context/WeddingDataContext';
import { Heart } from 'lucide-react';
import { WeddingLogo } from './WeddingLogo';

export const CoupleSection: React.FC = () => {
  const { details } = useWeddingData();

  return (
    <section id="maries" className="w-full py-20 bg-[#fbf9f5] relative">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[11px] font-semibold tracking-[0.22em] leading-normal text-[#775a19] uppercase block mb-2">
            Les Âmes Sœurs
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#1b1c1a] font-normal leading-[1.22] sm:leading-[1.18] tracking-[0.015em]">
            Les Futurs Mariés
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Le Marié */}
          <div className="lg:col-span-4 flex flex-col items-center text-center bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/5 border border-[#c5a059]/25 group transition-all duration-300 hover:shadow-2xl hover:border-[#c5a059]/50">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden mb-6 shadow-md border-2 border-[#c5a059]/40 p-1 bg-white">
              {details.groom.photo ? (
                <img
                  src={details.groom.photo}
                  alt={details.groom.fullName}
                  className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f5f0e6] to-[#eae3d2] flex items-center justify-center text-[#775a19] text-3xl font-editorial font-bold shadow-inner">
                  {details.groom.shortName?.charAt(0) || 'J'}
                </div>
              )}
            </div>
            <span className="text-[11px] font-semibold tracking-[0.2em] leading-normal text-[#775a19] uppercase mb-1">
              {details.groom.role}
            </span>
            <h3 className="font-editorial text-xl sm:text-2xl text-[#1b1c1a] font-medium leading-[1.3] tracking-[0.02em] mb-3">
              {details.groom.fullName}
            </h3>
            <p className="text-xs sm:text-sm text-[#4e4639] leading-relaxed italic">
              {details.groom.quote}
            </p>
          </div>

          {/* Centre : Monogramme & Citation */}
          <div className="lg:col-span-4 flex flex-col items-center text-center px-4 py-6">
            <div className="w-24 h-24 rounded-full bg-[#efeeea] p-3 flex items-center justify-center mb-6 shadow-inner border border-[#c5a059]/30">
              <WeddingLogo
                src={details.monogramUrl}
                alt="Monogramme Jonas & Flora"
                className="w-16 h-16"
                imgClassName="w-16 h-16 object-contain"
              />
            </div>

            <div className="w-8 h-[1px] bg-[#c5a059] mb-4" />

            <blockquote className="font-editorial text-lg sm:text-xl text-[#1b1c1a] italic leading-[1.45] tracking-[0.01em] mb-4">
              « {details.centerQuote} »
            </blockquote>

            <div className="w-16 h-[1px] bg-[#c5a059] mb-4"></div>

            <span className="text-[11px] font-medium tracking-[0.2em] leading-normal text-[#605e5c] uppercase">
              {details.centerSubtitle || 'Pour le Meilleur et pour Toujours'}
            </span>
          </div>

          {/* La Mariée */}
          <div className="lg:col-span-4 flex flex-col items-center text-center bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/5 border border-[#c5a059]/25 group transition-all duration-300 hover:shadow-2xl hover:border-[#c5a059]/50">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden mb-6 shadow-md border-2 border-[#c5a059]/40 p-1 bg-white">
              {details.bride.photo ? (
                <img
                  src={details.bride.photo}
                  alt={details.bride.fullName}
                  className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f5f0e6] to-[#eae3d2] flex items-center justify-center text-[#775a19] text-3xl font-editorial font-bold shadow-inner">
                  {details.bride.shortName?.charAt(0) || 'F'}
                </div>
              )}
            </div>
            <span className="text-[11px] font-semibold tracking-[0.2em] leading-normal text-[#775a19] uppercase mb-1">
              {details.bride.role}
            </span>
            <h3 className="font-editorial text-xl sm:text-2xl text-[#1b1c1a] font-medium leading-[1.3] tracking-[0.02em] mb-3">
              {details.bride.fullName}
            </h3>
            <p className="text-xs sm:text-sm text-[#4e4639] leading-relaxed italic">
              {details.bride.quote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
