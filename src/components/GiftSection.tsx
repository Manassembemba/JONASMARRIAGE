import React, { useState } from 'react';
import { useWeddingData } from '../context/WeddingDataContext';
import { Gift, Copy, Check, Heart, Smartphone, MessageCircle, ExternalLink } from 'lucide-react';
import { GiftPayment } from '../types';

export const GiftSection: React.FC = () => {
  const { giftPayments, details } = useWeddingData();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter only active payments
  const activePayments = (giftPayments || []).filter((g) => g.isActive);

  if (activePayments.length === 0) {
    return null;
  }

  const handleCopy = (payment: GiftPayment) => {
    navigator.clipboard.writeText(payment.phone);
    setCopiedId(payment.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const getProviderBadge = (provider: GiftPayment['provider']) => {
    switch (provider) {
      case 'mpesa':
        return {
          bg: 'bg-red-600',
          border: 'border-red-500/30',
          text: 'text-white',
          lightBg: 'bg-red-50',
          accent: 'text-red-700',
          name: 'M-PESA (Vodacom)',
        };
      case 'orange':
        return {
          bg: 'bg-orange-500',
          border: 'border-orange-500/30',
          text: 'text-white',
          lightBg: 'bg-orange-50',
          accent: 'text-orange-700',
          name: 'Orange Money',
        };
      case 'airtel':
        return {
          bg: 'bg-red-800',
          border: 'border-red-800/30',
          text: 'text-white',
          lightBg: 'bg-red-50',
          accent: 'text-red-900',
          name: 'Airtel Money',
        };
      default:
        return {
          bg: 'bg-[#775a19]',
          border: 'border-[#c5a059]/40',
          text: 'text-white',
          lightBg: 'bg-[#faf8f4]',
          accent: 'text-[#775a19]',
          name: 'Paiement / Virement',
        };
    }
  };

  const contactPhone = details.contactPhone || '0823965480';
  const cleanIntlPhone = contactPhone.replace(/\D/g, '').replace(/^0/, '243');

  return (
    <section id="cadeaux" className="w-full py-20 bg-[#fbf9f5] relative overflow-hidden border-t border-[#c5a059]/20">
      {/* Delicate background aura */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ffdea5]/25 via-transparent to-transparent"></div>

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#775a19]/10 text-[#775a19] text-xs font-semibold tracking-widest uppercase mb-3 border border-[#c5a059]/30">
            <Gift className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Soutien & Bénédictions</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#1b1c1a] font-normal leading-[1.2] tracking-[0.015em] mb-4">
            Cadeaux & Gestes de Cœur
          </h2>

          <p className="text-xs sm:text-sm text-[#4e4639] leading-relaxed">
            Votre présence et vos prières sont notre plus beau cadeau. Pour ceux et celles qui souhaitent bénir notre union et nous soutenir financièrement dans la construction de notre nouveau foyer, vous pouvez adresser vos dons en toute sécurité via les coordonnées ci-dessous :
          </p>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePayments.map((item) => {
            const style = getProviderBadge(item.provider);
            const isCopied = copiedId === item.id;
            const waNumber = item.phone.replace(/\D/g, '').replace(/^0/, '243');
            const waText = encodeURIComponent(
              `Bonjour, je vous écris concernant le mariage de ${details.groom.shortName} & ${details.bride.shortName} pour vous adresser un soutien via ${item.label}.`
            );

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-[#c5a059]/25 shadow-lg shadow-black/5 hover:shadow-xl hover:border-[#c5a059]/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Operator Header Badge */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text} shadow-xs`}>
                      {style.name}
                    </span>
                    <Smartphone className={`w-4 h-4 ${style.accent}`} />
                  </div>

                  {/* Label / Title */}
                  <h3 className="font-editorial text-lg text-[#1b1c1a] font-semibold mb-1">
                    {item.label}
                  </h3>

                  {/* Recipient Name */}
                  <p className="text-xs text-[#775a19] font-medium mb-3 flex items-center gap-1.5">
                    <Heart className="w-3 h-3 fill-[#c5a059]/40 text-[#c5a059]" />
                    <span>Bénéficiaire : <strong>{item.recipientName}</strong></span>
                  </p>

                  {/* Phone Box with 1-click Copy */}
                  <div className="bg-[#faf8f4] border border-[#c5a059]/30 rounded-xl p-3.5 flex items-center justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#8c827a] uppercase tracking-wider block font-semibold">
                        Numéro Mobile Money
                      </span>
                      <span className="font-mono text-base sm:text-lg font-bold text-[#1b1c1a] tracking-wider select-all">
                        {item.phone}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[#775a19] hover:bg-[#5f4714] text-white shadow-2xs'
                      }`}
                      title="Copier le numéro"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Description note if present */}
                  {item.description && (
                    <p className="text-[11px] text-[#605e5c] italic mb-4 leading-relaxed">
                      « {item.description} »
                    </p>
                  )}
                </div>

                {/* Direct WhatsApp Confirmation Button */}
                <div className="pt-2 border-t border-[#f0ebe3]">
                  <a
                    href={`https://wa.me/${waNumber}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors border border-emerald-200 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Notifier par WhatsApp</span>
                    <ExternalLink className="w-3 h-3 text-emerald-500 opacity-60" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-[#7f7667] max-w-lg mx-auto">
            Pour tout renseignement direct ou accompagnement particulier, notre équipe d'organisation reste disponible par WhatsApp au{' '}
            <a
              href={`https://wa.me/${cleanIntlPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#775a19] font-bold underline hover:text-[#5f4714]"
            >
              {contactPhone}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
};
