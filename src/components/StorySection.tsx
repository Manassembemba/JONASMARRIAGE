import React from 'react';
import { useWeddingData } from '../context/WeddingDataContext';
import { Sparkles, Heart } from 'lucide-react';

export const StorySection: React.FC = () => {
  const { details, storyMilestones } = useWeddingData();

  return (
    <section id="histoire" className="w-full py-20 bg-[#f5f3ef] relative border-t border-[#c5a059]/15">
      <div className="max-w-[780px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-[11px] font-semibold tracking-[0.22em] leading-normal text-[#775a19] uppercase block mb-2">
            Leur Cheminement
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#1b1c1a] font-normal leading-[1.22] sm:leading-[1.18] tracking-[0.015em]">
            {details.storyIntroTitle || 'Notre Histoire'}
          </h2>
          <p className="text-xs sm:text-sm text-[#4e4639] max-w-md mx-auto mt-2 leading-relaxed">
            {details.storyIntroText || "D'une rencontre fortuite à l'évidence d'une vie entière à bâtir ensemble."}
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-8 sm:pl-12 space-y-10 sm:space-y-12 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-[#c5a059] before:via-[#ffdea5] before:to-[#775a19]">
          {storyMilestones.map((step, index) => {
            const isLast = index === storyMilestones.length - 1;

            return (
              <div key={step.title} className="relative group">
                {/* Marker Dot */}
                <div
                  className={`absolute -left-[32px] sm:-left-[36px] top-1 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md transition-transform duration-300 group-hover:scale-110 ${
                    isLast
                      ? 'bg-[#775a19] text-white border border-[#c5a059]'
                      : 'bg-white text-[#775a19] border border-[#c5a059]/50'
                  }`}
                >
                  {isLast ? <Heart className="w-3.5 h-3.5 fill-current" /> : <span>{step.icon}</span>}
                </div>

                {/* Content Card */}
                <div
                  className={`bg-white p-6 sm:p-7 rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md ${
                    isLast
                      ? 'border-l-4 border-l-[#775a19] border-t border-r border-b border-[#c5a059]/30 bg-gradient-to-br from-white to-[#fbf9f5]'
                      : 'border-[#c5a059]/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] leading-normal text-[#775a19] uppercase">
                      {step.subtitle}
                    </span>
                    {isLast && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdea5] text-[#4e3700]">
                        <Sparkles className="w-3 h-3" />
                        Grand Jour
                      </span>
                    )}
                  </div>

                  <h3 className="font-editorial text-lg sm:text-xl text-[#1b1c1a] font-semibold leading-[1.3] tracking-[0.02em] mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#4e4639] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
