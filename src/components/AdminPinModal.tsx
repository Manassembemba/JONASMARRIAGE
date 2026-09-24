import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, Eye, EyeOff, X, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWeddingData } from '../context/WeddingDataContext';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { verifyAdminPin } = useWeddingData();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (pinToTest: string) => {
    if (!pinToTest || pinToTest.length < 3) {
      setErrorMsg('Veuillez saisir le code d\'accès');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const isValid = await verifyAdminPin(pinToTest);
      if (isValid) {
        onSuccess();
        onClose();
      } else {
        setShake(true);
        setErrorMsg('Code d\'accès incorrect. Veuillez réessayer.');
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setErrorMsg('Erreur de validation. Veuillez réessayer.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(pin);
  };

  const handleNumpadClick = (num: string) => {
    if (pin.length < 8) {
      const nextPin = pin + num;
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`bg-[#fbf9f5] w-full max-w-md rounded-2xl shadow-2xl border border-[#c5a059]/40 overflow-hidden relative ${
          shake ? 'animate-bounce' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#605e5c] hover:text-[#1b1c1a] hover:bg-[#c5a059]/15 rounded-full transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 text-center border-b border-[#c5a059]/20 bg-gradient-to-b from-[#f5f0e6] to-[#fbf9f5]">
          <div className="w-16 h-16 rounded-full bg-white text-[#775a19] mx-auto flex items-center justify-center shadow-md border border-[#c5a059]/40 mb-3 relative">
            <Shield className="w-8 h-8 text-[#775a19]" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1b1c1a] text-[#ffdea5] flex items-center justify-center border-2 border-white shadow-sm">
              <Lock className="w-3 h-3" />
            </div>
          </div>
          <span className="text-[10px] font-semibold tracking-[0.22em] text-[#775a19] uppercase block mb-1">
            Sécurité & Confidentialité
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#1b1c1a] font-normal leading-tight">
            Espace Administration
          </h2>
          <p className="text-xs text-[#605e5c] mt-1.5 max-w-xs mx-auto">
            Veuillez saisir votre code d'accès secret pour gérer les RSVP, le livre d'or et les paramètres.
          </p>
        </div>

        {/* Modal Body / PIN Input */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-secret-pin"
                className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-2 text-center"
              >
                Code d'accès
              </label>

              <div className="relative max-w-[240px] mx-auto">
                <input
                  ref={inputRef}
                  id="admin-secret-pin"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={10}
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
                  className="w-full text-center text-2xl font-mono tracking-[0.4em] py-3 px-4 rounded-xl bg-white border border-[#c5a059]/40 shadow-inner text-[#1b1c1a] focus:outline-none focus:border-[#775a19] focus:ring-2 focus:ring-[#c5a059]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f7667] hover:text-[#1b1c1a] p-1.5"
                  title={showPin ? 'Masquer' : 'Afficher'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs flex items-center justify-center gap-2 max-w-[280px] mx-auto text-center animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Virtual Numpad for mobile & convenience */}
            <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleNumpadClick(digit)}
                  className="h-11 rounded-xl bg-white hover:bg-[#f5efe4] border border-[#d1c5b4]/60 text-[#1b1c1a] font-semibold text-lg shadow-sm hover:border-[#c5a059] active:scale-95 transition-all"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="h-11 rounded-xl bg-[#f5f3ef] hover:bg-[#eae6de] text-[#605e5c] text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Effacer
              </button>
              <button
                type="button"
                onClick={() => handleNumpadClick('0')}
                className="h-11 rounded-xl bg-white hover:bg-[#f5efe4] border border-[#d1c5b4]/60 text-[#1b1c1a] font-semibold text-lg shadow-sm hover:border-[#c5a059] active:scale-95 transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-11 rounded-xl bg-[#f5f3ef] hover:bg-[#eae6de] text-[#605e5c] text-sm font-semibold flex items-center justify-center transition-all"
                aria-label="Effacer le dernier caractère"
              >
                ⌫
              </button>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="admin-submit-pin-btn"
                disabled={isVerifying || pin.length === 0}
                className="w-full py-3 px-4 bg-[#1b1c1a] hover:bg-[#775a19] disabled:opacity-50 text-[#ffdea5] hover:text-white rounded-xl text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isVerifying ? 'Vérification...' : 'Déverrouiller l\'accès'}</span>
              </button>
            </div>
          </form>

          {/* Hint regarding default PIN */}
          <div className="pt-2 border-t border-[#eae8e4] text-center">
            <p className="text-[11px] text-[#7f7667] flex items-center justify-center gap-1.5">
              <span>Code par défaut :</span>
              <button
                type="button"
                onClick={() => {
                  setPin('2026');
                  handleVerify('2026');
                }}
                className="font-mono font-bold text-[#775a19] underline hover:text-[#1b1c1a] cursor-pointer"
              >
                2026
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
