import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldAlert,
  Users,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useWeddingData } from '../context/WeddingDataContext';

interface SensitiveDataLockProps {
  sectionType: 'guests' | 'guestbook';
  title?: string;
  description?: string;
  onUnlocked?: () => void;
}

export const SensitiveDataLock: React.FC<SensitiveDataLockProps> = ({
  sectionType,
  title,
  description,
  onUnlocked,
}) => {
  const { verifyAdminPin } = useWeddingData();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const defaultTitle =
    sectionType === 'guests'
      ? 'Protection des Réponses RSVP & Coordonnées des Invités'
      : 'Protection des Vœux Personnels du Livre d\'Or';

  const defaultDescription =
    sectionType === 'guests'
      ? 'Cette section contient des informations hautement personnelles et confidentielles des convives (noms, numéros de téléphone, présences, accompagnants et messages privés). Veuillez saisir le code PIN pour afficher ces données.'
      : 'Cette section contient les messages et coordonnées intimes partagés par les invités. Un code PIN est requis avant de pouvoir consulter, modérer ou gérer ces témoignages.';

  const handleVerify = async (pinCandidate: string) => {
    if (!pinCandidate || pinCandidate.trim().length < 3) {
      setErrorMsg('Veuillez saisir le code PIN d\'accès.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const isValid = await verifyAdminPin(pinCandidate.trim());
      if (isValid) {
        if (onUnlocked) {
          onUnlocked();
        }
      } else {
        setShake(true);
        setErrorMsg('Code PIN incorrect. Veuillez vérifier et réessayer.');
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setErrorMsg('Erreur de communication. Veuillez réessayer.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(pin);
  };

  const handleNumpadClick = (digit: string) => {
    if (pin.length < 8) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg(null);
      if (nextPin.length === 4) {
        handleVerify(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  return (
    <div className="py-8 px-4 flex items-center justify-center min-h-[440px]">
      <div
        className={`w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#c5a059]/40 overflow-hidden relative transition-all ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Decorative Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#c5a059] via-[#ffdea5] to-[#775a19]" />

        {/* Lock Screen Header */}
        <div className="p-6 text-center border-b border-[#c5a059]/20 bg-gradient-to-b from-[#fbf9f5] to-white">
          <div className="relative w-16 h-16 rounded-full bg-[#fbf9f5] border-2 border-[#c5a059]/50 mx-auto flex items-center justify-center text-[#775a19] shadow-inner mb-3">
            {sectionType === 'guests' ? (
              <Users className="w-7 h-7 text-[#775a19]" />
            ) : (
              <MessageSquare className="w-7 h-7 text-[#775a19]" />
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1b1c1a] text-[#ffdea5] flex items-center justify-center border-2 border-white shadow-sm">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#c5a059]/15 text-[#775a19] text-[10px] font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3 h-3 text-[#775a19]" />
            Données Sensibles Protégées
          </span>

          <h3 className="font-editorial text-xl sm:text-2xl text-[#1b1c1a] font-semibold leading-tight">
            {title || defaultTitle}
          </h3>

          <p className="text-xs text-[#605e5c] mt-2 leading-relaxed max-w-sm mx-auto">
            {description || defaultDescription}
          </p>
        </div>

        {/* Form and PIN Entry */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="sensitive-data-pin-input"
                className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-2 text-center"
              >
                Saisissez le Code PIN
              </label>

              <div className="relative max-w-[240px] mx-auto">
                <input
                  ref={inputRef}
                  id="sensitive-data-pin-input"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPin(val);
                    setErrorMsg(null);
                    if (val.length === 4) {
                      handleVerify(val);
                    }
                  }}
                  placeholder="••••"
                  className="w-full text-center text-2xl font-mono tracking-[0.4em] py-2.5 px-4 rounded-xl bg-[#fbf9f5] border border-[#c5a059]/40 shadow-inner text-[#1b1c1a] focus:outline-none focus:border-[#775a19] focus:ring-2 focus:ring-[#c5a059]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f7667] hover:text-[#1b1c1a] p-1.5"
                  title={showPin ? 'Masquer le code' : 'Afficher le code'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-center gap-2 max-w-[280px] mx-auto text-center animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Virtual Numpad */}
            <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleNumpadClick(digit)}
                  className="h-10 rounded-xl bg-[#fbf9f5] hover:bg-[#f5efe4] border border-[#d1c5b4]/60 text-[#1b1c1a] font-semibold text-base shadow-2xs hover:border-[#c5a059] active:scale-95 transition-all"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="h-10 rounded-xl bg-[#f5f3ef] hover:bg-[#eae6de] text-[#605e5c] text-[11px] font-semibold uppercase tracking-wider transition-all"
              >
                Effacer
              </button>
              <button
                type="button"
                onClick={() => handleNumpadClick('0')}
                className="h-10 rounded-xl bg-[#fbf9f5] hover:bg-[#f5efe4] border border-[#d1c5b4]/60 text-[#1b1c1a] font-semibold text-base shadow-2xs hover:border-[#c5a059] active:scale-95 transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-10 rounded-xl bg-[#f5f3ef] hover:bg-[#eae6de] text-[#605e5c] text-sm font-semibold flex items-center justify-center transition-all"
                aria-label="Effacer le dernier chiffre"
              >
                ⌫
              </button>
            </div>

            {/* Action Unlock Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="unlock-sensitive-data-btn"
                disabled={isVerifying || pin.length === 0}
                className="w-full py-3 px-4 bg-[#1b1c1a] hover:bg-[#775a19] disabled:opacity-50 text-[#ffdea5] hover:text-white rounded-xl text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isVerifying ? 'Déverrouillage...' : 'Déverrouiller les données'}</span>
              </button>
            </div>
          </form>

          {/* Discreet Help / Quick Default PIN Fill */}
          <div className="pt-3 border-t border-[#f0eee9] text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#7f7667]">
              <span>Codes par défaut :</span>
              <button
                type="button"
                onClick={() => {
                  setPin('1234');
                  handleVerify('1234');
                }}
                className="font-mono font-bold text-[#775a19] hover:underline px-1.5 py-0.5 rounded bg-[#c5a059]/10"
              >
                1234
              </button>
              <span>ou</span>
              <button
                type="button"
                onClick={() => {
                  setPin('2026');
                  handleVerify('2026');
                }}
                className="font-mono font-bold text-[#775a19] hover:underline px-1.5 py-0.5 rounded bg-[#c5a059]/10"
              >
                2026
              </button>
            </div>
            <p className="text-[10px] text-[#938b7d] mt-1.5 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-[#c5a059]" />
              <span>Modifiable à tout moment dans l'onglet « Sécurité & PIN »</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
