import React, { useState } from 'react';
import { RSVPData, WeddingDetails, ProgramEvent, VenueData } from '../types';
import {
  downloadInvitationPdf,
  formatPhoneForWhatsApp,
  generateWhatsAppInvitationMessage,
  generateGmailInvitationData,
} from '../utils/invitationPdf';
import {
  X,
  Download,
  Share2,
  Mail,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface InvitationCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: RSVPData | null;
  details: WeddingDetails;
  programSteps?: ProgramEvent[];
  venues?: VenueData[];
  onUpdateGuestEmail?: (guestId: string, email: string) => Promise<void>;
  onUpdateGuestPhone?: (guestId: string, phone: string) => Promise<void>;
}

export const InvitationCardModal: React.FC<InvitationCardModalProps> = ({
  isOpen,
  onClose,
  guest,
  details,
  programSteps,
  venues,
  onUpdateGuestEmail,
  onUpdateGuestPhone,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [guestEmail, setGuestEmail] = useState(guest?.email || '');
  const [guestPhone, setGuestPhone] = useState(guest?.phone || '');
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  if (!isOpen || !guest) return null;

  const passCode = `PASS-JF2026-${(guest.id || 'INV').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;
  const seats = guest.guests_count || 1;

  // Téléchargement du PDF officiel
  const handleDownloadPdf = () => {
    downloadInvitationPdf(guest, details, programSteps, venues);
  };

  // Envoi WhatsApp direct
  const handleSendWhatsApp = () => {
    const phoneToUse = guestPhone || guest.phone;
    const cleanPhone = formatPhoneForWhatsApp(phoneToUse);
    const message = generateWhatsAppInvitationMessage(
      { ...guest, phone: phoneToUse, email: guestEmail || guest.email },
      details
    );

    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
  };

  // Envoi Gmail direct
  const handleSendGmail = () => {
    const emailToUse = guestEmail || guest.email || '';
    const { gmailUrl, mailtoUrl } = generateGmailInvitationData(
      { ...guest, email: emailToUse },
      details
    );

    // Ouvre Gmail dans un nouvel onglet
    const newWindow = window.open(gmailUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Fallback si popup bloquée : mailto
      window.location.href = mailtoUrl;
    }
  };

  // Copier le texte complet d'invitation
  const handleCopyText = async () => {
    const message = generateWhatsAppInvitationMessage(
      { ...guest, phone: guestPhone || guest.phone, email: guestEmail || guest.email },
      details
    );
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Enregistrement des modifications de coordonnées
  const handleSaveContact = async () => {
    setIsSavingContact(true);
    try {
      if (onUpdateGuestEmail && guestEmail !== guest.email) {
        await onUpdateGuestEmail(guest.id, guestEmail.trim());
      }
      if (onUpdateGuestPhone && guestPhone !== guest.phone) {
        await onUpdateGuestPhone(guest.id, guestPhone.trim());
      }
      setSaveSuccessMsg('Coordonnées mises à jour avec succès.');
      setIsEditingContact(false);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingContact(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fbf9f5] rounded-2xl shadow-2xl border border-[#c5a059]/40 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* En-tête de la modale */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#1b1c1a] to-[#2c271e] text-white border-b border-[#c5a059]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#ffdea5]" />
            </div>
            <div>
              <h3 className="font-editorial text-base sm:text-lg font-semibold tracking-wide text-[#ffdea5]">
                Billet d'Invitation & Pass Officiel
              </h3>
              <p className="text-[11px] text-[#e0ded8]">
                Création automatique PDF et expédition WhatsApp / Gmail
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps principal */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Notification toast */}
          {saveSuccessMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* APERÇU LUXUEUX DU BILLET D'INVITATION */}
          <div className="relative bg-white rounded-xl p-6 sm:p-8 border-2 border-[#c5a059] shadow-lg shadow-[#c5a059]/5 text-center overflow-hidden">
            {/* Double liseré décoratif intérieur */}
            <div className="absolute inset-2 border border-[#c5a059]/30 rounded-lg pointer-events-none" />

            {/* En-tête officiel République */}
            <div className="mb-4">
              <span className="text-[9px] font-semibold tracking-[0.22em] text-[#775a19] uppercase block mb-1">
                RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • KINSHASA
              </span>
              <h4 className="font-editorial text-sm sm:text-base font-bold text-[#1b1c1a] tracking-wider uppercase">
                INVITATION OFFICIELLE & BILLET D'HONNEUR
              </h4>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <div className="w-12 h-[1px] bg-[#c5a059]" />
                <span className="text-[#c5a059] text-xs">❖</span>
                <div className="w-12 h-[1px] bg-[#c5a059]" />
              </div>
            </div>

            {/* Noms des Mariés */}
            <div className="my-4">
              <p className="font-editorial text-xs italic text-[#605e5c] mb-1">
                Sous la bénédiction de Dieu et l'accord des deux familles
              </p>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#775a19] leading-tight tracking-wide">
                Madikani Mbidi Jonas
              </h3>
              <p className="font-editorial text-base italic text-[#c5a059] my-0.5">&</p>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#775a19] leading-tight tracking-wide">
                Matelo Sanga Flora
              </h3>
              <p className="font-editorial text-xs italic text-[#4e4639] mt-2">
                Ont l'immense honneur de convier à la célébration de leur union sacrée :
              </p>
            </div>

            {/* Cartouche Invité Privilégié */}
            <div className="my-5 p-4 rounded-lg bg-[#fbf9f5] border border-[#c5a059]/50 shadow-2xs inline-block w-full max-w-lg mx-auto text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#775a19] block mb-1">
                INVITÉ(E) D'HONNEUR
              </span>
              <div className="font-editorial text-xl sm:text-2xl font-bold text-[#1b1c1a] tracking-wide">
                {guest.full_name}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-[#775a19] mt-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#c5a059]/30">
                  {seats} place(s) réservée(s)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#c5a059]/30 font-mono">
                  {passCode}
                </span>
              </div>
              {guest.guest_names && (
                <p className="text-xs italic text-[#605e5c] mt-2">
                  Accompagnateur(s) : <span className="font-medium text-[#1b1c1a]">{guest.guest_names}</span>
                </p>
              )}
            </div>

            {/* Les 2 Célébrations officielles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4 text-left">
              {/* 1. Mariage Civil */}
              <div className="p-3.5 rounded-lg bg-white border border-[#c5a059]/30 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#775a19] uppercase tracking-wider mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>1. Mariage Civil</span>
                </div>
                <div className="text-xs font-bold text-[#1b1c1a]">Jeudi 29 Octobre 2026</div>
                <div className="flex items-center gap-1 text-[11px] text-[#775a19] font-medium my-0.5">
                  <Clock className="w-3 h-3" />
                  <span>11h00 (Accueil dès 10h30)</span>
                </div>
                <div className="flex items-start gap-1 text-[11px] text-[#4e4639] mt-1">
                  <MapPin className="w-3 h-3 text-[#c5a059] shrink-0 mt-0.5" />
                  <span>Maison Communale de Lemba (Av. Kadjeke n° 1 Bis)</span>
                </div>
              </div>

              {/* 2. Mariage Coutumier */}
              <div className="p-3.5 rounded-lg bg-white border border-[#c5a059]/30 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#775a19] uppercase tracking-wider mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>2. Mariage Coutumier</span>
                </div>
                <div className="text-xs font-bold text-[#1b1c1a]">Samedi 31 Octobre 2026</div>
                <div className="flex items-center gap-1 text-[11px] text-[#775a19] font-medium my-0.5">
                  <Clock className="w-3 h-3" />
                  <span>15h00 — 19h45</span>
                </div>
                <div className="flex items-start gap-1 text-[11px] text-[#4e4639] mt-1">
                  <MapPin className="w-3 h-3 text-[#c5a059] shrink-0 mt-0.5" />
                  <span>Résidence Familiale — N'sele (Av. Bolia n°15, Mpasa 1)</span>
                </div>
              </div>
            </div>

            {/* Consigne protocolaire */}
            <div className="pt-2 border-t border-[#c5a059]/20 text-[11px] text-[#605e5c] italic">
              Billet personnel à présenter à l'accueil • Tenue de ville soignée ou tenue traditionnelle exigée
            </div>
          </div>

          {/* COORDONNÉES DE L'INVITÉ POUR L'EXPÉDITION */}
          <div className="p-4 rounded-xl bg-white border border-[#c5a059]/20 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1b1c1a] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#775a19]" />
                Coordonnées d'expédition de l'invité
              </span>
              <button
                type="button"
                onClick={() => setIsEditingContact(!isEditingContact)}
                className="text-xs font-medium text-[#775a19] hover:underline"
              >
                {isEditingContact ? 'Fermer' : 'Modifier les coordonnées'}
              </button>
            </div>

            {!isEditingContact ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#4e4639]">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#fbf9f5] border border-[#c5a059]/20">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#775a19] uppercase font-bold block">Numéro WhatsApp</span>
                    <span className="font-semibold text-[#1b1c1a]">
                      {guestPhone || guest.phone || 'Non renseigné'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#fbf9f5] border border-[#c5a059]/20">
                  <Mail className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#775a19] uppercase font-bold block">Adresse Gmail / Email</span>
                    <span className="font-semibold text-[#1b1c1a]">
                      {guestEmail || guest.email || 'Non renseigné'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] mb-1">
                      Numéro WhatsApp
                    </label>
                    <input
                      type="text"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+243 81 234 5678"
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/40 focus:border-[#775a19] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] mb-1">
                      Adresse Gmail / Email
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="invite@gmail.com"
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/40 focus:border-[#775a19] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingContact(false)}
                    className="px-3 py-1.5 text-xs rounded-md border border-stone-300 text-stone-600 hover:bg-stone-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={isSavingContact}
                    onClick={handleSaveContact}
                    className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[#775a19] text-white hover:bg-[#604812] transition-colors"
                  >
                    {isSavingContact ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS D'EXPÉDITION & TÉLÉCHARGEMENT */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#1b1c1a] flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-[#775a19]" />
              Options d'envoi et de génération automatique
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Télécharger PDF */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-[#1b1c1a] to-[#3a352c] text-white hover:from-[#775a19] hover:to-[#917025] transition-all shadow-md group"
              >
                <Download className="w-4 h-4 text-[#ffdea5] group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="block text-xs font-bold">Télécharger PDF</span>
                  <span className="block text-[10px] text-[#e0ded8]">Billet officiel haute rés.</span>
                </div>
              </button>

              {/* 2. Envoyer par WhatsApp */}
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md group"
              >
                <MessageCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="block text-xs font-bold">Envoyer WhatsApp</span>
                  <span className="block text-[10px] text-emerald-100">Direct vers {guestPhone || guest.phone}</span>
                </div>
              </button>

              {/* 3. Envoyer par Gmail */}
              <button
                type="button"
                onClick={handleSendGmail}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md group"
              >
                <Mail className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="block text-xs font-bold">Envoyer par Gmail</span>
                  <span className="block text-[10px] text-rose-100">
                    {guestEmail || guest.email ? 'Objet et message préremplis' : 'Ouvrir Gmail'}
                  </span>
                </div>
              </button>
            </div>

            {/* Bouton secondaire de copie du texte formaté */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#605e5c]">
              <div className="flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#775a19]" />
                <span>Billet sécurisé avec signature protocolaire officielle</span>
              </div>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#eae8e4] hover:bg-[#d1c5b4] text-[#1b1c1a] font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Texte copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#775a19]" />
                    <span>Copier le texte d'invitation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
