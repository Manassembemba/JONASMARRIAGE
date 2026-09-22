import React, { useState, useEffect } from 'react';
import { useWeddingData } from '../context/WeddingDataContext';
import { Clock } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

export const Countdown: React.FC = () => {
  const { details } = useWeddingData();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false,
  });

  useEffect(() => {
    const target = new Date(details.targetDateTime).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isComplete: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isComplete: false,
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [details.targetDateTime]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  const modules = [
    { label: 'Jours', value: pad(timeLeft.days) },
    { label: 'Heures', value: pad(timeLeft.hours) },
    { label: 'Minutes', value: pad(timeLeft.minutes) },
    { label: 'Secondes', value: pad(timeLeft.seconds) },
  ];

  return (
    <section
      id="compte-a-rebours"
      className="w-full py-16 bg-[#f5f3ef] relative overflow-hidden border-y border-[#c5a059]/15"
    >
      <div className="max-w-[840px] mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 mb-2 text-[#775a19]">
          <Clock className="w-4 h-4 text-[#c5a059]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] leading-normal">
            Chaque seconde nous rapproche
          </span>
        </div>

        <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl text-[#1b1c1a] font-normal leading-[1.25] tracking-[0.015em] mb-8">
          Le Compte à Rebours de notre Union
        </h2>

        {/* 4 Horology Luxury Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-2xl mx-auto">
          {modules.map((item) => (
            <div
              key={item.label}
              className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-[#c5a059]/20 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md hover:border-[#c5a059]/40 group"
            >
              <span className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold text-[#775a19] tracking-tight group-hover:scale-105 transition-transform duration-300">
                {item.value}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#605e5c] mt-2">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs sm:text-sm text-[#4e4639] mt-6 italic">
          Rendez-vous les 29 et 31 octobre 2026 pour célébrer notre union sacrée à Kinshasa.
        </p>
      </div>
    </section>
  );
};
