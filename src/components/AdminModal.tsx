import React, { useState, useEffect } from 'react';
import { useWeddingData } from '../context/WeddingDataContext';
import { RSVPData, GuestbookMessage, ProgramEvent, VenueData, TimelineMilestone } from '../types';
import {
  X,
  Search,
  Download,
  Trash2,
  Edit2,
  Users,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  MessageSquare,
  Check,
  Plus,
  Calendar,
  MapPin,
  Heart,
  FileText,
  Database,
  Archive,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Sparkles,
  Type,
  Lock,
  KeyRound,
  Bell,
  CheckCheck,
  Eye,
  EyeOff,
  MailCheck,
  Mail,
  ShieldAlert,
  MessageCircle,
  Upload,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { SensitiveDataLock } from './SensitiveDataLock';
import { InvitationCardModal } from './InvitationCardModal';
import { AdminPhotosManager } from './AdminPhotosManager';
import { uploadPhotoToServer } from '../utils/imageUpload';
import {
  downloadInvitationPdf,
  formatPhoneForWhatsApp,
  generateWhatsAppInvitationMessage,
  generateGmailInvitationData,
} from '../utils/invitationPdf';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  rsvps?: RSVPData[];
  guestbook?: GuestbookMessage[];
  onUpdateRsvp?: (updated: RSVPData) => void;
  onDeleteRsvp?: (id: string) => void;
  onAddRsvp?: (newRsvp: RSVPData) => void;
  onToggleGuestbookApproval?: (id: string) => void;
  onDeleteGuestbookMessage?: (id: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  initialTab,
}) => {
  const {
    details,
    programSteps,
    venues,
    storyMilestones,
    galleryItems,
    rsvps,
    guestbook,
    dbStatus,
    isSaving,
    unreadRsvpsCount,
    unreadGuestbookCount,
    unreadTotalCount,
    isAdminUnlocked,
    setIsAdminUnlocked,
    markRsvpAsRead,
    markGuestbookAsRead,
    markAllAsRead,
    changeAdminPin,
    logoutAdmin,
    updateDetails,
    updateProgramSteps,
    updateVenues,
    updateStoryMilestones,
    updateGalleryItems,
    addRsvp,
    updateRsvp,
    deleteRsvp,
    toggleGuestbookApproval,
    deleteGuestbook,
    resetToDefaults,
  } = useWeddingData();

  const [activeTab, setActiveTab] = useState<'guests' | 'dates' | 'venues' | 'presentation' | 'couple' | 'program' | 'photos' | 'guestbook' | 'security' | 'database'>('guests');
  const [searchQuery, setSearchQuery] = useState('');
  const [presenceFilter, setPresenceFilter] = useState<'all' | 'oui' | 'non'>('all');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Security / PIN change state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [pinChangeSuccess, setPinChangeSuccess] = useState<string | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [showPinFields, setShowPinFields] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab as any);
    }
  }, [isOpen, initialTab]);

  // Edit Guest Modal state
  const [editingGuest, setEditingGuest] = useState<RSVPData | null>(null);
  const [isNewGuestModalOpen, setIsNewGuestModalOpen] = useState(false);
  const [invitationGuest, setInvitationGuest] = useState<RSVPData | null>(null);

  // Mettre à jour l'email d'un invité depuis la modale d'invitation
  const handleUpdateGuestEmail = async (guestId: string, email: string) => {
    const target = rsvps.find((r) => r.id === guestId);
    if (target) {
      await updateRsvp({ ...target, email });
      showNotification('Adresse email enregistrée.');
    }
  };

  // Mettre à jour le téléphone d'un invité depuis la modale d'invitation
  const handleUpdateGuestPhone = async (guestId: string, phone: string) => {
    const target = rsvps.find((r) => r.id === guestId);
    if (target) {
      await updateRsvp({ ...target, phone });
      showNotification('Numéro de téléphone enregistré.');
    }
  };

  // Télécharger en lot les billets PDF de tous les invités confirmés
  const handleDownloadAllConfirmedPdfs = async () => {
    const confirmed = rsvps.filter((r) => r.attendance === 'oui');
    if (confirmed.length === 0) {
      showNotification('Aucun invité confirmé pour le moment.');
      return;
    }
    showNotification(`Téléchargement de ${confirmed.length} billet(s) d'invitation PDF en cours...`);
    for (let i = 0; i < confirmed.length; i++) {
      downloadInvitationPdf(confirmed[i], details, programSteps, venues);
      if (i < confirmed.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
  };

  // New guest manual entry form state
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('+243 ');
  const [newAttendance, setNewAttendance] = useState<'oui' | 'non'>('oui');
  const [newGuestsCount, setNewGuestsCount] = useState(1);
  const [newGuestNames, setNewGuestNames] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Local state for Dates & Horaires tab
  const [datesForm, setDatesForm] = useState({
    dateString: details.dateString || '29 & 31 octobre 2026',
    dateFormatted: details.dateFormatted || '29 & 31 Octobre 2026',
    date1: details.date1 || 'Jeudi 29 Octobre 2026',
    date2: details.date2 || 'Samedi 31 Octobre 2026',
    targetDateTime: details.targetDateTime || '2026-10-29T11:00:00+01:00',
    cityCountry: details.cityCountry || 'KINSHASA, RDC',
  });

  // Local state for Venues & Adresses tab
  const [venuesForm, setVenuesForm] = useState<VenueData[]>(venues);

  // Local state for Presentation texts tab
  const [presentationForm, setPresentationForm] = useState({
    heroBadge: details.heroBadge || 'Célébration Nuptiale Privée',
    announcementText: details.announcementText || 'Nous avons le bonheur de vous annoncer notre mariage',
    heroTagline: details.heroTagline || "Deux âmes réunies pour l'éternité",
    centerQuote: details.centerQuote || 'Deux cœurs, une promesse, une nouvelle histoire à écrire ensemble.',
    centerSubtitle: details.centerSubtitle || 'Pour le Meilleur et pour Toujours',
    storyIntroTitle: details.storyIntroTitle || 'Notre Histoire',
    storyIntroText: details.storyIntroText || "D'une rencontre fortuite à l'évidence d'une vie entière à bâtir ensemble.",
    programSubtitle: details.programSubtitle || "Découvrez le déroulement chronologique de cette journée mémorable consacrée à l'amour, à la loi et aux traditions ancestrales.",
    emotionalQuote1: details.emotionalQuote1 || '« Une nouvelle aventure commence...',
    emotionalQuote2: details.emotionalQuote2 || 'Et nous aimerions la partager avec vous. »',
    footerMessage: details.footerMessage || "Merci de partager avec nous ce moment unique, prélude d'une éternelle célébration de notre amour.",
    coupleHeroPhoto: details.coupleHeroPhoto || '/assets/couple_photo.jpg',
  });

  // Local state for Story milestones chapters
  const [storyForm, setStoryForm] = useState<TimelineMilestone[]>(storyMilestones);

  // Local state for Couple tab
  const [coupleForm, setCoupleForm] = useState({
    groom: { ...details.groom },
    bride: { ...details.bride },
  });

  // Local state for Program tab
  const [programForm, setProgramForm] = useState<ProgramEvent[]>(programSteps);

  // Confirmation modal for resetting defaults
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // In-app deletion confirmation dialog state (replaces window.confirm)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const openDeleteModal = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>
  ) => {
    setDeleteConfirm({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  // Sync forms whenever context data updates
  useEffect(() => {
    setDatesForm({
      dateString: details.dateString ?? '29 & 31 octobre 2026',
      dateFormatted: details.dateFormatted ?? '29 & 31 Octobre 2026',
      date1: details.date1 ?? 'Jeudi 29 Octobre 2026',
      date2: details.date2 ?? 'Samedi 31 Octobre 2026',
      targetDateTime: details.targetDateTime ?? '2026-10-29T11:00:00+01:00',
      cityCountry: details.cityCountry ?? 'KINSHASA, RDC',
    });
    setVenuesForm(venues);
    setPresentationForm({
      heroBadge: details.heroBadge ?? 'Célébration Nuptiale Privée',
      announcementText: details.announcementText ?? 'Nous avons le bonheur de vous annoncer notre mariage',
      heroTagline: details.heroTagline ?? "Deux âmes réunies pour l'éternité",
      centerQuote: details.centerQuote ?? 'Deux cœurs, une promesse, une nouvelle histoire à écrire ensemble.',
      centerSubtitle: details.centerSubtitle ?? 'Pour le Meilleur et pour Toujours',
      storyIntroTitle: details.storyIntroTitle ?? 'Notre Histoire',
      storyIntroText: details.storyIntroText ?? "D'une rencontre fortuite à l'évidence d'une vie entière à bâtir ensemble.",
      programSubtitle: details.programSubtitle ?? "Découvrez le déroulement chronologique de cette journée mémorable consacrée à l'amour, à la loi et aux traditions ancestrales.",
      emotionalQuote1: details.emotionalQuote1 ?? '« Une nouvelle aventure commence...',
      emotionalQuote2: details.emotionalQuote2 ?? 'Et nous aimerions la partager avec vous. »',
      footerMessage: details.footerMessage ?? "Merci de partager avec nous ce moment unique, prélude d'une éternelle célébration de notre amour.",
      coupleHeroPhoto: details.coupleHeroPhoto ?? '/assets/couple_photo.jpg',
    });
    setStoryForm(storyMilestones);
    setCoupleForm({
      groom: { ...details.groom },
      bride: { ...details.bride },
    });
    setProgramForm(programSteps);
  }, [details, venues, programSteps, storyMilestones]);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Helper pour chargement de photos locales avec compression et persistance disque
  const handleFileUpload = async (file: File, onDone: (resultUrl: string) => void) => {
    if (!file) return;
    showNotification("Téléversement et enregistrement de la photo sur le serveur...");
    try {
      const persistentUrl = await uploadPhotoToServer(file, 'modal_photo');
      onDone(persistentUrl);
      showNotification("Photo prête et téléversée ! Cliquez sur Enregistrer pour valider.");
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de l'enregistrement de l'image.");
    }
  };

  if (!isOpen) return null;

  // Compute metrics
  const totalRsvps = rsvps.length;
  const presentCount = rsvps.filter((r) => r.attendance === 'oui').length;
  const absentCount = rsvps.filter((r) => r.attendance === 'non').length;
  const totalHeadcount = rsvps
    .filter((r) => r.attendance === 'oui')
    .reduce((sum, r) => sum + (Number(r.guests_count) || 1), 0);

  // Filtered RSVP list
  const filteredRsvps = rsvps.filter((r) => {
    const matchesSearch =
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.guest_names && r.guest_names.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      presenceFilter === 'all' ? true : r.attendance === presenceFilter;

    return matchesSearch && matchesFilter;
  });

  // Export to CSV format
  const exportToCSV = () => {
    const headers = ['Nom', 'Téléphone', 'Email', 'Présence', 'Nombre de personnes', 'Accompagnants', 'Message', 'Date'];
    const rows = rsvps.map((r) => [
      `"${r.full_name.replace(/"/g, '""')}"`,
      `"${r.phone.replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${r.attendance === 'oui' ? 'Oui' : 'Non'}"`,
      `"${r.attendance === 'oui' ? r.guests_count : 0}"`,
      `"${(r.guest_names || '').replace(/"/g, '""')}"`,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      `"${new Date(r.created_at).toLocaleDateString('fr-FR')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Liste_Invites_Mariage_Jonas_Flora_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export full JSON Backup
  const exportFullBackupJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      details,
      programSteps,
      venues,
      rsvps,
      guestbook,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sauvegarde_Mariage_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // RSVP actions
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;
    updateRsvp(editingGuest);
    setEditingGuest(null);
    showNotification('Invité mis à jour avec succès.');
  };

  const handleCreateNewGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    const guest: RSVPData = {
      id: 'rsvp-manual-' + Date.now(),
      full_name: newFullName.trim(),
      phone: newPhone.trim(),
      attendance: newAttendance,
      guests_count: newAttendance === 'oui' ? Number(newGuestsCount) : 0,
      guest_names: newGuestNames.trim(),
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

    addRsvp(guest);
    setIsNewGuestModalOpen(false);
    setNewFullName('');
    setNewPhone('+243 ');
    setNewAttendance('oui');
    setNewGuestsCount(1);
    setNewGuestNames('');
    setNewMessage('');
    showNotification('Nouvel invité enregistré avec succès.');
  };

  // Save Dates & Settings
  const handleSaveDates = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateDetails(datesForm);
    if (ok) {
      showNotification('Dates et horaires enregistrés avec succès.');
    }
  };

  // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
  const getDatetimeLocalValue = (isoString: string) => {
    try {
      if (!isoString) return '2026-10-29T11:00';
      const clean = isoString.split('+')[0].split('Z')[0];
      return clean.slice(0, 16);
    } catch {
      return '2026-10-29T11:00';
    }
  };

  const handleDateTimeLocalChange = (localVal: string) => {
    if (!localVal) return;
    // Append Kinshasa timezone offset (+01:00)
    const isoWithTz = `${localVal}:00+01:00`;
    setDatesForm((prev) => ({ ...prev, targetDateTime: isoWithTz }));
  };

  // Save Venues & Addresses
  const handleSaveVenues = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateVenues(venuesForm);
    if (ok) {
      showNotification('Adresses et lieux enregistrés avec succès.');
    }
  };

  const handleVenueChange = (index: number, field: keyof VenueData, value: string) => {
    const updated = [...venuesForm];
    updated[index] = { ...updated[index], [field]: value };
    setVenuesForm(updated);
  };

  const handleAddVenue = () => {
    const newVenue: VenueData = {
      id: 'venue-' + Date.now(),
      name: 'Nouveau lieu de cérémonie',
      ceremony: 'Cérémonie & Réception',
      time: '12h00',
      address: 'Kinshasa, RDC',
      landmarks: 'Repères d\'accès',
      mapUrl: 'https://maps.google.com/?q=Kinshasa',
      badge: `Étape ${venuesForm.length + 1}`,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxe-SXv_fEG3Avy-LSg6eWU7U0c9foXio-8VQfHr686MibmmPLdBhImHnFqoOGDbtNNg4pJphBOOMrRghPKXU2vjELMU3yJiTZb4c7R44RQd_FTaZjfgCsHy1qMrr2VKfeZeYsOdYi-nHCFzjPCYxDmzn-RRdzvfoUXnpFG-ZP8doJzQLhRggqPAMB-Q9ihnZJ6BL1JruUim1sMI9lY8VA33qtpkXCGnrLTT-gzIfWdFeJCnNcMgqg',
    };
    setVenuesForm([...venuesForm, newVenue]);
    showNotification('Nouveau lieu ajouté au formulaire.');
  };

  const handleDeleteVenue = (index: number) => {
    if (venuesForm.length <= 1) {
      showNotification('Il doit subsister au moins un lieu de célébration.');
      return;
    }
    const venue = venuesForm[index];
    openDeleteModal(
      'Supprimer ce lieu de célébration ?',
      `Êtes-vous sûr de vouloir retirer « ${venue.name || venue.ceremony || 'ce lieu'} » ?`,
      async () => {
        const updated = venuesForm.filter((_, i) => i !== index);
        setVenuesForm(updated);
        await updateVenues(updated);
        showNotification('Lieu supprimé avec succès.');
      }
    );
  };

  // Save Presentation Texts and Story Chapters
  const handleSavePresentation = async (e: React.FormEvent) => {
    e.preventDefault();
    const okDetails = await updateDetails({
      heroBadge: presentationForm.heroBadge,
      announcementText: presentationForm.announcementText,
      heroTagline: presentationForm.heroTagline,
      centerQuote: presentationForm.centerQuote,
      centerSubtitle: presentationForm.centerSubtitle,
      storyIntroTitle: presentationForm.storyIntroTitle,
      storyIntroText: presentationForm.storyIntroText,
      programSubtitle: presentationForm.programSubtitle,
      emotionalQuote1: presentationForm.emotionalQuote1,
      emotionalQuote2: presentationForm.emotionalQuote2,
      footerMessage: presentationForm.footerMessage,
      coupleHeroPhoto: presentationForm.coupleHeroPhoto,
    });
    const okStory = await updateStoryMilestones(storyForm);
    if (okDetails && okStory) {
      showNotification('Textes de présentation et récits enregistrés avec succès.');
    }
  };

  const handleMilestoneChange = (index: number, field: keyof TimelineMilestone, value: string) => {
    const updated = [...storyForm];
    updated[index] = { ...updated[index], [field]: value };
    setStoryForm(updated);
  };

  const handleAddMilestone = () => {
    const newMilestone: TimelineMilestone = {
      title: 'Nouveau Chapitre',
      subtitle: `Chapitre ${storyForm.length + 1} — Récit`,
      description: 'Racontez ici ce moment marquant de votre relation...',
      icon: '✦',
    };
    setStoryForm([...storyForm, newMilestone]);
  };

  const handleDeleteMilestone = (index: number) => {
    if (storyForm.length <= 1) {
      showNotification('Il doit subsister au moins un chapitre d\'histoire.');
      return;
    }
    const milestone = storyForm[index];
    openDeleteModal(
      'Supprimer ce chapitre de l\'histoire ?',
      `Êtes-vous sûr de vouloir retirer le chapitre « ${milestone.title || 'ce chapitre'} » ?`,
      async () => {
        const updated = storyForm.filter((_, i) => i !== index);
        setStoryForm(updated);
        await updateStoryMilestones(updated);
        showNotification('Chapitre supprimé avec succès.');
      }
    );
  };

  // Save Couple profiles
  const handleSaveCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateDetails({
      groom: coupleForm.groom,
      bride: coupleForm.bride,
    });
    if (ok) {
      showNotification('Informations des mariés enregistrées avec succès.');
    }
  };

  // Save Program
  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateProgramSteps(programForm);
    if (ok) {
      showNotification('Programme officiel mis à jour avec succès.');
    }
  };

  const handleProgramChange = (index: number, field: keyof ProgramEvent, value: string) => {
    const updated = [...programForm];
    updated[index] = { ...updated[index], [field]: value };
    setProgramForm(updated);
  };

  const handleAddProgramStep = () => {
    const newStep: ProgramEvent = {
      time: '20H00',
      title: 'Étape additionnelle',
      type: 'Célébration & Réception',
      location: 'Lieu de fête',
      address: 'Kinshasa, RDC',
      landmarks: 'Accueil des convives',
      badge: `③ ÉTAPE ${programForm.length + 1}`,
      mapUrl: 'https://maps.google.com/?q=Kinshasa',
      icon: 'civile',
    };
    setProgramForm([...programForm, newStep]);
    showNotification('Nouvelle étape ajoutée au programme.');
  };

  const handleDeleteProgramStep = (index: number) => {
    if (programForm.length <= 1) {
      showNotification('Il doit subsister au moins une étape dans le programme.');
      return;
    }
    const step = programForm[index];
    openDeleteModal(
      'Supprimer cette étape du programme ?',
      `Êtes-vous sûr de vouloir retirer l'étape « ${step.title || 'cette étape'} » (${step.time}) du programme ?`,
      async () => {
        const updated = programForm.filter((_, i) => i !== index);
        setProgramForm(updated);
        await updateProgramSteps(updated);
        showNotification('Étape du programme supprimée avec succès.');
      }
    );
  };

  // Reset database handler
  const handleResetConfirm = async () => {
    const ok = await resetToDefaults();
    setShowResetConfirm(false);
    if (ok) {
      showNotification('Données réinitialisées aux valeurs de référence.');
    }
  };

  // Change PIN handler
  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    setPinChangeSuccess(null);

    if (!currentPinInput.trim()) {
      setPinChangeError('Veuillez saisir votre code d\'accès actuel.');
      return;
    }
    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      setPinChangeError('Le nouveau code doit comporter au moins 4 caractères.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinChangeError('La confirmation ne correspond pas au nouveau code.');
      return;
    }

    setIsChangingPin(true);
    try {
      const res = await changeAdminPin(currentPinInput.trim(), newPinInput.trim());
      if (res.success) {
        setPinChangeSuccess('Votre code d\'accès administrateur a été modifié avec succès.');
        setCurrentPinInput('');
        setNewPinInput('');
        setConfirmPinInput('');
      } else {
        setPinChangeError(res.message || 'Le code d\'accès actuel est incorrect.');
      }
    } catch {
      setPinChangeError('Erreur lors de la modification du code PIN.');
    } finally {
      setIsChangingPin(false);
    }
  };

  const handleLockAdmin = () => {
    logoutAdmin();
    showNotification('Données sensibles verrouillées avec succès.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#fbf9f5] rounded-xl shadow-2xl border border-[#c5a059]/30 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header with Security status & Lock Button */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[#1b1c1a] text-white border-b border-[#c5a059]/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#775a19] flex items-center justify-center text-[#fbf9f5]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-lg sm:text-xl text-white font-semibold leading-tight">
                  Administration — Mariage Jonas & Flora
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#775a19]/40 text-[#ffdea5] border border-[#c5a059]/30">
                  <ShieldCheck className="w-3 h-3 text-[#ffdea5]" />
                  Espace Sécurisé
                </span>
                {unreadTotalCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c5a059] text-white animate-pulse">
                    <Bell className="w-2.5 h-2.5" />
                    {unreadTotalCount} non lu{unreadTotalCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#c5a059]">
                Gestion centrale et sécurisée du mariage • Jonas & Flora 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLockAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                isAdminUnlocked
                  ? 'text-[#ffdea5] hover:text-white bg-white/10 hover:bg-white/20 border-[#c5a059]/40'
                  : 'text-amber-200 bg-amber-900/30 border-amber-500/30 hover:bg-amber-900/50'
              }`}
              title={
                isAdminUnlocked
                  ? "Verrouiller immédiatement l'accès aux données sensibles (RSVP et Livre d'or)"
                  : "Données sensibles actuellement verrouillées par code PIN"
              }
            >
              <Lock className="w-3.5 h-3.5 text-[#ffdea5]" />
              <span className="hidden sm:inline">
                {isAdminUnlocked ? 'Verrouiller les données' : 'Données verrouillées'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#c5a059] hover:text-white hover:bg-white/10 transition-colors"
              title="Fermer sans déconnecter"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white text-xs sm:text-sm font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-[#c5a059]/15 bg-[#f5f3ef] overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('guests')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'guests'
                ? 'border-[#775a19] text-[#775a19] font-semibold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-[#605e5c] hover:text-[#1b1c1a]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Invités & RSVP ({rsvps.length})</span>
            {!isAdminUnlocked ? (
              <span className="p-0.5 rounded bg-amber-100 text-amber-800" title="Protégé par code PIN">
                <Lock className="w-3 h-3" />
              </span>
            ) : (
              <span className="p-0.5 rounded bg-emerald-100 text-emerald-700" title="Données déverrouillées">
                <ShieldCheck className="w-3 h-3" />
              </span>
            )}
            {unreadRsvpsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#c5a059] text-white text-[10px] font-bold">
                {unreadRsvpsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dates')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'dates'
                ? 'border-[#775a19] text-[#775a19] font-semibold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-[#605e5c] hover:text-[#1b1c1a]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Dates & Horaires</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('venues')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'venues'
                ? 'border-[#775a19] text-[#775a19] font-semibold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-[#605e5c] hover:text-[#1b1c1a]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Adresses & Lieux</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presentation')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'presentation'
                ? 'border-[#775a19] text-[#775a19] font-semibold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-[#605e5c] hover:text-[#1b1c1a]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Textes de Présentation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('couple')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'couple'
                ? 'border-[#775a19] text-[#775a19] font-semibold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-[#605e5c] hover:text-[#1b1c1a]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Les Mariés</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('program')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'program'
                ? 'border-[#775a19] text-[#775a19] font-semibold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-[#605e5c] hover:text-[#1b1c1a]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Programme</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'photos'
                ? 'border-[#775a19] text-[#775a19] font-semibold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-[#605e5c] hover:text-[#1b1c1a]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Gestion des Photos ({galleryItems.length + 3})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guestbook')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'guestbook'
                ? 'border-[#775a19] text-[#775a19] font-semibold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-[#605e5c] hover:text-[#1b1c1a]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Livre d'or ({guestbook.length})</span>
            {!isAdminUnlocked ? (
              <span className="p-0.5 rounded bg-amber-100 text-amber-800" title="Protégé par code PIN">
                <Lock className="w-3 h-3" />
              </span>
            ) : (
              <span className="p-0.5 rounded bg-emerald-100 text-emerald-700" title="Données déverrouillées">
                <ShieldCheck className="w-3 h-3" />
              </span>
            )}
            {unreadGuestbookCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#c5a059] text-white text-[10px] font-bold">
                {unreadGuestbookCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-[#775a19] text-[#775a19] font-semibold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-[#605e5c] hover:text-[#1b1c1a]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Sécurité & PIN</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'database'
                ? 'border-[#775a19] text-[#775a19] font-semibold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-[#605e5c] hover:text-[#1b1c1a]'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Sauvegarde & Archives</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: GUESTS & RSVP */}
          {activeTab === 'guests' && (
            !isAdminUnlocked ? (
              <SensitiveDataLock
                sectionType="guests"
                onUnlocked={() => {
                  setIsAdminUnlocked(true);
                  showNotification('Accès aux réponses RSVP et aux coordonnées déverrouillé.');
                }}
              />
            ) : (
            <div className="space-y-6">
              {/* Security Unlocked Banner with Quick Re-Lock */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">Données personnelles et RSVP déverrouillées</span>
                  <span className="hidden md:inline text-emerald-700/80">• Session protégée par code PIN</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logoutAdmin();
                    showNotification('Les données sensibles ont été reverrouillées.');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-rose-50 text-[#775a19] hover:text-rose-700 border border-[#c5a059]/30 text-xs font-semibold transition-colors shadow-2xs"
                  title="Verrouiller à nouveau l'accès aux données sensibles"
                >
                  <Lock className="w-3 h-3 text-[#775a19]" />
                  <span>Verrouiller l'accès</span>
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#c5a059]/20 shadow-2xs">
                  <div className="flex items-center justify-between text-[#605e5c] mb-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Réponses</span>
                    <Users className="w-4 h-4 text-[#775a19]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-[#1b1c1a]">{totalRsvps}</div>
                  <span className="text-[10px] text-[#605e5c]">Total des confirmations</span>
                </div>

                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-500/20 shadow-2xs">
                  <div className="flex items-center justify-between text-emerald-800 mb-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Présents</span>
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-700">{presentCount}</div>
                  <span className="text-[10px] text-emerald-600">Invitations confirmées</span>
                </div>

                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#775a19]/25 shadow-2xs">
                  <div className="flex items-center justify-between text-[#775a19] mb-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Personnes</span>
                    <Clock className="w-4 h-4 text-[#775a19]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-[#775a19]">{totalHeadcount}</div>
                  <span className="text-[10px] text-[#605e5c]">Couverts / places prévues</span>
                </div>

                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-rose-400/20 shadow-2xs">
                  <div className="flex items-center justify-between text-rose-800 mb-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Absents</span>
                    <UserX className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-rose-700">{absentCount}</div>
                  <span className="text-[10px] text-rose-600">Avec regrets</span>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#c5a059]/20 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#605e5c]" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, téléphone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-[#f5f3ef] p-1 rounded-md border border-[#c5a059]/20 text-xs">
                    <button
                      type="button"
                      onClick={() => setPresenceFilter('all')}
                      className={`px-2 py-1 rounded transition-colors ${
                        presenceFilter === 'all' ? 'bg-white text-[#775a19] font-bold shadow-2xs' : 'text-[#605e5c]'
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresenceFilter('oui')}
                      className={`px-2 py-1 rounded transition-colors ${
                        presenceFilter === 'oui' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-700'
                      }`}
                    >
                      Présents
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresenceFilter('non')}
                      className={`px-2 py-1 rounded transition-colors ${
                        presenceFilter === 'non' ? 'bg-rose-600 text-white font-bold' : 'text-rose-700'
                      }`}
                    >
                      Absents
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unreadRsvpsCount > 0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        await markAllAsRead();
                        showNotification('Tous les RSVP ont été marqués comme lus.');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#c5a059]/15 hover:bg-[#c5a059]/25 text-[#775a19] text-xs font-semibold transition-colors shadow-2xs"
                      title="Marquer tous les RSVP comme lus"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tout lire ({unreadRsvpsCount})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsNewGuestModalOpen(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un invité</span>
                  </button>
                  <button
                    type="button"
                    onClick={exportToCSV}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-white hover:bg-[#f5f3ef] text-[#1b1c1a] border border-[#c5a059]/30 text-xs font-medium transition-colors shadow-2xs"
                    title="Télécharger la liste complète au format CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-[#775a19]" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadAllConfirmedPdfs}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#775a19] border border-[#c5a059]/40 text-xs font-semibold transition-colors shadow-2xs"
                    title="Télécharger automatiquement les billets d'invitation PDF de tous les invités confirmés"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#775a19]" />
                    <span className="hidden sm:inline">Billets PDF (Tous)</span>
                  </button>
                </div>
              </div>

              {/* Table of Guests */}
              <div className="bg-white rounded-xl border border-[#c5a059]/20 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f5f3ef] text-[#605e5c] uppercase text-[10px] tracking-wider border-b border-[#c5a059]/15">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Invité</th>
                        <th className="py-3 px-4 font-semibold">Statut</th>
                        <th className="py-3 px-4 font-semibold">Personnes</th>
                        <th className="py-3 px-4 font-semibold">Accompagnants & Note</th>
                        <th className="py-3 px-4 font-semibold">Date</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c5a059]/10">
                      {filteredRsvps.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#605e5c] italic">
                            Aucun invité ne correspond aux critères de recherche.
                          </td>
                        </tr>
                      ) : (
                        filteredRsvps.map((guest) => (
                          <tr
                            key={guest.id}
                            className={`transition-colors ${
                              guest.is_read === false ? 'bg-[#c5a059]/8 hover:bg-[#c5a059]/15' : 'hover:bg-[#fbf9f5]'
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-[#1b1c1a]">{guest.full_name}</div>
                                {guest.is_read === false && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#c5a059] text-white shrink-0">
                                    Nouveau
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#775a19]">{guest.phone}</div>
                              {guest.email && <div className="text-[10px] text-[#605e5c]">{guest.email}</div>}
                            </td>
                            <td className="py-3 px-4">
                              {guest.attendance === 'oui' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Présent(e)
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                                  Absent(e)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-medium text-[#1b1c1a]">
                              {guest.attendance === 'oui' ? `${guest.guests_count} pers.` : '—'}
                            </td>
                            <td className="py-3 px-4 max-w-xs truncate">
                              {guest.guest_names && (
                                <div className="text-[11px] text-[#4e4639] font-medium">
                                  {guest.guest_names}
                                </div>
                              )}
                              {guest.message && (
                                <div className="text-[10px] text-[#605e5c] italic truncate">
                                  « {guest.message} »
                                </div>
                              )}
                              {!guest.guest_names && !guest.message && <span className="text-[#605e5c]">—</span>}
                            </td>
                            <td className="py-3 px-4 text-[#605e5c] whitespace-nowrap">
                              {new Date(guest.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* BOUTONS INVITATION PDF, WHATSAPP & GMAIL (SI CONFIRMÉ) */}
                                {guest.attendance === 'oui' && (
                                  <>
                                    {/* 1. Billet & Pass PDF */}
                                    <button
                                      type="button"
                                      onClick={() => setInvitationGuest(guest)}
                                      className="p-1 rounded text-[#775a19] bg-[#c5a059]/15 hover:bg-[#775a19] hover:text-white transition-colors border border-[#c5a059]/30"
                                      title="Créer / Télécharger le Billet d'Invitation PDF"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>

                                    {/* 2. Envoi WhatsApp */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const cleanPhone = formatPhoneForWhatsApp(guest.phone);
                                        const msg = generateWhatsAppInvitationMessage(guest, details);
                                        const waUrl = cleanPhone
                                          ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
                                          : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                                        window.open(waUrl, '_blank');
                                      }}
                                      className="p-1 rounded text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-300"
                                      title={`Envoyer l'invitation sur WhatsApp (${guest.phone})`}
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </button>

                                    {/* 3. Envoi Gmail */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!guest.email) {
                                          setInvitationGuest(guest);
                                        } else {
                                          const { gmailUrl, mailtoUrl } = generateGmailInvitationData(guest, details);
                                          const w = window.open(gmailUrl, '_blank');
                                          if (!w || w.closed || typeof w.closed === 'undefined') {
                                            window.location.href = mailtoUrl;
                                          }
                                        }
                                      }}
                                      className="p-1 rounded text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white transition-colors border border-rose-300"
                                      title={
                                        guest.email
                                          ? `Envoyer l'invitation par Gmail (${guest.email})`
                                          : "Renseigner l'adresse Gmail et envoyer l'invitation"
                                      }
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    markRsvpAsRead(guest.id, !guest.is_read);
                                    showNotification(guest.is_read ? 'Marqué comme non lu' : 'Marqué comme lu');
                                  }}
                                  className={`p-1 rounded transition-colors ${
                                    guest.is_read === false
                                      ? 'text-[#c5a059] bg-[#c5a059]/20 hover:bg-[#c5a059]/30'
                                      : 'text-[#605e5c] hover:text-[#775a19] hover:bg-[#775a19]/10'
                                  }`}
                                  title={guest.is_read === false ? 'Marquer comme lu' : 'Marquer comme non lu'}
                                >
                                  {guest.is_read === false ? (
                                    <Mail className="w-3.5 h-3.5 text-[#775a19]" />
                                  ) : (
                                    <MailCheck className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingGuest(guest)}
                                  className="p-1 rounded text-[#775a19] hover:bg-[#775a19]/10 transition-colors"
                                  title="Modifier"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    openDeleteModal(
                                      'Supprimer cet invité ?',
                                      `Êtes-vous sûr de vouloir supprimer définitivement la réponse de ${guest.full_name} (${guest.phone}) ? Cette action est irréversible.`,
                                      async () => {
                                        await deleteRsvp(guest.id);
                                        showNotification('Invité supprimé avec succès.');
                                      }
                                    );
                                  }}
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )
          )}

          {/* TAB 2: DATES & HORAIRES */}
          {activeTab === 'dates' && (
            <form onSubmit={handleSaveDates} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#c5a059]/20 shadow-2xs">
                <div>
                  <h3 className="font-editorial text-lg text-[#1b1c1a] font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#775a19]" />
                    Dates & Horaires Officiels du Mariage
                  </h3>
                  <p className="text-xs text-[#4e4639]">
                    Modifiez dynamiquement la date du grand jour, l'heure cible pour le compte à rebours et la ville de célébration.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs disabled:opacity-50 shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#c5a059]/20 shadow-2xs space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#775a19] border-b border-[#c5a059]/15 pb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Paramètres Temporels Principaux
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Date courte du Mariage
                    </label>
                    <input
                      type="text"
                      value={datesForm.dateString}
                      onChange={(e) => setDatesForm({ ...datesForm, dateString: e.target.value })}
                      placeholder="ex: 29 & 31 octobre 2026"
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                    <span className="text-[10px] text-[#605e5c]">Affichée dans les en-têtes et les bannières</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Date Solennelle / Formatée
                    </label>
                    <input
                      type="text"
                      value={datesForm.dateFormatted}
                      onChange={(e) => setDatesForm({ ...datesForm, dateFormatted: e.target.value })}
                      placeholder="ex: 29 & 31 Octobre 2026"
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                    <span className="text-[10px] text-[#605e5c]">Utilisée pour l'annonce officielle et le programme</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Date Cérémonie 1 — Mariage Civil
                    </label>
                    <input
                      type="text"
                      value={datesForm.date1}
                      onChange={(e) => setDatesForm({ ...datesForm, date1: e.target.value })}
                      placeholder="ex: Jeudi 29 Octobre 2026"
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                    />
                    <span className="text-[10px] text-[#605e5c]">Affichée sur la carte d'invitation et le PDF (Mariage Civil)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Date Cérémonie 2 — Mariage Coutumier
                    </label>
                    <input
                      type="text"
                      value={datesForm.date2}
                      onChange={(e) => setDatesForm({ ...datesForm, date2: e.target.value })}
                      placeholder="ex: Samedi 31 Octobre 2026"
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                    />
                    <span className="text-[10px] text-[#605e5c]">Affichée sur la carte d'invitation et le PDF (Mariage Coutumier)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Ville & Pays
                    </label>
                    <input
                      type="text"
                      value={datesForm.cityCountry}
                      onChange={(e) => setDatesForm({ ...datesForm, cityCountry: e.target.value })}
                      placeholder="ex: KINSHASA, RDC"
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                    <span className="text-[10px] text-[#605e5c]">Affiché sous les noms dans la section Hero</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Sélecteur Date & Heure Locale
                    </label>
                    <input
                      type="datetime-local"
                      value={getDatetimeLocalValue(datesForm.targetDateTime)}
                      onChange={(e) => handleDateTimeLocalChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden bg-[#fbf9f5]"
                    />
                    <span className="text-[10px] text-[#605e5c]">
                      Assistant interactif : synchronise automatiquement le compte à rebours
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#c5a059]/15">
                  <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                    Date & Heure ISO pour le Compte à Rebours (avec fuseau horaire)
                  </label>
                  <input
                    type="text"
                    value={datesForm.targetDateTime}
                    onChange={(e) => setDatesForm({ ...datesForm, targetDateTime: e.target.value })}
                    placeholder="2026-10-29T11:00:00+01:00"
                    className="w-full px-3 py-2 text-sm font-mono rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden bg-[#f5f3ef]"
                    required
                  />
                  <div className="flex items-center justify-between mt-1 text-[10px] text-[#605e5c]">
                    <span>Format standardisé ISO 8601 (Fuseau Kinshasa : UTC+1 = +01:00)</span>
                    <span className="font-semibold text-[#775a19]">
                      Cible actuelle : {datesForm.dateFormatted} à {datesForm.targetDateTime.split('T')[1]?.slice(0, 5) || '11:00'}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: ADRESSES & LIEUX */}
          {activeTab === 'venues' && (
            <form onSubmit={handleSaveVenues} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#c5a059]/20 shadow-2xs">
                <div>
                  <h3 className="font-editorial text-lg text-[#1b1c1a] font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#775a19]" />
                    Adresses & Lieux des Cérémonies ({venuesForm.length})
                  </h3>
                  <p className="text-xs text-[#4e4639]">
                    Gérez dynamiquement les adresses de Lemba (Civil) et N'sele (Coutumier), les horaires d'accueil et liens GPS.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddVenue}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#f5f3ef] hover:bg-[#e8e4dc] text-[#1b1c1a] text-xs font-semibold uppercase tracking-wider border border-[#c5a059]/40 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#775a19]" />
                    <span>Ajouter un lieu</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les lieux</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {venuesForm.map((venue, idx) => (
                  <div key={venue.id || idx} className="bg-white p-5 rounded-xl border border-[#c5a059]/20 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#c5a059]/15 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#775a19] bg-[#775a19]/10 px-2 py-0.5 rounded">
                          {venue.badge || `Lieu ${idx + 1}`}
                        </span>
                        <span className="text-xs font-semibold text-[#1b1c1a]">{venue.ceremony}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {venue.mapUrl && (
                          <a
                            href={venue.mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#775a19] hover:underline"
                          >
                            <span>Tester Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteVenue(idx)}
                          className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Supprimer ce lieu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Nom du lieu
                        </label>
                        <input
                          type="text"
                          value={venue.name}
                          onChange={(e) => handleVenueChange(idx, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Intitulé de la Cérémonie
                        </label>
                        <input
                          type="text"
                          value={venue.ceremony}
                          onChange={(e) => handleVenueChange(idx, 'ceremony', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Date de la Cérémonie
                        </label>
                        <input
                          type="text"
                          value={venue.date || ''}
                          placeholder="ex: Samedi 31 Octobre 2026"
                          onChange={(e) => handleVenueChange(idx, 'date', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Horaires d'accueil
                        </label>
                        <input
                          type="text"
                          value={venue.time}
                          onChange={(e) => handleVenueChange(idx, 'time', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Badge d'étape
                        </label>
                        <input
                          type="text"
                          value={venue.badge}
                          onChange={(e) => handleVenueChange(idx, 'badge', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                        Adresse complète
                      </label>
                      <input
                        type="text"
                        value={venue.address}
                        onChange={(e) => handleVenueChange(idx, 'address', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Repères d'Accès & Transports
                        </label>
                        <input
                          type="text"
                          value={venue.landmarks || ''}
                          onChange={(e) => handleVenueChange(idx, 'landmarks', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          placeholder="Arrêt de bus, carrefour, point de repère..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Lien d'Itinéraire (Google Maps)
                        </label>
                        <input
                          type="text"
                          value={venue.mapUrl}
                          onChange={(e) => handleVenueChange(idx, 'mapUrl', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                        URL de l'image illustrative du lieu
                      </label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={venue.image || ''}
                          onChange={(e) => handleVenueChange(idx, 'image', e.target.value)}
                          placeholder="https://..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                        />
                        {venue.image && (
                          <img
                            src={venue.image}
                            alt={venue.name}
                            className="w-10 h-10 object-cover rounded border border-[#c5a059]/30 shrink-0"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          )}

          {/* TAB 4: TEXTES DE PRÉSENTATION */}
          {activeTab === 'presentation' && (
            <form onSubmit={handleSavePresentation} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#c5a059]/20 shadow-2xs">
                <div>
                  <h3 className="font-editorial text-lg text-[#1b1c1a] font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#775a19]" />
                    Textes Éditoriaux & Présentation
                  </h3>
                  <p className="text-xs text-[#4e4639]">
                    Modifiez dynamiquement les textes de présentation, l'histoire d'amour, les devises et messages sans toucher au code.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs disabled:opacity-50 shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les textes</span>
                </button>
              </div>

              {/* SECTION 1: ACCUEIL & HERO */}
              <div className="bg-white p-5 rounded-xl border border-[#c5a059]/20 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#775a19] border-b border-[#c5a059]/15 pb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  1. Textes d'Accueil & En-tête (Hero)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Badge Supérieur du Hero
                    </label>
                    <input
                      type="text"
                      value={presentationForm.heroBadge}
                      onChange={(e) => setPresentationForm({ ...presentationForm, heroBadge: e.target.value })}
                      placeholder="ex: Célébration Nuptiale Privée"
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                    <span className="text-[10px] text-[#605e5c]">Badge doré au sommet de la page d'accueil</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Slogan sur la Photo du Couple (Hero)
                    </label>
                    <input
                      type="text"
                      value={presentationForm.heroTagline}
                      onChange={(e) => setPresentationForm({ ...presentationForm, heroTagline: e.target.value })}
                      placeholder="ex: Deux âmes réunies pour l'éternité"
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                    <span className="text-[10px] text-[#605e5c]">Inscrit sur le cadre photo des mariés</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                    Texte d'Annonce Principal (Sous les prénoms des mariés)
                  </label>
                  <input
                    type="text"
                    value={presentationForm.announcementText}
                    onChange={(e) => setPresentationForm({ ...presentationForm, announcementText: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                    required
                  />
                  <span className="text-[10px] text-[#605e5c]">Texte solennel invitant à la célébration</span>
                </div>

                {/* Photo Principale du Couple (Hero) */}
                <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#c5a059]/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#775a19] block">
                        Photo Principale du Couple (Bannière Hero)
                      </span>
                      <p className="text-xs text-[#4e4639]">
                        Photo centrale majestueuse de Jonas & Flora affichée au sommet du site officiel.
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold cursor-pointer shadow-2xs transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Téléverser une photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, async (url) => {
                              setPresentationForm((prev) => ({ ...prev, coupleHeroPhoto: url }));
                              await updateDetails({ coupleHeroPhoto: url });
                              showNotification("Photo de couverture enregistrée et persistée avec succès !");
                            });
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-28 h-20 rounded-lg overflow-hidden border-2 border-[#c5a059]/50 shrink-0 bg-stone-100 shadow-xs">
                      <img
                        src={presentationForm.coupleHeroPhoto}
                        alt="Aperçu couple"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-[#1b1c1a] uppercase mb-1">
                        Lien URL ou chemin relatif de la photo
                      </label>
                      <input
                        type="text"
                        value={presentationForm.coupleHeroPhoto}
                        onChange={(e) => setPresentationForm({ ...presentationForm, coupleHeroPhoto: e.target.value })}
                        placeholder="/assets/couple_photo.jpg"
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Citation Centrale / Devise Nuptiale
                    </label>
                    <textarea
                      rows={3}
                      value={presentationForm.centerQuote}
                      onChange={(e) => setPresentationForm({ ...presentationForm, centerQuote: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Sous-titre sous la Devise Nuptiale
                    </label>
                    <textarea
                      rows={3}
                      value={presentationForm.centerSubtitle}
                      onChange={(e) => setPresentationForm({ ...presentationForm, centerSubtitle: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: NOTRE HISTOIRE D'AMOUR */}
              <div className="bg-white p-5 rounded-xl border border-[#c5a059]/20 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#c5a059]/15 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#775a19] flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    2. Présentation de Notre Histoire ({storyForm.length} Chapitres)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f5f3ef] hover:bg-[#e8e4dc] text-[#775a19] text-xs font-semibold transition-colors border border-[#c5a059]/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un chapitre</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Titre de la Section Histoire
                    </label>
                    <input
                      type="text"
                      value={presentationForm.storyIntroTitle}
                      onChange={(e) => setPresentationForm({ ...presentationForm, storyIntroTitle: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Texte d'Introduction de l'Histoire
                    </label>
                    <input
                      type="text"
                      value={presentationForm.storyIntroText}
                      onChange={(e) => setPresentationForm({ ...presentationForm, storyIntroText: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="block text-xs font-semibold text-[#4e4639] uppercase">
                    Récits Chronologiques des Chapitres
                  </span>
                  {storyForm.map((milestone, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-[#fbf9f5] border border-[#c5a059]/20 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#c5a059]/10 pb-1.5">
                        <span className="text-xs font-bold text-[#775a19]">
                          Chapitre {idx + 1} — {milestone.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMilestone(idx)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Supprimer ce chapitre"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#1b1c1a] uppercase mb-0.5">
                            Titre du Chapitre
                          </label>
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                            className="w-full px-2.5 py-1 text-xs rounded border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#1b1c1a] uppercase mb-0.5">
                            Sous-titre / Période
                          </label>
                          <input
                            type="text"
                            value={milestone.subtitle}
                            onChange={(e) => handleMilestoneChange(idx, 'subtitle', e.target.value)}
                            className="w-full px-2.5 py-1 text-xs rounded border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#1b1c1a] uppercase mb-0.5">
                          Récit & Description du Chapitre
                        </label>
                        <textarea
                          rows={2}
                          value={milestone.description}
                          onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs rounded border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: PRÉSENTATION DU PROGRAMME */}
              <div className="bg-white p-5 rounded-xl border border-[#c5a059]/20 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#775a19] border-b border-[#c5a059]/15 pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  3. Texte d'Introduction au Programme
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                    Sous-titre explicatif du Programme
                  </label>
                  <textarea
                    rows={2}
                    value={presentationForm.programSubtitle}
                    onChange={(e) => setPresentationForm({ ...presentationForm, programSubtitle: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                    required
                  />
                  <span className="text-[10px] text-[#605e5c]">
                    Présente le déroulement chronologique de la journée aux invités
                  </span>
                </div>
              </div>

              {/* SECTION 4: CITATIONS ÉMOTIONNELLES & FOOTER */}
              <div className="bg-white p-5 rounded-xl border border-[#c5a059]/20 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#775a19] border-b border-[#c5a059]/15 pb-2 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  4. Bannière Émotionnelle & Message du Footer
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Citation Bannière (Ligne 1)
                    </label>
                    <input
                      type="text"
                      value={presentationForm.emotionalQuote1}
                      onChange={(e) => setPresentationForm({ ...presentationForm, emotionalQuote1: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Citation Bannière (Ligne 2)
                    </label>
                    <input
                      type="text"
                      value={presentationForm.emotionalQuote2}
                      onChange={(e) => setPresentationForm({ ...presentationForm, emotionalQuote2: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                    Message de Clôture et Remerciement (Footer)
                  </label>
                  <textarea
                    rows={2}
                    value={presentationForm.footerMessage}
                    onChange={(e) => setPresentationForm({ ...presentationForm, footerMessage: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                    required
                  />
                  <span className="text-[10px] text-[#605e5c]">
                    Affiché au pied de page au-dessus des signatures des mariés
                  </span>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: LES MARIÉS */}
          {activeTab === 'couple' && (
            <form onSubmit={handleSaveCouple} className="space-y-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#c5a059]/20 shadow-2xs">
                <div>
                  <h3 className="font-editorial text-lg text-[#1b1c1a] font-semibold">
                    Profils et Citations des Mariés
                  </h3>
                  <p className="text-xs text-[#4e4639]">
                    Modifiez les noms complets, prénoms usuels, rôles et déclarations d'amour de Jonas & Flora.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les profils</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Groom Jonas */}
                <div className="bg-white p-5 rounded-xl border border-[#c5a059]/20 shadow-2xs space-y-4">
                  <div className="flex items-center gap-3 border-b border-[#c5a059]/15 pb-3">
                    <img
                      src={coupleForm.groom.photo}
                      alt="Jonas"
                      className="w-12 h-12 rounded-full object-cover border border-[#c5a059]/40"
                    />
                    <div>
                      <h4 className="font-editorial text-base text-[#1b1c1a] font-semibold">
                        {coupleForm.groom.fullName}
                      </h4>
                      <span className="text-[11px] text-[#775a19] font-medium uppercase">
                        {coupleForm.groom.role}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                      Nom complet du Marié
                    </label>
                    <input
                      type="text"
                      value={coupleForm.groom.fullName}
                      onChange={(e) =>
                        setCoupleForm({
                          ...coupleForm,
                          groom: { ...coupleForm.groom, fullName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                      Prénom usuel
                    </label>
                    <input
                      type="text"
                      value={coupleForm.groom.shortName}
                      onChange={(e) =>
                        setCoupleForm({
                          ...coupleForm,
                          groom: { ...coupleForm.groom, shortName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#1b1c1a] uppercase">
                        Photo du Marié (Portrait)
                      </label>
                      <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#775a19] hover:text-[#5f4714] cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Téléverser photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, async (url) => {
                                setCoupleForm((prev) => ({
                                  ...prev,
                                  groom: { ...prev.groom, photo: url },
                                }));
                                await updateDetails({
                                  groom: { ...details.groom, ...coupleForm.groom, photo: url },
                                });
                                showNotification("Photo du marié enregistrée et persistée avec succès !");
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={coupleForm.groom.photo}
                      onChange={(e) =>
                        setCoupleForm({
                          ...coupleForm,
                          groom: { ...coupleForm.groom, photo: e.target.value },
                        })
                      }
                      placeholder="/assets/groom_jonas.jpg"
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                      Citation personnelle
                    </label>
                    <textarea
                      rows={4}
                      value={coupleForm.groom.quote}
                      onChange={(e) =>
                        setCoupleForm({
                          ...coupleForm,
                          groom: { ...coupleForm.groom, quote: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                {/* Bride Flora */}
                <div className="bg-white p-5 rounded-xl border border-[#c5a059]/20 shadow-2xs space-y-4">
                  <div className="flex items-center gap-3 border-b border-[#c5a059]/15 pb-3">
                    <img
                      src={coupleForm.bride.photo}
                      alt="Flora"
                      className="w-12 h-12 rounded-full object-cover border border-[#c5a059]/40"
                    />
                    <div>
                      <h4 className="font-editorial text-base text-[#1b1c1a] font-semibold">
                        {coupleForm.bride.fullName}
                      </h4>
                      <span className="text-[11px] text-[#775a19] font-medium uppercase">
                        {coupleForm.bride.role}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                      Nom complet de la Mariée
                    </label>
                    <input
                      type="text"
                      value={coupleForm.bride.fullName}
                      onChange={(e) =>
                        setCoupleForm({
                          ...coupleForm,
                          bride: { ...coupleForm.bride, fullName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                      Prénom usuel
                    </label>
                    <input
                      type="text"
                      value={coupleForm.bride.shortName}
                      onChange={(e) =>
                        setCoupleForm({
                          ...coupleForm,
                          bride: { ...coupleForm.bride, shortName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#1b1c1a] uppercase">
                        Photo de la Mariée (Portrait)
                      </label>
                      <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#775a19] hover:text-[#5f4714] cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Téléverser photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, async (url) => {
                                setCoupleForm((prev) => ({
                                  ...prev,
                                  bride: { ...prev.bride, photo: url },
                                }));
                                await updateDetails({
                                  bride: { ...details.bride, ...coupleForm.bride, photo: url },
                                });
                                showNotification("Photo de la mariée enregistrée et persistée avec succès !");
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={coupleForm.bride.photo}
                      onChange={(e) =>
                        setCoupleForm({
                          ...coupleForm,
                          bride: { ...coupleForm.bride, photo: e.target.value },
                        })
                      }
                      placeholder="/assets/bride_flora.jpg"
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                      Citation personnelle
                    </label>
                    <textarea
                      rows={4}
                      value={coupleForm.bride.quote}
                      onChange={(e) =>
                        setCoupleForm({
                          ...coupleForm,
                          bride: { ...coupleForm.bride, quote: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 5: PROGRAMME */}
          {activeTab === 'program' && (
            <form onSubmit={handleSaveProgram} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#c5a059]/20 shadow-2xs">
                <div>
                  <h3 className="font-editorial text-lg text-[#1b1c1a] font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#775a19]" />
                    Programme & Déroulement Chronologique ({programForm.length} Étapes)
                  </h3>
                  <p className="text-xs text-[#4e4639]">
                    Personnalisez les étapes clés (horaires, lieux, adresses, repères et liens GPS d'accès).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddProgramStep}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#f5f3ef] hover:bg-[#e8e4dc] text-[#1b1c1a] text-xs font-semibold uppercase tracking-wider border border-[#c5a059]/40 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#775a19]" />
                    <span>Ajouter une étape</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer le programme</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {programForm.map((step, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-[#c5a059]/20 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#c5a059]/15 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#775a19] bg-[#775a19]/10 px-2 py-0.5 rounded">
                          {step.badge || `Étape ${idx + 1}`}
                        </span>
                        <span className="text-xs font-semibold text-[#1b1c1a]">{step.time}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteProgramStep(idx)}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Supprimer cette étape"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Date de l'étape
                        </label>
                        <input
                          type="text"
                          value={step.date || ''}
                          placeholder="ex: Samedi 31 Octobre 2026"
                          onChange={(e) => handleProgramChange(idx, 'date', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Horaires
                        </label>
                        <input
                          type="text"
                          value={step.time}
                          onChange={(e) => handleProgramChange(idx, 'time', e.target.value)}
                          placeholder="ex: 15H00 — 19H45"
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Titre
                        </label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleProgramChange(idx, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Type de cérémonie
                        </label>
                        <input
                          type="text"
                          value={step.type}
                          onChange={(e) => handleProgramChange(idx, 'type', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Lieu / Édifice
                        </label>
                        <input
                          type="text"
                          value={step.location}
                          onChange={(e) => handleProgramChange(idx, 'location', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Adresse
                        </label>
                        <input
                          type="text"
                          value={step.address}
                          onChange={(e) => handleProgramChange(idx, 'address', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Repères & Précisions d'accueil
                        </label>
                        <input
                          type="text"
                          value={step.landmarks || ''}
                          onChange={(e) => handleProgramChange(idx, 'landmarks', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                          Badge d'étape
                        </label>
                        <input
                          type="text"
                          value={step.badge}
                          onChange={(e) => handleProgramChange(idx, 'badge', e.target.value)}
                          placeholder="ex: ① ÉTAPE CIVILE"
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                        Lien d'Itinéraire (Google Maps)
                      </label>
                      <input
                        type="text"
                        value={step.mapUrl || ''}
                        onChange={(e) => handleProgramChange(idx, 'mapUrl', e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </form>
          )}

          {/* TAB: PHOTOS & GALERIE PUBLIQUE */}
          {activeTab === 'photos' && (
            <AdminPhotosManager
              details={details}
              galleryItems={galleryItems}
              onUpdateDetails={updateDetails}
              onUpdateGallery={updateGalleryItems}
              showNotification={showNotification}
              openDeleteModal={openDeleteModal}
            />
          )}

          {/* TAB 6: GUESTBOOK */}
          {activeTab === 'guestbook' && (
            !isAdminUnlocked ? (
              <SensitiveDataLock
                sectionType="guestbook"
                onUnlocked={() => {
                  setIsAdminUnlocked(true);
                  showNotification('Accès aux témoignages du Livre d\'Or déverrouillé.');
                }}
              />
            ) : (
            <div className="space-y-4">
              {/* Security Unlocked Banner with Quick Re-Lock */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">Témoignages du livre d'or déverrouillés</span>
                  <span className="hidden md:inline text-emerald-700/80">• Modération et consultation protégées</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logoutAdmin();
                    showNotification('Les données sensibles ont été reverrouillées.');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-rose-50 text-[#775a19] hover:text-rose-700 border border-[#c5a059]/30 text-xs font-semibold transition-colors shadow-2xs"
                  title="Verrouiller à nouveau l'accès aux données sensibles"
                >
                  <Lock className="w-3 h-3 text-[#775a19]" />
                  <span>Verrouiller l'accès</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#c5a059]/20 shadow-2xs">
                <div>
                  <h3 className="font-editorial text-lg text-[#1b1c1a] font-semibold">
                    Modération des Messages du Livre d'Or
                  </h3>
                  <p className="text-xs text-[#4e4639]">
                    Validez ou désactivez les vœux déposés par les invités avant affichage public.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadGuestbookCount > 0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        await markAllAsRead();
                        showNotification('Tous les messages ont été marqués comme lus.');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#c5a059]/15 hover:bg-[#c5a059]/25 text-[#775a19] text-xs font-semibold transition-colors shadow-2xs"
                      title="Marquer tous les messages comme lus"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Tout lire ({unreadGuestbookCount})</span>
                    </button>
                  )}
                  <span className="text-xs font-bold text-[#775a19] bg-[#775a19]/10 px-3 py-1.5 rounded-full">
                    {guestbook.length} témoignages
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {guestbook.length === 0 ? (
                  <div className="bg-white p-8 rounded-xl border border-[#c5a059]/20 text-center text-[#605e5c] italic text-sm">
                    Aucun message dans le livre d'or pour le moment.
                  </div>
                ) : (
                  guestbook.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border border-[#c5a059]/20 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                        item.is_read === false ? 'bg-[#c5a059]/8 border-[#c5a059]/40' : 'bg-white'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-[#1b1c1a]">{item.name}</span>
                          {item.is_read === false && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#c5a059] text-white">
                              Nouveau
                            </span>
                          )}
                          {item.relation && (
                            <span className="text-[10px] text-[#775a19] font-medium bg-[#775a19]/10 px-2 py-0.5 rounded-full">
                              {item.relation}
                            </span>
                          )}
                          <span className="text-[10px] text-[#605e5c]">
                            {new Date(item.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[#4e4639] italic">« {item.message} »</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            markGuestbookAsRead(item.id, !item.is_read);
                            showNotification(item.is_read ? 'Marqué comme non lu' : 'Marqué comme lu');
                          }}
                          className={`p-1.5 rounded transition-colors ${
                            item.is_read === false
                              ? 'text-[#c5a059] bg-[#c5a059]/20 hover:bg-[#c5a059]/30'
                              : 'text-[#605e5c] hover:text-[#775a19] hover:bg-[#775a19]/10'
                          }`}
                          title={item.is_read === false ? 'Marquer comme lu' : 'Marquer comme non lu'}
                        >
                          {item.is_read === false ? (
                            <Mail className="w-3.5 h-3.5 text-[#775a19]" />
                          ) : (
                            <MailCheck className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toggleGuestbookApproval(item.id);
                            showNotification('Statut de publication mis à jour avec succès.');
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            item.approved
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{item.approved ? 'Approuvé (Visible)' : 'En attente'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            openDeleteModal(
                              'Supprimer ce témoignage ?',
                              `Êtes-vous sûr de vouloir supprimer définitivement le message de félicitations de ${item.name} ? Cette action est irréversible.`,
                              async () => {
                                await deleteGuestbook(item.id);
                                showNotification('Témoignage supprimé avec succès.');
                              }
                            );
                          }}
                          className="p-1.5 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            )
          )}

          {/* TAB 7: SÉCURITÉ & CODE D'ACCÈS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Security Status Card */}
              <div className="bg-white p-5 rounded-xl border border-[#c5a059]/20 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c5a059]/15 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#775a19]/15 flex items-center justify-center text-[#775a19]">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-editorial text-lg text-[#1b1c1a] font-semibold">
                        Sécurité & Code d'Accès Administrateur
                      </h3>
                      <p className="text-xs text-[#4e4639]">
                        Verrouillage et modification du code secret d'accès à l'administration
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLockAdmin}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Verrouiller la session</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-emerald-50/80 rounded-lg border border-emerald-200 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-900 mb-0.5">Protection des Données Sensibles</div>
                      <div className="text-emerald-800 leading-relaxed">
                        Les données confidentielles des invités (réponses RSVP, coordonnées téléphoniques, présences et vœux privés du livre d'or) sont verrouillées par ce code PIN pour préserver leur vie privée.
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#f5f3ef] rounded-lg border border-[#c5a059]/20 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-[#775a19] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#1b1c1a] mb-0.5">Persistance Sécurisée</div>
                      <div className="text-[#605e5c] leading-relaxed">
                        Le code d'accès est protégé et conservé de façon sécurisée pour garantir une protection continue de votre espace.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change PIN Form */}
              <div className="bg-white p-5 rounded-xl border border-[#c5a059]/20 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#c5a059]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#775a19]" />
                    <h4 className="font-editorial text-base text-[#1b1c1a] font-semibold">
                      Changer le Code PIN d'Accès
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPinFields(!showPinFields)}
                    className="inline-flex items-center gap-1 text-xs text-[#775a19] hover:underline font-medium"
                  >
                    {showPinFields ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPinFields ? 'Masquer les caractères' : 'Afficher les caractères'}</span>
                  </button>
                </div>

                {pinChangeSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{pinChangeSuccess}</span>
                  </div>
                )}

                {pinChangeError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{pinChangeError}</span>
                  </div>
                )}

                <form onSubmit={handlePinChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                      Code PIN Actuel
                    </label>
                    <input
                      type={showPinFields ? 'text' : 'password'}
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      placeholder="Saisissez le code actuel"
                      className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden font-mono"
                      required
                    />
                    <span className="text-[11px] text-[#605e5c] mt-0.5 block">
                      Code par défaut si inchangé : <strong>1234</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                        Nouveau Code PIN
                      </label>
                      <input
                        type={showPinFields ? 'text' : 'password'}
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="Ex: 2026"
                        maxLength={12}
                        className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1b1c1a] uppercase tracking-wider mb-1">
                        Confirmer le Nouveau Code
                      </label>
                      <input
                        type={showPinFields ? 'text' : 'password'}
                        value={confirmPinInput}
                        onChange={(e) => setConfirmPinInput(e.target.value)}
                        placeholder="Répétez le code"
                        maxLength={12}
                        className="w-full px-3 py-2 text-sm rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden font-mono"
                        required
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#605e5c] leading-relaxed">
                    Le code d'accès peut être composé de chiffres ou de lettres (au moins 4 caractères). Veillez à le conserver précieusement.
                  </p>

                  <button
                    type="submit"
                    disabled={isChangingPin}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isChangingPin ? 'Enregistrement...' : 'Enregistrer le nouveau code'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 8: SAUVEGARDE & ARCHIVES */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-[#c5a059]/20 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#c5a059]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <Archive className="w-5 h-5 text-[#775a19]" />
                    <h3 className="font-editorial text-lg text-[#1b1c1a] font-semibold">
                      Sauvegarde & Archives de l'Événement
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Espace Sécurisé & Actif
                  </span>
                </div>

                <p className="text-xs text-[#4e4639] leading-relaxed">
                  Exportez l'intégralité des données du mariage (confirmations RSVP, coordonnées des invités, messages du livre d'or, programme et lieux) dans un fichier archive pour vos archives personnelles, ou rétablissez les données de référence si nécessaire.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-[#f5f3ef] rounded-lg border border-[#c5a059]/20">
                    <span className="text-[#605e5c] block mb-1">Confirmations d'invités :</span>
                    <strong className="text-[#1b1c1a] text-sm">{rsvps.length} convive{rsvps.length > 1 ? 's' : ''}</strong>
                  </div>
                  <div className="p-3 bg-[#f5f3ef] rounded-lg border border-[#c5a059]/20">
                    <span className="text-[#605e5c] block mb-1">Messages du livre d'or :</span>
                    <strong className="text-[#1b1c1a] text-sm">{guestbook.length} témoignage{guestbook.length > 1 ? 's' : ''}</strong>
                  </div>
                  <div className="p-3 bg-[#f5f3ef] rounded-lg border border-[#c5a059]/20">
                    <span className="text-[#605e5c] block mb-1">Statut de conservation :</span>
                    <strong className="text-emerald-700 text-sm font-semibold">Actif & Protégé</strong>
                  </div>
                </div>

                <div className="border-t border-[#c5a059]/15 pt-4">
                  <h4 className="font-semibold text-xs text-[#1b1c1a] uppercase tracking-wider mb-3">
                    Actions d'Archive & Restauration
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={exportFullBackupJSON}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger une Copie de Sauvegarde (JSON)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        openDeleteModal(
                          'Rétablir les Données Initiales ?',
                          'Attention : cette opération rétablira les dates, textes, adresses, programme et invités initiaux de référence. Les modifications récentes seront réinitialisées.',
                          async () => {
                            await handleResetConfirm();
                          }
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Rétablir les Données Initiales</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#f5f3ef] border-t border-[#c5a059]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#605e5c] gap-2">
          <span>
            Espace d'administration sécurisé • Jonas & Flora 2026
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-white hover:bg-[#1b1c1a] hover:text-white text-[#1b1c1a] border border-[#c5a059]/30 font-medium transition-colors"
          >
            Fermer le panneau
          </button>
        </div>
      </div>

      {/* MODAL: MANUAL NEW GUEST */}
      {isNewGuestModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#c5a059]/30 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#c5a059]/15 pb-3">
              <h3 className="font-editorial text-lg text-[#1b1c1a] font-semibold">
                Ajouter un Invité Manuellement
              </h3>
              <button
                onClick={() => setIsNewGuestModalOpen(false)}
                className="text-[#605e5c] hover:text-[#1b1c1a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewGuest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="ex: M. Kabeya Roger"
                  className="w-full px-3 py-1.5 rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1">Numéro WhatsApp / Téléphone *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold uppercase mb-1">Présence *</label>
                  <select
                    value={newAttendance}
                    onChange={(e) => setNewAttendance(e.target.value as 'oui' | 'non')}
                    className="w-full px-3 py-1.5 rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                  >
                    <option value="oui">Sera présent</option>
                    <option value="non">Ne pourra pas venir</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase mb-1">Total personnes</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    disabled={newAttendance === 'non'}
                    value={newGuestsCount}
                    onChange={(e) => setNewGuestsCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1">Accompagnants (optionnel)</label>
                <input
                  type="text"
                  value={newGuestNames}
                  onChange={(e) => setNewGuestNames(e.target.value)}
                  placeholder="ex: Mme Kabeya"
                  className="w-full px-3 py-1.5 rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1">Note ou message (optionnel)</label>
                <textarea
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="ex: Table famille"
                  className="w-full px-3 py-1.5 rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#c5a059]/15">
                <button
                  type="button"
                  onClick={() => setIsNewGuestModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#775a19] hover:bg-[#5f4714] text-white font-semibold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT GUEST */}
      {editingGuest && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#c5a059]/30 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#c5a059]/15 pb-3">
              <h3 className="font-editorial text-lg text-[#1b1c1a] font-semibold">
                Modifier l'Invité
              </h3>
              <button
                onClick={() => setEditingGuest(null)}
                className="text-[#605e5c] hover:text-[#1b1c1a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={editingGuest.full_name}
                  onChange={(e) => setEditingGuest({ ...editingGuest, full_name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1">Numéro WhatsApp / Téléphone *</label>
                <input
                  type="tel"
                  required
                  value={editingGuest.phone}
                  onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold uppercase mb-1">Présence *</label>
                  <select
                    value={editingGuest.attendance}
                    onChange={(e) =>
                      setEditingGuest({
                        ...editingGuest,
                        attendance: e.target.value as 'oui' | 'non',
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                  >
                    <option value="oui">Présent</option>
                    <option value="non">Absent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase mb-1">Total personnes</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    disabled={editingGuest.attendance === 'non'}
                    value={editingGuest.guests_count}
                    onChange={(e) =>
                      setEditingGuest({
                        ...editingGuest,
                        guests_count: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1">Accompagnants</label>
                <input
                  type="text"
                  value={editingGuest.guest_names || ''}
                  onChange={(e) => setEditingGuest({ ...editingGuest, guest_names: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1">Message / Note</label>
                <textarea
                  rows={2}
                  value={editingGuest.message || ''}
                  onChange={(e) => setEditingGuest({ ...editingGuest, message: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#c5a059]/15">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#775a19] hover:bg-[#5f4714] text-white font-semibold"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL (REPLACES WINDOW.CONFIRM) */}
      {deleteConfirm && deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1b1c1a] leading-snug">
                  {deleteConfirm.title}
                </h3>
                <p className="text-xs text-[#605e5c] mt-1 leading-relaxed">
                  {deleteConfirm.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#c5a059]/15">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  const onConfirm = deleteConfirm.onConfirm;
                  setDeleteConfirm(null);
                  await onConfirm();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmer</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODALE D'INVITATION & BILLET PDF / WHATSAPP / GMAIL */}
      <InvitationCardModal
        isOpen={invitationGuest !== null}
        onClose={() => setInvitationGuest(null)}
        guest={invitationGuest}
        details={details}
        programSteps={programSteps}
        venues={venues}
        onUpdateGuestEmail={handleUpdateGuestEmail}
        onUpdateGuestPhone={handleUpdateGuestPhone}
      />
    </div>
  );
};
