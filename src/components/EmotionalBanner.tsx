import React from 'react';
import { useWeddingData } from '../context/WeddingDataContext';
import { Heart } from 'lucide-react';

export const EmotionalBanner: React.FC = () => {
  const { details } = useWeddingData();

  return (
    <section className="w-full py-24 bg-[#eae8e4] relative overflow-hidden text-center border-y border-[#c5a059]/20">
      {/* Subtle decorative glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ffdea5]/40 via-transparent to-transparent"></div>

      <div className="max-w-[780px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="w-12 h-12 rounded-full bg-white mx-auto flex items-center justify-center text-[#775a19] shadow-sm mb-6 border border-[#c5a059]/30">
          <Heart className="w-5 h-5 text-[#775a19] fill-[#775a19]/15" />
        </div>

        <p className="font-editorial text-2xl sm:text-3xl md:text-4xl text-[#1b1c1a] font-normal leading-[1.35] sm:leading-[1.3] tracking-[0.015em] max-w-xl mx-auto mb-2">
          {details.emotionalQuote1 || '« Une nouvelle aventure commence...'}
        </p>
        <p className="font-editorial text-2xl sm:text-3xl md:text-4xl text-[#1b1c1a] font-normal leading-[1.35] sm:leading-[1.3] tracking-[0.015em] max-w-xl mx-auto mb-6">
          {details.emotionalQuote2 || 'Et nous aimerions la partager avec vous. »'}
        </p>

        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mx-auto my-6"></div>

        <div className="flex flex-col items-center">
          <span className="font-editorial text-xl sm:text-2xl text-[#775a19] tracking-[0.08em] sm:tracking-[0.1em] font-medium leading-normal">
            {details.groom.shortName} & {details.bride.shortName}
          </span>
          <Heart className="w-4 h-4 text-[#c5a059] fill-[#c5a059]/20 mt-2" />
        </div>
      </div>
    </section>
  );
};
