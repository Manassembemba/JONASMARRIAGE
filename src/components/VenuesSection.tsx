import React from 'react';
import { useWeddingData } from '../context/WeddingDataContext';
import { MapPin, Navigation, Clock, Info, Calendar } from 'lucide-react';

export const VenuesSection: React.FC = () => {
  const { venues } = useWeddingData();

  return (
    <section id="lieux" className="w-full py-20 bg-[#f5f3ef] relative border-t border-[#c5a059]/15">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[11px] font-semibold tracking-[0.22em] leading-normal text-[#775a19] uppercase block mb-2">
            Cartographie Nuptiale
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#1b1c1a] font-normal leading-[1.22] sm:leading-[1.18] tracking-[0.015em]">
            Où nous retrouver
          </h2>
          <p className="text-xs sm:text-sm text-[#4e4639] max-w-xl mx-auto mt-2 leading-relaxed">
            Visualisez facilement les adresses officielles pour organiser vos déplacements et votre stationnement en toute sérénité.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {venues.map((venue, idx) => (
            <div
              key={venue.id || idx}
              className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#c5a059]/25 flex flex-col group hover:shadow-xl transition-all duration-300"
            >
              {/* Photo du lieu */}
              <div className="relative w-full h-64 overflow-hidden bg-[#eae8e4]">
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-[#1b1c1a]/85 backdrop-blur-md text-[#ffdea5] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#c5a059]/40">
                  {venue.badge} • {venue.ceremony}
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#775a19] font-medium mb-2.5">
                    {venue.date && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#fbf9f5] border border-[#c5a059]/30 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-[#775a19]" />
                        <span>{venue.date}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#fbf9f5] border border-[#c5a059]/30 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#775a19]" />
                      <span>{venue.time}</span>
                    </div>
                  </div>

                  <h3 className="font-editorial text-xl sm:text-2xl text-[#1b1c1a] font-semibold leading-[1.3] tracking-[0.02em] mb-2">
                    {venue.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#4e4639] mb-4 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                    <span>{venue.address}</span>
                  </p>

                  {venue.landmarks && (
                    <div className="bg-[#fbf9f5] p-3 rounded-lg border border-[#c5a059]/20 text-xs text-[#775a19] font-medium mb-5 flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#c5a059] shrink-0" />
                      <span>{venue.landmarks}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#eae8e4]">
                  <a
                    href={venue.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-[#fbf9f5] hover:bg-[#775a19] text-[#1b1c1a] hover:text-white rounded-lg text-xs font-semibold uppercase tracking-[0.16em] transition-colors border border-[#d1c5b4]/60 hover:border-[#775a19]"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Voir l'itinéraire sur Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
