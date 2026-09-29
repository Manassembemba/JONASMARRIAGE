import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { RSVPData, WeddingDetails, ProgramEvent, VenueData } from '../types';
import {
  downloadInvitationPdf,
  shareInvitationPdfViaWhatsApp,
  generateGmailInvitationData,
  generateWhatsAppInvitationMessage,
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
  ShieldCheck,
  UserCheck,
  QrCode,
  Sparkles,
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);

  const passCode = guest
    ? `PASS-JF2026-${(guest.id || 'INV').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`
    : '';
  const seats = guest?.guests_count || 1;

  // Sync state when guest prop changes
  useEffect(() => {
    if (guest) {
      setGuestEmail(guest.email || '');
      setGuestPhone(guest.phone || '');

      const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mariage-jonas-flora.cd';
      const qrTargetUrl = `${appUrl}/#pass=${passCode}&guest=${encodeURIComponent(guest.full_name)}&seats=${seats}`;
      QRCode.toDataURL(qrTargetUrl, {
        margin: 1,
        width: 220,
        color: { dark: '#1b1c1a', light: '#ffffff' },
      })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [guest, passCode, seats]);

  if (!isOpen || !guest) return null;

  // Téléchargement du PDF officiel
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadInvitationPdf(
        { ...guest, phone: guestPhone || guest.phone, email: guestEmail || guest.email },
        details,
        programSteps,
        venues
      );
      setSaveSuccessMsg('Billet d\'invitation PDF avec QR Code officiel téléchargé avec succès.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Envoi WhatsApp avec le PDF en pièce jointe ou via lien direct
  const handleSendWhatsApp = async () => {
    setIsSharingWhatsApp(true);
    try {
      const guestToUse = { ...guest, phone: guestPhone || guest.phone, email: guestEmail || guest.email };
      const res = await shareInvitationPdfViaWhatsApp(guestToUse, details, programSteps, venues);

      if (res.method === 'native') {
        setSaveSuccessMsg('Fichier PDF attaché avec succès. Sélectionnez le contact WhatsApp.');
      } else {
        setSaveSuccessMsg('Billet PDF généré et téléchargé. Lien direct PDF transmis dans WhatsApp.');
      }
      setTimeout(() => setSaveSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Erreur partage WhatsApp:', err);
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  // Envoi Gmail direct
  const handleSendGmail = () => {
    const emailToUse = guestEmail || guest.email || '';
    const { gmailUrl, mailtoUrl } = generateGmailInvitationData(
      { ...guest, email: emailToUse },
      details
    );

    const newWindow = window.open(gmailUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
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

  const groomName = details.groom?.fullName || 'Madikani Mbidi Jonas';
  const brideName = details.bride?.fullName || 'Matelo Sanga Flora';
  const contactPhone = details.contactPhone || '0823965480';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fbf9f5] rounded-2xl shadow-2xl border border-[#c5a059]/40 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* En-tête de la modale */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#1b1c1a] to-[#2c271e] text-white border-b border-[#c5a059]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#ffdea5]" />
            </div>
            <div>
              <h3 className="font-editorial text-base sm:text-lg font-semibold tracking-wide text-[#ffdea5]">
                Billet d'Invitation & Pass Officiel
              </h3>
              <p className="text-[11px] text-[#e0ded8]">
                Format PDF haute résolution avec QR Code & Partage direct WhatsApp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps principal */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Notification toast */}
          {saveSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 shadow-xs animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{saveSuccessMsg}</span>
            </div>
          )}

          {/* APERÇU LUXUEUX DU BILLET D'INVITATION */}
          <div className="relative bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#c5a059] shadow-xl text-center overflow-hidden">
            {/* Double liseré décoratif intérieur */}
            <div className="absolute inset-2 border border-[#c5a059]/30 rounded-xl pointer-events-none" />

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
                <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                <div className="w-12 h-[1px] bg-[#c5a059]" />
              </div>
            </div>

            {/* Noms des Mariés (100% dynamiques) */}
            <div className="my-4">
              <p className="font-editorial text-xs italic text-[#605e5c] mb-1">
                Sous la bénédiction de Dieu et l'accord des deux familles
              </p>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#775a19] leading-tight tracking-wide">
                {groomName}
              </h3>
              <p className="font-editorial text-base italic text-[#c5a059] my-0.5">&</p>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#775a19] leading-tight tracking-wide">
                {brideName}
              </h3>
              <p className="font-editorial text-xs italic text-[#4e4639] mt-2">
                Ont l'immense honneur de convier à la célébration de leur union sacrée :
              </p>
            </div>

            {/* Cartouche Invité Privilégié avec QR Code */}
            <div className="my-5 p-4 sm:p-5 rounded-xl bg-[#fbf9f5] border border-[#c5a059]/50 shadow-2xs w-full max-w-lg mx-auto text-left flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#775a19] block mb-1">
                  INVITÉ(E) D'HONNEUR
                </span>
                <div className="font-editorial text-lg sm:text-xl font-bold text-[#1b1c1a] tracking-wide truncate">
                  {guest.full_name}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#775a19] mt-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#c5a059]/30">
                    {seats} place(s) réservée(s)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#c5a059]/30 font-mono text-[11px]">
                    {passCode}
                  </span>
                </div>
                {guest.guest_names && (
                  <p className="text-xs italic text-[#605e5c] mt-2">
                    Accompagnateur(s) : <span className="font-medium text-[#1b1c1a]">{guest.guest_names}</span>
                  </p>
                )}
              </div>

              {/* QR Code Scannable */}
              <div className="flex flex-col items-center shrink-0 p-2 bg-white rounded-lg border border-[#c5a059]/30 shadow-xs">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Pass"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                  />
                ) : (
                  <div className="w-20 h-20 bg-stone-100 flex items-center justify-center text-stone-400">
                    <QrCode className="w-8 h-8" />
                  </div>
                )}
                <span className="text-[9px] font-semibold text-[#775a19] mt-1 tracking-tight">
                  Pass Officiel
                </span>
              </div>
            </div>

            {/* Les 2 Célébrations officielles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4 text-left">
              {/* 1. Mariage Civil */}
              <div className="p-3.5 rounded-xl bg-white border border-[#c5a059]/30 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#775a19] uppercase tracking-wider mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>1. Mariage Civil</span>
                </div>
                <div className="text-xs font-bold text-[#1b1c1a]">{details.date1 || 'Jeudi 29 Octobre 2026'}</div>
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
              <div className="p-3.5 rounded-xl bg-white border border-[#c5a059]/30 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#775a19] uppercase tracking-wider mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>2. Mariage Coutumier</span>
                </div>
                <div className="text-xs font-bold text-[#1b1c1a]">{details.date2 || 'Samedi 31 Octobre 2026'}</div>
                <div className="flex items-center gap-1 text-[11px] text-[#775a19] font-medium my-0.5">
                  <Clock className="w-3 h-3" />
                  <span>15h00 — 19h45</span>
                </div>
                <div className="flex items-start gap-1 text-[11px] text-[#4e4639] mt-1">
                  <MapPin className="w-3 h-3 text-[#c5a059] shrink-0 mt-0.5" />
                  <span>Résidence Familiale — N'sele (Av. Bolia n°15, Arrêt 3 Paillote)</span>
                </div>
              </div>
            </div>

            {/* Consigne protocolaire & Contact WhatsApp */}
            <div className="pt-2 border-t border-[#c5a059]/20 text-[11px] text-[#605e5c] space-y-1">
              <div>Billet personnel à présenter à l'accueil • Tenue de ville soignée ou tenue traditionnelle exigée</div>
              <div className="text-[#775a19] font-medium">
                Orientation & Protocole WhatsApp : <strong>{contactPhone}</strong>
              </div>
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
                className="text-xs font-medium text-[#775a19] hover:underline cursor-pointer"
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
                    className="px-3 py-1.5 text-xs rounded-md border border-stone-300 text-stone-600 hover:bg-stone-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={isSavingContact}
                    onClick={handleSaveContact}
                    className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[#775a19] text-white hover:bg-[#604812] transition-colors cursor-pointer"
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
              Options de partage et téléchargement du Billet PDF
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Télécharger PDF */}
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleDownloadPdf}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-[#1b1c1a] to-[#3a352c] text-white hover:from-[#775a19] hover:to-[#917025] disabled:opacity-50 transition-all shadow-md group cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#ffdea5] group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="block text-xs font-bold">
                    {isGeneratingPdf ? 'Génération...' : 'Télécharger PDF'}
                  </span>
                  <span className="block text-[10px] text-[#e0ded8]">Avec QR Code officiel</span>
                </div>
              </button>

              {/* 2. Envoyer par WhatsApp (vrai partage PDF) */}
              <button
                type="button"
                disabled={isSharingWhatsApp}
                onClick={handleSendWhatsApp}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-all shadow-md group cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="block text-xs font-bold">
                    {isSharingWhatsApp ? 'Préparation du PDF...' : 'Partager PDF WhatsApp'}
                  </span>
                  <span className="block text-[10px] text-emerald-100">
                    Billet PDF + pass officiel
                  </span>
                </div>
              </button>

              {/* 3. Envoyer par Gmail */}
              <button
                type="button"
                onClick={handleSendGmail}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md group cursor-pointer"
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

            {/* Note informative protocolaire */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#605e5c]">
              <div className="flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Le PDF joint ou son lien direct contient le QR Code certifié pour le contrôle à l'accueil.</span>
              </div>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#eae8e4] hover:bg-[#d1c5b4] text-[#1b1c1a] font-medium transition-colors cursor-pointer"
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
