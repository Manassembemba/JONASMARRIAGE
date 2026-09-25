import React from 'react';
import { useWeddingData } from '../context/WeddingDataContext';
import { Calendar, Clock, MapPin, Navigation, ArrowRight, Building2, Users, Heart } from 'lucide-react';

export const ProgramSection: React.FC = () => {
  const { programSteps, details, venues } = useWeddingData();

  // Helper to pick appropriate icon
  const getStepIcon = (title: string, index: number) => {
    const t = title.toLowerCase();
    if (t.includes('civil') || t.includes('maison')) return <Building2 className="w-5 h-5 text-[#775a19]" />;
    if (t.includes('coutumier') || t.includes('famille')) return <Users className="w-5 h-5 text-[#775a19]" />;
    if (index === 0) return <Building2 className="w-5 h-5 text-[#775a19]" />;
    if (index === 1) return <Users className="w-5 h-5 text-[#775a19]" />;
    return <Heart className="w-5 h-5 text-[#775a19]" />;
  };

  return (
    <section id="programme" className="w-full py-20 bg-[#fbf9f5] relative">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[11px] font-semibold tracking-[0.22em] leading-normal text-[#775a19] uppercase block mb-2">
            L'Itinéraire des Festivités
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#1b1c1a] font-normal leading-[1.22] sm:leading-[1.18] tracking-[0.015em]">
            Nos Célébrations Nuptiales — {details.dateFormatted || '29 & 31 Octobre 2026'}
          </h2>
          <p className="text-xs sm:text-sm text-[#4e4639] max-w-xl mx-auto mt-2 leading-relaxed">
            {details.programSubtitle || "Découvrez le déroulement chronologique de nos cérémonies consacrées à l'amour, à la loi républicaine et aux traditions ancestrales."}
          </p>
        </div>

        {/* Timeline du mariage */}
        <div className="mb-16">
          <div className="text-center mb-6">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#605e5c] uppercase">
              Chronologie des Célébrations • {details.dateString || '29 & 31 Octobre 2026'}
            </span>
          </div>

          {/* Desktop view (Horizontal) */}
          <div
            className={`hidden md:grid gap-6 relative ${
              programSteps.length === 2 ? 'md:grid-cols-2' : programSteps.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-1'
            }`}
          >
            {programSteps.length > 1 && (
              <div className="absolute top-1/2 left-16 right-16 h-[2px] bg-[#d1c5b4]/60 -translate-y-1/2 z-0"></div>
            )}

            {programSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative z-10 bg-white p-6 rounded-xl shadow-sm border border-[#c5a059]/25 text-center flex flex-col items-center group hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-[#c5a059]/15 text-[#775a19] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  {getStepIcon(step.title, idx)}
                </div>
                {step.date && (
                  <span className="text-[11px] font-bold text-[#775a19] uppercase tracking-wider block mb-1">
                    {step.date}
                  </span>
                )}
                <span className="text-xs font-bold tracking-[0.16em] text-[#1b1c1a] block mb-1">
                  {step.time}
                </span>
                <h4 className="font-editorial text-lg text-[#1b1c1a] font-semibold mb-1">
                  {step.title.toUpperCase()}
                </h4>
                <span className="text-xs text-[#605e5c]">{step.location}</span>
              </div>
            ))}
          </div>

          {/* Mobile view (Vertical) */}
          <div className="md:hidden flex flex-col gap-4">
            {programSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c5a059]/25 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#c5a059]/15 text-[#775a19] flex items-center justify-center shrink-0">
                    {getStepIcon(step.title, idx)}
                  </div>
                  <div>
                    {step.date && (
                      <span className="text-[10px] font-bold text-[#775a19] uppercase tracking-wider block">
                        {step.date}
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#1b1c1a] tracking-wider block">{step.time}</span>
                    <h4 className="font-editorial text-base text-[#1b1c1a] font-semibold">{step.title.toUpperCase()}</h4>
                    <p className="text-xs text-[#605e5c]">{step.location}</p>
                  </div>
                </div>
                {idx < programSteps.length - 1 && (
                  <div className="flex justify-center text-[#c5a059]">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Grandes Fiches Détaillées des Cérémonies Officielles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {venues.map((venue, idx) => (
            <div
              key={venue.id || idx}
              className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl shadow-black/5 border border-[#c5a059]/30 flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/10 rounded-bl-full pointer-events-none transition-all duration-500 group-hover:scale-110"></div>

              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#c5a059]/15 flex items-center justify-center text-[#775a19]">
                    {idx === 0 ? <Building2 className="w-6 h-6 text-[#775a19]" /> : <Users className="w-6 h-6 text-[#775a19]" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] leading-normal text-[#775a19] uppercase block">
                      {venue.ceremony}
                    </span>
                    <h3 className="font-editorial text-2xl sm:text-3xl text-[#1b1c1a] font-semibold leading-[1.25] tracking-[0.06em] sm:tracking-[0.08em] uppercase">
                      {venue.badge}
                    </h3>
                  </div>
                </div>

                {/* Date & Time badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6 text-xs text-[#4e4639]">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#f5f3ef] border border-[#d1c5b4]/40 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#775a19]" />
                    <span>{(venue.date || details.dateString || '29 & 31 OCTOBRE 2026').toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#f5f3ef] border border-[#d1c5b4]/40 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#775a19]" />
                    <span>{venue.time}</span>
                  </div>
                </div>

                {/* Address detail box */}
                <div className="space-y-2 mb-8 bg-[#fbf9f5] p-5 rounded-xl border border-[#c5a059]/15">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#775a19] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-[#1b1c1a]">
                        {venue.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#4e4639] mt-0.5">
                        {venue.address}
                      </p>
                      {venue.landmarks && (
                        <div className="mt-2 pt-2 border-t border-[#eae8e4] text-xs font-medium text-[#775a19]">
                          <span>{venue.landmarks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={venue.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 w-full py-4 rounded-lg text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-sm ${
                  idx === 0
                    ? 'bg-[#f5f3ef] hover:bg-[#775a19] text-[#1b1c1a] hover:text-white border border-[#d1c5b4]/60 hover:border-[#775a19]'
                    : 'bg-[#1b1c1a] hover:bg-[#775a19] text-[#ffdea5] hover:text-white shadow-md'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>Voir l'itinéraire</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
