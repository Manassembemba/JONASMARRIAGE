import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RSVPData } from '../types';
import { useWeddingData } from '../context/WeddingDataContext';
import { downloadInvitationPdf } from '../utils/invitationPdf';
import {
  Heart,
  Check,
  Send,
  AlertCircle,
  Download,
  Lock,
} from 'lucide-react';

interface RsvpSectionProps {
  onRsvpSubmitted: (data: RSVPData) => void;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({ onRsvpSubmitted }) => {
  const { details, programSteps, venues } = useWeddingData();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+243 ');
  const [email, setEmail] = useState('');
  const [attendance, setAttendance] = useState<'oui' | 'non'>('oui');
  const [message, setMessage] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<RSVPData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Veuillez renseigner votre nom complet.');
      return;
    }

    if (!phone.trim() || phone.trim() === '+243') {
      setErrorMsg('Veuillez renseigner un numéro de téléphone valide.');
      return;
    }

    // Le nombre de personnes est strictement verrouillé à 1 par défaut (invitation nominative)
    const newRsvp: RSVPData = {
      id: 'rsvp-' + Date.now(),
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      attendance,
      guests_count: attendance === 'oui' ? 1 : 0,
      guest_names: '',
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    // Confetti celebration if attending
    if (attendance === 'oui') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c5a059', '#ffdea5', '#775a19', '#ffffff', '#e9c176'],
      });
    }

    onRsvpSubmitted(newRsvp);
    setSubmittedData(newRsvp);
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setIsSubmitted(false);
  };

  return (
    <section id="rsvp" className="py-20 md:py-28 bg-[#fbf9f5] relative overflow-hidden">
      {/* Decorative subtle background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#c5a059]/10 blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-[#775a19]/10 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#c5a059]/15 text-[#775a19] mb-4">
            <Heart className="w-5 h-5 fill-[#c5a059]/20" />
          </div>
          <span className="text-[11px] font-semibold tracking-[0.22em] leading-normal text-[#775a19] uppercase block mb-2">
            Réponse Attendue
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#1b1c1a] font-normal leading-[1.22] sm:leading-[1.18] tracking-[0.015em]">
            Votre présence nous ferait très plaisir
          </h2>
          <p className="text-xs sm:text-sm text-[#4e4639] max-w-lg mx-auto mt-2 leading-relaxed">
            Prière de nous honorer de votre confirmation afin de faciliter les dispositions d'accueil des deux cérémonies.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-2xl shadow-xl shadow-black/5 border border-[#c5a059]/30 relative">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-4 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Nom complet */}
              <div>
                <label
                  htmlFor="rsvp-fullname"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-2"
                >
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="rsvp-fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom et prénom (ex: Jean-Paul Mbemba)"
                  required
                  className="w-full px-4 py-3.5 rounded-lg bg-[#f5f3ef] border border-[#d1c5b4]/60 text-[#1b1c1a] placeholder:text-[#7f7667] text-sm focus:outline-none focus:bg-white focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all"
                />
              </div>

              {/* Coordonnées : Téléphone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="rsvp-phone"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-2"
                  >
                    Numéro WhatsApp / Téléphone *
                  </label>
                  <input
                    type="tel"
                    id="rsvp-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+243 ..."
                    required
                    className="w-full px-4 py-3.5 rounded-lg bg-[#f5f3ef] border border-[#d1c5b4]/60 text-[#1b1c1a] placeholder:text-[#7f7667] text-sm focus:outline-none focus:bg-white focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="rsvp-email"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-2"
                  >
                    Adresse e-mail <span className="text-[#605e5c] font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="email"
                    id="rsvp-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="w-full px-4 py-3.5 rounded-lg bg-[#f5f3ef] border border-[#d1c5b4]/60 text-[#1b1c1a] placeholder:text-[#7f7667] text-sm focus:outline-none focus:bg-white focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all"
                  />
                </div>
              </div>

              {/* Serez-vous présent(e) ? */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-3">
                  Serez-vous présent(e) ? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      attendance === 'oui'
                        ? 'bg-[#c5a059]/15 border-[#775a19] shadow-sm'
                        : 'bg-[#f5f3ef] border-[#d1c5b4]/40 hover:bg-[#eae8e4]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attendance"
                      value="oui"
                      checked={attendance === 'oui'}
                      onChange={() => setAttendance('oui')}
                      className="w-4 h-4 text-[#775a19] accent-[#775a19]"
                    />
                    <span className="text-sm font-medium text-[#1b1c1a]">
                      Oui, je serai présent(e)
                    </span>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      attendance === 'non'
                        ? 'bg-[#eae8e4] border-[#605e5c] shadow-sm'
                        : 'bg-[#f5f3ef] border-[#d1c5b4]/40 hover:bg-[#eae8e4]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attendance"
                      value="non"
                      checked={attendance === 'non'}
                      onChange={() => setAttendance('non')}
                      className="w-4 h-4 text-[#775a19] accent-[#775a19]"
                    />
                    <span className="text-sm text-[#4e4639]">
                      Non, malheureusement
                    </span>
                  </label>
                </div>
              </div>

              {/* Si OUI : Place strictement verrouillée à 1 personne (non modifiable) */}
              {attendance === 'oui' && (
                <div className="pt-2 border-t border-[#eae8e4] animate-in fade-in duration-200">
                  <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#c5a059]/40 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4 text-[#775a19]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#1b1c1a]">
                            Nombre de place réservée :
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#775a19] text-white text-xs font-bold font-mono">
                            1 personne
                          </span>
                        </div>
                        <p className="text-[11px] text-[#605e5c] mt-0.5 leading-snug">
                          Invitation strictement personnelle et nominative. L'accès est limité à 1 personne par confirmation.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#775a19] bg-white px-2.5 py-1 rounded-md border border-[#c5a059]/30 shrink-0 hidden sm:inline-block">
                      Place Unique
                    </span>
                  </div>
                </div>
              )}

              {/* Un petit mot pour les mariés */}
              <div>
                <label
                  htmlFor="rsvp-note"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-2"
                >
                  Un petit mot pour les mariés <span className="text-[#605e5c] font-normal">(optionnel)</span>
                </label>
                <textarea
                  id="rsvp-note"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez vos vœux ou une pensée chaleureuse pour Jonas & Flora..."
                  className="w-full px-4 py-3.5 rounded-lg bg-[#f5f3ef] border border-[#d1c5b4]/60 text-[#1b1c1a] placeholder:text-[#7f7667] text-sm focus:outline-none focus:bg-white focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all"
                ></textarea>
              </div>

              {/* Bouton de confirmation */}
              <button
                type="submit"
                id="submit-rsvp-btn"
                className="w-full py-4 px-6 bg-[#1b1c1a] text-[#ffdea5] hover:bg-[#775a19] hover:text-white rounded-lg text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-xl shadow-black/10 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>CONFIRMER MA PRÉSENCE</span>
              </button>
            </form>
          ) : (
            /* Écran de confirmation après validation */
            <div className="py-10 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-[#c5a059]/20 text-[#775a19] mx-auto flex items-center justify-center border border-[#c5a059]/40 shadow-inner">
                <Check className="w-8 h-8 text-[#775a19]" />
              </div>

              <h3 className="font-editorial text-2xl sm:text-3xl text-[#1b1c1a] font-semibold">
                Merci pour votre réponse !
              </h3>

              <p className="text-sm sm:text-base text-[#4e4639] max-w-md mx-auto leading-relaxed">
                Jonas & Flora sont heureux de vous compter parmi leurs invités d'honneur.
              </p>

              {/* Carte récapitulative élégante */}
              {submittedData && (
                <div className="max-w-md mx-auto bg-[#fbf9f5] p-5 rounded-xl border border-[#c5a059]/30 text-left space-y-2 text-xs text-[#4e4639]">
                  <div className="flex justify-between border-b border-[#eae8e4] pb-2">
                    <span className="font-semibold uppercase tracking-wider text-[#775a19]">
                      Invité d'honneur :
                    </span>
                    <span className="font-medium text-[#1b1c1a]">{submittedData.full_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#eae8e4] pb-2">
                    <span className="font-semibold uppercase tracking-wider text-[#775a19]">
                      Statut :
                    </span>
                    <span className="font-medium text-[#1b1c1a]">
                      {submittedData.attendance === 'oui' ? 'Présence confirmée' : 'Absent(e)'}
                    </span>
                  </div>
                  {submittedData.attendance === 'oui' && (
                    <div className="flex justify-between border-b border-[#eae8e4] pb-2">
                      <span className="font-semibold uppercase tracking-wider text-[#775a19]">
                        Place attribuée :
                      </span>
                      <span className="font-semibold text-[#775a19]">
                        1 personne (Invitation nominative stricte)
                      </span>
                    </div>
                  )}
                  {submittedData.message && (
                    <div className="pt-1">
                      <span className="font-semibold uppercase tracking-wider text-[#775a19] block mb-1">
                        Votre message :
                      </span>
                      <p className="italic bg-white p-2.5 rounded border border-[#eae8e4]">
                        « {submittedData.message} »
                      </p>
                    </div>
                  )}

                  {submittedData.attendance === 'oui' && (
                    <div className="pt-3 border-t border-[#eae8e4]">
                      <button
                        type="button"
                        onClick={() => downloadInvitationPdf(submittedData, details, programSteps, venues)}
                        className="w-full py-2.5 px-4 bg-[#775a19] hover:bg-[#5f4714] text-white rounded-lg text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-[#ffdea5]" />
                        <span>Télécharger mon Billet & Pass PDF</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[#775a19] hover:underline cursor-pointer"
                >
                  Modifier ma réponse
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
