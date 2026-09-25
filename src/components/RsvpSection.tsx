import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RSVPData } from '../types';
import { useWeddingData } from '../context/WeddingDataContext';
import {
  downloadInvitationPdf,
  formatPhoneForWhatsApp,
  generateWhatsAppInvitationMessage,
} from '../utils/invitationPdf';
import {
  Heart,
  Check,
  Plus,
  Minus,
  Send,
  AlertCircle,
  Download,
  MessageCircle,
  FileText,
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
  const [guestsCount, setGuestsCount] = useState<number>(1);
  const [guestNames, setGuestNames] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<RSVPData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGuestsIncrement = () => {
    if (guestsCount < 10) setGuestsCount(guestsCount + 1);
  };

  const handleGuestsDecrement = () => {
    if (guestsCount > 1) setGuestsCount(guestsCount - 1);
  };

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

    const newRsvp: RSVPData = {
      id: 'rsvp-' + Date.now(),
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      attendance,
      guests_count: attendance === 'oui' ? guestsCount : 0,
      guest_names: attendance === 'oui' ? guestNames.trim() : '',
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
    <section id="rsvp" className="w-full py-20 bg-[#fbf9f5] relative">
      <div className="max-w-[780px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-full bg-[#c5a059]/20 text-[#775a19] mx-auto flex items-center justify-center mb-4 border border-[#c5a059]/40">
            <Heart className="w-6 h-6 text-[#775a19]" />
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
                  placeholder="Votre nom complet (ex: M. et Mme Ilunga)"
                  required
                  className="w-full px-4 py-3.5 rounded-lg bg-[#f5f3ef] border border-[#d1c5b4]/60 text-[#1b1c1a] placeholder:text-[#7f7667] text-sm focus:outline-none focus:bg-white focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all"
                />
              </div>

              {/* Téléphone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="rsvp-telephone"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-2"
                  >
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    id="rsvp-telephone"
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

              {/* Si OUI : Nombre de personnes & Accompagnants */}
              {attendance === 'oui' && (
                <div className="space-y-6 pt-2 border-t border-[#eae8e4]">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-2">
                      Nombre de personnes
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={handleGuestsDecrement}
                        className="w-10 h-10 rounded-lg bg-[#f5f3ef] hover:bg-[#eae8e4] border border-[#d1c5b4] flex items-center justify-center text-[#1b1c1a] transition-colors"
                        aria-label="Diminuer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="font-editorial text-2xl font-bold text-[#775a19] w-10 text-center">
                        {guestsCount}
                      </span>

                      <button
                        type="button"
                        onClick={handleGuestsIncrement}
                        className="w-10 h-10 rounded-lg bg-[#f5f3ef] hover:bg-[#eae8e4] border border-[#d1c5b4] flex items-center justify-center text-[#1b1c1a] transition-colors"
                        aria-label="Augmenter"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <span className="text-xs text-[#605e5c] italic">
                        personne(s) attendue(s)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="rsvp-companions"
                      className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-2"
                    >
                      Nom des accompagnants
                    </label>
                    <input
                      type="text"
                      id="rsvp-companions"
                      value={guestNames}
                      onChange={(e) => setGuestNames(e.target.value)}
                      placeholder="Ex: Époux(se), enfants ou personnes accompagnantes"
                      className="w-full px-4 py-3.5 rounded-lg bg-[#f5f3ef] border border-[#d1c5b4]/60 text-[#1b1c1a] placeholder:text-[#7f7667] text-sm focus:outline-none focus:bg-white focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Un petit mot pour les mariés */}
              <div>
                <label
                  htmlFor="rsvp-note"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-2"
                >
                  Un petit mot pour les mariés
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
                className="w-full py-4 px-6 bg-[#1b1c1a] text-[#ffdea5] hover:bg-[#775a19] hover:text-white rounded-lg text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-xl shadow-black/10 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>CONFIRMER MA PRÉSENCE</span>
              </button>
            </form>
          ) : (
            /* Écran de confirmation après validation (Cahier des charges 10) */
            <div className="py-10 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-[#c5a059]/20 text-[#775a19] mx-auto flex items-center justify-center border border-[#c5a059]/40 shadow-inner">
                <Check className="w-8 h-8 text-[#775a19]" />
              </div>

              <h3 className="font-editorial text-2xl sm:text-3xl text-[#1b1c1a] font-semibold">
                Merci pour votre réponse !
              </h3>

              <p className="text-sm sm:text-base text-[#4e4639] max-w-md mx-auto leading-relaxed">
                Jonas & Flora sont heureux de vous compter parmi leurs invités.
              </p>

              {/* Carte récapitulative élégante */}
              {submittedData && (
                <div className="max-w-md mx-auto bg-[#fbf9f5] p-5 rounded-xl border border-[#c5a059]/30 text-left space-y-2 text-xs text-[#4e4639]">
                  <div className="flex justify-between border-b border-[#eae8e4] pb-2">
                    <span className="font-semibold uppercase tracking-wider text-[#775a19]">
                      Invité :
                    </span>
                    <span className="font-medium text-[#1b1c1a]">{submittedData.full_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#eae8e4] pb-2">
                    <span className="font-semibold uppercase tracking-wider text-[#775a19]">
                      Présence :
                    </span>
                    <span className="font-medium text-[#1b1c1a]">
                      {submittedData.attendance === 'oui' ? 'Présent(e)' : 'Absent(e)'}
                    </span>
                  </div>
                  {submittedData.attendance === 'oui' && (
                    <div className="flex justify-between border-b border-[#eae8e4] pb-2">
                      <span className="font-semibold uppercase tracking-wider text-[#775a19]">
                        Personnes :
                      </span>
                      <span className="font-medium text-[#1b1c1a]">
                        {submittedData.guests_count} personne(s)
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
                </div>
              )}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[#775a19] hover:underline"
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
