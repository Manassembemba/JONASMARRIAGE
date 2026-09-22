import React, { useState, useEffect } from 'react';
import { WeddingDetails, GalleryItem } from '../types';
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  Heart,
  Layers,
  Database,
  Loader2,
} from 'lucide-react';
import { uploadPhotoToServer } from '../utils/imageUpload';
import { WeddingLogo } from './WeddingLogo';

interface AdminPhotosManagerProps {
  details: WeddingDetails;
  galleryItems: GalleryItem[];
  onUpdateDetails: (newDetails: Partial<WeddingDetails>) => Promise<boolean>;
  onUpdateGallery: (items: GalleryItem[]) => Promise<boolean>;
  showNotification: (msg: string) => void;
  openDeleteModal: (title: string, message: string, onConfirm: () => void) => void;
}

export const AdminPhotosManager: React.FC<AdminPhotosManagerProps> = ({
  details,
  galleryItems,
  onUpdateDetails,
  onUpdateGallery,
  showNotification,
  openDeleteModal,
}) => {
  // Local state for official photos
  const [coupleHeroPhoto, setCoupleHeroPhoto] = useState(details.coupleHeroPhoto || '/assets/couple_photo.jpg');
  const [groomPhoto, setGroomPhoto] = useState(details.groom?.photo || '/assets/groom_jonas.jpg');
  const [bridePhoto, setBridePhoto] = useState(details.bride?.photo || '/assets/bride_flora.jpg');
  const [monogramUrl, setMonogramUrl] = useState(details.monogramUrl || '');

  // Local state for gallery photos
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(galleryItems);
  const [isAddingNewPhoto, setIsAddingNewPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [previewPhotoModal, setPreviewPhotoModal] = useState<string | null>(null);

  // Sync state whenever context data changes (from server database)
  useEffect(() => {
    if (details.coupleHeroPhoto) setCoupleHeroPhoto(details.coupleHeroPhoto);
    if (details.groom?.photo) setGroomPhoto(details.groom.photo);
    if (details.bride?.photo) setBridePhoto(details.bride.photo);
    if (details.monogramUrl) setMonogramUrl(details.monogramUrl);
  }, [details.coupleHeroPhoto, details.groom?.photo, details.bride?.photo, details.monogramUrl]);

  useEffect(() => {
    if (galleryItems && galleryItems.length > 0) {
      setGalleryList(galleryItems);
    }
  }, [galleryItems]);

  // New photo form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('Kinshasa • 2026');
  const [newUrl, setNewUrl] = useState('');
  const [newSpan, setNewSpan] = useState<'col-span-12 md:col-span-7' | 'col-span-12 md:col-span-6' | 'col-span-12 md:col-span-5' | 'col-span-12'>('col-span-12 md:col-span-6');
  const [newAspect, setNewAspect] = useState<'aspect-[4/3]' | 'aspect-square' | 'aspect-[16/9]'>('aspect-[4/3]');

  // Dedicated official photo upload with automatic SQLite persistence
  const handleOfficialPhotoUpload = async (
    file: File,
    type: 'hero' | 'groom' | 'bride' | 'monogram'
  ) => {
    if (!file) return;
    setUploadingTarget(type);
    showNotification("Compression et téléversement de la photo sur le serveur...");
    try {
      const persistentUrl = await uploadPhotoToServer(file, `wedding_${type}`);

      let updatedCoupleHero = coupleHeroPhoto;
      let updatedGroom = groomPhoto;
      let updatedBride = bridePhoto;
      let updatedMonogram = monogramUrl;

      if (type === 'hero') {
        updatedCoupleHero = persistentUrl;
        setCoupleHeroPhoto(persistentUrl);
      } else if (type === 'groom') {
        updatedGroom = persistentUrl;
        setGroomPhoto(persistentUrl);
      } else if (type === 'bride') {
        updatedBride = persistentUrl;
        setBridePhoto(persistentUrl);
      } else if (type === 'monogram') {
        updatedMonogram = persistentUrl;
        setMonogramUrl(persistentUrl);
      }

      // Auto-save immediately to SQLite so changes are 100% persistent
      const ok = await onUpdateDetails({
        coupleHeroPhoto: updatedCoupleHero,
        monogramUrl: updatedMonogram,
        groom: {
          ...details.groom,
          photo: updatedGroom,
        },
        bride: {
          ...details.bride,
          photo: updatedBride,
        },
      });

      if (ok) {
        showNotification("Photo enregistrée et persistée avec succès dans la base de données !");
      } else {
        showNotification("Photo téléversée sur le disque. Cliquez sur « Sauvegarder tout » pour valider.");
      }
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de l'enregistrement de l'image.");
    } finally {
      setUploadingTarget(null);
    }
  };

  // Immediate save for manually edited URLs
  const handleSaveOfficialUrl = async (type: 'hero' | 'groom' | 'bride' | 'monogram') => {
    setIsSaving(true);
    let payload: Partial<WeddingDetails> = {};
    if (type === 'hero') payload = { coupleHeroPhoto };
    else if (type === 'groom') payload = { groom: { ...details.groom, photo: groomPhoto } };
    else if (type === 'bride') payload = { bride: { ...details.bride, photo: bridePhoto } };
    else if (type === 'monogram') payload = { monogramUrl };

    try {
      const ok = await onUpdateDetails(payload);
      if (ok) {
        showNotification("Photo validée et enregistrée avec succès dans la base de données !");
      } else {
        showNotification("Erreur lors de l'enregistrement.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Replace photo in public gallery
  const handleReplaceGalleryPhoto = async (index: number, file: File) => {
    if (!file) return;
    setUploadingTarget(`gallery-${index}`);
    showNotification("Téléversement et enregistrement de la nouvelle photo...");
    try {
      const persistentUrl = await uploadPhotoToServer(file, `gallery_item_${index}`);
      const updated = [...galleryList];
      updated[index] = { ...updated[index], url: persistentUrl };
      setGalleryList(updated);
      await onUpdateGallery(updated);
      showNotification("Photo de la galerie remplacée et enregistrée avec succès !");
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors du remplacement de la photo.");
    } finally {
      setUploadingTarget(null);
    }
  };

  // Upload file for new photo addition
  const handleNewPhotoFileUpload = async (file: File) => {
    if (!file) return;
    setUploadingTarget('new-gallery-photo');
    showNotification("Optimisation et téléversement de la photo...");
    try {
      const persistentUrl = await uploadPhotoToServer(file, 'gallery_new');
      setNewUrl(persistentUrl);
      showNotification("Photo téléversée avec succès ! Complétez les informations et cliquez sur Insérer.");
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors du téléversement.");
    } finally {
      setUploadingTarget(null);
    }
  };

  // Reordering helpers with immediate SQLite persistence
  const movePhoto = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryList.length) return;
    const updated = [...galleryList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setGalleryList(updated);
    await onUpdateGallery(updated);
    showNotification("Ordre des photos mis à jour et persisté dans la base !");
  };

  // Delete photo helper with immediate SQLite persistence
  const handleDeleteGalleryPhoto = (index: number) => {
    const item = galleryList[index];
    openDeleteModal(
      'Retirer cette photo de la galerie ?',
      `Êtes-vous certain de vouloir supprimer la photo « ${item.title || 'Sans titre'} » de l'album public ?`,
      async () => {
        const updated = galleryList.filter((_, i) => i !== index);
        setGalleryList(updated);
        await onUpdateGallery(updated);
        showNotification("Photo retirée et galerie mise à jour dans la base de données.");
      }
    );
  };

  // Add new photo helper with immediate SQLite persistence
  const handleAddNewPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      showNotification("Veuillez sélectionner une image ou saisir une adresse URL.");
      return;
    }
    const newItem: GalleryItem = {
      id: `photo-${Date.now()}`,
      title: newTitle.trim() || 'Moment précieux',
      subtitle: newSubtitle.trim() || 'Kinshasa • 2026',
      url: newUrl.trim(),
      span: newSpan,
      aspect: newAspect,
    };
    const updated = [...galleryList, newItem];
    setGalleryList(updated);
    setIsAddingNewPhoto(false);
    setNewTitle('');
    setNewSubtitle('Kinshasa • 2026');
    setNewUrl('');
    // Auto-save to SQLite
    const ok = await onUpdateGallery(updated);
    if (ok) {
      showNotification("Nouvelle photo ajoutée et enregistrée avec succès dans la base de données !");
    } else {
      showNotification("Photo ajoutée localement. Pensez à cliquer sur « Sauvegarder tout ».");
    }
  };

  // Save all photos manually
  const handleSaveAllPhotos = async () => {
    setIsSaving(true);
    try {
      // 1. Save official photos in details
      const ok1 = await onUpdateDetails({
        coupleHeroPhoto,
        monogramUrl,
        groom: {
          ...details.groom,
          photo: groomPhoto,
        },
        bride: {
          ...details.bride,
          photo: bridePhoto,
        },
      });

      // 2. Save gallery items
      const ok2 = await onUpdateGallery(galleryList);

      if (ok1 && ok2) {
        showNotification("Toutes les photos et la galerie publique ont été enregistrées avec succès dans la base de données !");
      } else {
        showNotification("Certaines données n'ont pas pu être enregistrées. Veuillez vérifier la connexion.");
      }
    } catch {
      showNotification("Erreur lors de l'enregistrement des photos.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#c5a059]/30 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#775a19]/10 flex items-center justify-center text-[#775a19] shrink-0 mt-0.5">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-editorial text-lg sm:text-xl text-[#1b1c1a] font-semibold flex items-center gap-2">
              Gestionnaire des Photos & Galerie Publique
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#775a19]/15 text-[#775a19] border border-[#c5a059]/30">
                {galleryList.length + 3} Photos Actives
              </span>
            </h3>
            <p className="text-xs text-[#4e4639] mt-0.5">
              Mettez à jour les portraits officiels, la bannière d'accueil et les clichés de l'album public en un clic.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="w-3 h-3 text-emerald-700" />
              <span>Persistance SQLite & Stockage Serveur Actifs</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddingNewPhoto(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#c5a059]/15 hover:bg-[#c5a059]/25 text-[#775a19] text-xs font-semibold transition-colors cursor-pointer border border-[#c5a059]/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter à la Galerie</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAllPhotos}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Enregistrement...' : 'Sauvegarder tout'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PHOTOS OFFICIELLES DU MARIAGE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#775a19]" />
            <h4 className="font-editorial text-base text-[#1b1c1a] font-semibold tracking-wide">
              1. Photos Officielles du Mariage (Bannière & Portraits)
            </h4>
          </div>
          <span className="text-[11px] text-[#775a19] font-medium">
            Affichées dans les sections clés
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Couple Hero Photo */}
          <div className="bg-white rounded-2xl p-4 border border-[#c5a059]/30 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#775a19]/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#ffdea5]/50 text-[#775a19]">
                  Bannière d'Accueil (Hero)
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPhotoModal(coupleHeroPhoto)}
                  className="text-stone-400 hover:text-[#775a19] p-1 cursor-pointer"
                  title="Agrandir"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
              <h5 className="font-editorial text-sm font-semibold text-[#1b1c1a] mb-1">
                Jonas & Flora — Photo Principale
              </h5>
              <p className="text-[11px] text-[#4e4639] mb-3">
                Photo grand format présentée au sommet de la page d'accueil dans le cadre d'honneur.
              </p>

              <div className="relative aspect-[16/10] rounded-xl overflow-hidden border-2 border-[#c5a059]/30 bg-stone-100 group shadow-2xs">
                <img
                  src={coupleHeroPhoto}
                  alt="Couple principal"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-[#1b1c1a] text-xs font-semibold cursor-pointer shadow-md flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#775a19]" />
                    <span>Remplacer</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleOfficialPhotoUpload(file, 'hero');
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block text-[10px] font-semibold uppercase text-stone-600">
                Chemin ou URL de l'image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupleHeroPhoto}
                  onChange={(e) => setCoupleHeroPhoto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveOfficialUrl('hero');
                    }
                  }}
                  placeholder="/assets/couple_photo.jpg"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleSaveOfficialUrl('hero')}
                  title="Enregistrer cette photo dans la base SQLite"
                  className="px-2.5 py-1.5 rounded-lg bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3 h-3" />
                  <span className="hidden sm:inline">Valider</span>
                </button>
                <label className="px-2.5 py-1.5 rounded-lg bg-[#775a19]/10 hover:bg-[#775a19]/20 text-[#775a19] text-xs font-medium cursor-pointer border border-[#c5a059]/30 shrink-0 flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span className="hidden sm:inline">Téléverser</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleOfficialPhotoUpload(file, 'hero');
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Card 2: Groom Jonas */}
          <div className="bg-white rounded-2xl p-4 border border-[#c5a059]/30 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#775a19]/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#ffdea5]/50 text-[#775a19]">
                  Portrait du Marié
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPhotoModal(groomPhoto)}
                  className="text-stone-400 hover:text-[#775a19] p-1 cursor-pointer"
                  title="Agrandir"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
              <h5 className="font-editorial text-sm font-semibold text-[#1b1c1a] mb-1">
                Madikani Mbidi Jonas (Le Marié)
              </h5>
              <p className="text-[11px] text-[#4e4639] mb-3">
                Portrait officiel affiché dans la section de présentation du couple.
              </p>

              <div className="relative aspect-[4/4] max-w-[200px] mx-auto rounded-full overflow-hidden border-3 border-[#c5a059] bg-stone-100 group shadow-md">
                <img
                  src={groomPhoto}
                  alt="Jonas"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-[#1b1c1a] text-xs font-semibold cursor-pointer shadow-md flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#775a19]" />
                    <span>Changer</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleOfficialPhotoUpload(file, 'groom');
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block text-[10px] font-semibold uppercase text-stone-600">
                Chemin ou URL de l'image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={groomPhoto}
                  onChange={(e) => setGroomPhoto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveOfficialUrl('groom');
                    }
                  }}
                  placeholder="/assets/groom_jonas.jpg"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleSaveOfficialUrl('groom')}
                  title="Enregistrer cette photo dans la base SQLite"
                  className="px-2.5 py-1.5 rounded-lg bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3 h-3" />
                  <span className="hidden sm:inline">Valider</span>
                </button>
                <label className="px-2.5 py-1.5 rounded-lg bg-[#775a19]/10 hover:bg-[#775a19]/20 text-[#775a19] text-xs font-medium cursor-pointer border border-[#c5a059]/30 shrink-0 flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span className="hidden sm:inline">Téléverser</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleOfficialPhotoUpload(file, 'groom');
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Card 3: Bride Flora */}
          <div className="bg-white rounded-2xl p-4 border border-[#c5a059]/30 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#775a19]/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#ffdea5]/50 text-[#775a19]">
                  Portrait de la Mariée
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPhotoModal(bridePhoto)}
                  className="text-stone-400 hover:text-[#775a19] p-1 cursor-pointer"
                  title="Agrandir"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
              <h5 className="font-editorial text-sm font-semibold text-[#1b1c1a] mb-1">
                Matelo Sanga Flora (La Mariée)
              </h5>
              <p className="text-[11px] text-[#4e4639] mb-3">
                Portrait officiel raffiné affiché dans la section des mariés.
              </p>

              <div className="relative aspect-[4/4] max-w-[200px] mx-auto rounded-full overflow-hidden border-3 border-[#c5a059] bg-stone-100 group shadow-md">
                <img
                  src={bridePhoto}
                  alt="Flora"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-[#1b1c1a] text-xs font-semibold cursor-pointer shadow-md flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#775a19]" />
                    <span>Changer</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleOfficialPhotoUpload(file, 'bride');
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block text-[10px] font-semibold uppercase text-stone-600">
                Chemin ou URL de l'image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bridePhoto}
                  onChange={(e) => setBridePhoto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveOfficialUrl('bride');
                    }
                  }}
                  placeholder="/assets/bride_flora.jpg"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleSaveOfficialUrl('bride')}
                  title="Enregistrer cette photo dans la base SQLite"
                  className="px-2.5 py-1.5 rounded-lg bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3 h-3" />
                  <span className="hidden sm:inline">Valider</span>
                </button>
                <label className="px-2.5 py-1.5 rounded-lg bg-[#775a19]/10 hover:bg-[#775a19]/20 text-[#775a19] text-xs font-medium cursor-pointer border border-[#c5a059]/30 shrink-0 flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span className="hidden sm:inline">Téléverser</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleOfficialPhotoUpload(file, 'bride');
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Card 4: Monogramme & Logo Officiel (J & F) */}
          <div className="bg-white rounded-2xl p-4 border border-[#c5a059]/30 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#775a19]/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#ffdea5]/50 text-[#775a19]">
                  Logo & Monogramme (J & F)
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPhotoModal(monogramUrl || '/assets/monogram_jf.svg')}
                  className="text-stone-400 hover:text-[#775a19] p-1 cursor-pointer"
                  title="Agrandir"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
              <h5 className="font-editorial text-sm font-semibold text-[#1b1c1a] mb-1">
                Monogramme Royal Officiel
              </h5>
              <p className="text-[11px] text-[#4e4639] mb-3">
                Emblème royal doré visible sur la barre de navigation, la bannière d'accueil, les mariés et le pied de page.
              </p>

              <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-[#c5a059]/30 bg-[#fbf9f5] group shadow-2xs flex items-center justify-center p-4">
                <WeddingLogo
                  src={monogramUrl}
                  alt="Monogramme Jonas & Flora"
                  className="w-24 h-24 sm:w-28 sm:h-28"
                  imgClassName="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-[#1b1c1a] text-xs font-semibold cursor-pointer shadow-md flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                    <input
                      type="file"
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleOfficialPhotoUpload(file, 'monogram');
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block text-[10px] font-semibold uppercase text-stone-600">
                Chemin ou URL du logo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={monogramUrl}
                  onChange={(e) => setMonogramUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveOfficialUrl('monogram');
                    }
                  }}
                  placeholder="/assets/monogram_jf.svg"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleSaveOfficialUrl('monogram')}
                  title="Enregistrer ce logo dans la base SQLite"
                  className="px-2.5 py-1.5 rounded-lg bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3 h-3" />
                  <span className="hidden sm:inline">Valider</span>
                </button>
                <label className="px-2.5 py-1.5 rounded-lg bg-[#775a19]/10 hover:bg-[#775a19]/20 text-[#775a19] text-xs font-medium cursor-pointer border border-[#c5a059]/30 shrink-0 flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span className="hidden sm:inline">Téléverser</span>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleOfficialPhotoUpload(file, 'monogram');
                    }}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setMonogramUrl('/assets/monogram_jf.svg');
                  await onUpdateDetails({ monogramUrl: '/assets/monogram_jf.svg' });
                  showNotification('Monogramme royal officiel rétabli et enregistré !');
                }}
                className="w-full py-1 px-2 text-[11px] font-semibold text-[#775a19] bg-[#c5a059]/15 hover:bg-[#c5a059]/25 rounded-lg border border-[#c5a059]/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rétablir le monogramme royal doré officiel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: GALERIE PUBLIQUE & ALBUM SOUVENIRS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#c5a059]/20 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#775a19]" />
            <h4 className="font-editorial text-base text-[#1b1c1a] font-semibold tracking-wide">
              2. Album de la Galerie Publique ({galleryList.length} Clichés)
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingNewPhoto(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une photo à la Galerie</span>
          </button>
        </div>

        {/* Formulaire d'ajout rapide (si ouvert) */}
        {isAddingNewPhoto && (
          <form
            onSubmit={handleAddNewPhotoSubmit}
            className="p-5 rounded-2xl bg-[#fffcf7] border-2 border-dashed border-[#c5a059] space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h5 className="font-editorial text-sm sm:text-base font-semibold text-[#1b1c1a] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#775a19]" />
                Ajouter une nouvelle photographie dans la Galerie Publique
              </h5>
              <button
                type="button"
                onClick={() => setIsAddingNewPhoto(false)}
                className="text-xs text-stone-500 hover:text-[#1b1c1a] underline cursor-pointer"
              >
                Annuler
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1b1c1a] mb-1">
                    Titre ou Légende du Cliché *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Regards complices, Échange des vœux..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#c5a059]/40 bg-white focus:border-[#775a19] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1b1c1a] mb-1">
                    Sous-titre / Lieu ou Date
                  </label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="Ex: Kinshasa • Octobre 2026"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#c5a059]/40 bg-white focus:border-[#775a19] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] mb-1">
                      Largeur d'affichage
                    </label>
                    <select
                      value={newSpan}
                      onChange={(e) => setNewSpan(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#c5a059]/40 bg-white focus:border-[#775a19] focus:outline-hidden"
                    >
                      <option value="col-span-12 md:col-span-7">Grand format (7/12)</option>
                      <option value="col-span-12 md:col-span-6">Demi-page équilibrée (6/12)</option>
                      <option value="col-span-12 md:col-span-5">Format compact (5/12)</option>
                      <option value="col-span-12">Pleine largeur (12/12)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] mb-1">
                      Ratio / Cadrage
                    </label>
                    <select
                      value={newAspect}
                      onChange={(e) => setNewAspect(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#c5a059]/40 bg-white focus:border-[#775a19] focus:outline-hidden"
                    >
                      <option value="aspect-[4/3]">Standard (4:3)</option>
                      <option value="aspect-square">Carré parfait (1:1)</option>
                      <option value="aspect-[16/9]">Panoramique (16:9)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Image Input & Preview */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#1b1c1a] mb-1">
                  Fichier Image ou Lien URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="/assets/photo.jpg ou https://..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#c5a059]/40 bg-white focus:border-[#775a19] focus:outline-hidden"
                    required
                  />
                  <label className="px-3 py-2 rounded-lg bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choisir fichier</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleNewPhotoFileUpload(file);
                      }}
                    />
                  </label>
                </div>

                <div className="aspect-[16/9] rounded-xl overflow-hidden border border-[#c5a059]/40 bg-stone-100 flex items-center justify-center">
                  {newUrl ? (
                    <img src={newUrl} alt="Aperçu nouveau" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-stone-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">L'aperçu de votre photo apparaîtra ici</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#c5a059]/20">
              <button
                type="button"
                onClick={() => setIsAddingNewPhoto(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Insérer dans la Galerie
              </button>
            </div>
          </form>
        )}

        {/* Grille des photos existantes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryList.map((item, index) => (
            <div
              key={item.id || `gallery-item-${index}`}
              className="bg-white rounded-2xl p-3.5 border border-[#c5a059]/30 shadow-xs flex flex-col justify-between space-y-3 hover:border-[#775a19]/60 transition-all group"
            >
              {/* Photo Header & Order badges */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#775a19]/10 text-[#775a19] border border-[#c5a059]/30">
                  #{index + 1} • Galerie
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => movePhoto(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded-md text-stone-400 hover:text-[#775a19] hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                    title="Déplacer vers la gauche / haut"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(index, 'down')}
                    disabled={index === galleryList.length - 1}
                    className="p-1 rounded-md text-stone-400 hover:text-[#775a19] hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                    title="Déplacer vers la droite / bas"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPhotoModal(item.url)}
                    className="p-1 rounded-md text-stone-400 hover:text-[#775a19] hover:bg-stone-100 cursor-pointer"
                    title="Aperçu agrandi"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGalleryPhoto(index)}
                    className="p-1 rounded-md text-rose-400 hover:text-rose-700 hover:bg-rose-50 cursor-pointer ml-1"
                    title="Supprimer cette photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Image thumbnail with hover replace */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#c5a059]/30 bg-stone-100 shadow-2xs">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                  <label className="px-3 py-1.5 rounded-lg bg-white/95 text-[#1b1c1a] text-xs font-semibold cursor-pointer shadow-md flex items-center gap-1.5 hover:bg-white">
                    <Upload className="w-3.5 h-3.5 text-[#775a19]" />
                    <span>Remplacer l'image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleReplaceGalleryPhoto(index, file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Editable metadata */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-0.5">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...galleryList];
                      updated[index] = { ...updated[index], title: e.target.value };
                      setGalleryList(updated);
                    }}
                    className="w-full px-2.5 py-1 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-0.5">
                    Sous-titre / Légende
                  </label>
                  <input
                    type="text"
                    value={item.subtitle}
                    onChange={(e) => {
                      const updated = [...galleryList];
                      updated[index] = { ...updated[index], subtitle: e.target.value };
                      setGalleryList(updated);
                    }}
                    className="w-full px-2.5 py-1 text-xs rounded-md border border-[#c5a059]/30 focus:border-[#775a19] focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <div className="flex-1">
                    <label className="block text-[9px] font-semibold uppercase text-stone-400 mb-0.5">
                      Largeur
                    </label>
                    <select
                      value={item.span || 'col-span-12 md:col-span-6'}
                      onChange={(e) => {
                        const updated = [...galleryList];
                        updated[index] = { ...updated[index], span: e.target.value };
                        setGalleryList(updated);
                      }}
                      className="w-full px-1.5 py-1 text-[11px] rounded-md border border-[#c5a059]/30 bg-white"
                    >
                      <option value="col-span-12 md:col-span-7">Large (7/12)</option>
                      <option value="col-span-12 md:col-span-6">Moyen (6/12)</option>
                      <option value="col-span-12 md:col-span-5">Étroit (5/12)</option>
                      <option value="col-span-12">Pleine (12/12)</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[9px] font-semibold uppercase text-stone-400 mb-0.5">
                      Cadrage
                    </label>
                    <select
                      value={item.aspect || 'aspect-[4/3]'}
                      onChange={(e) => {
                        const updated = [...galleryList];
                        updated[index] = { ...updated[index], aspect: e.target.value };
                        setGalleryList(updated);
                      }}
                      className="w-full px-1.5 py-1 text-[11px] rounded-md border border-[#c5a059]/30 bg-white"
                    >
                      <option value="aspect-[4/3]">4:3</option>
                      <option value="aspect-square">Carré 1:1</option>
                      <option value="aspect-[16/9]">16:9</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Quick Add Placeholder Card */}
          <button
            type="button"
            onClick={() => setIsAddingNewPhoto(true)}
            className="rounded-2xl border-2 border-dashed border-[#c5a059]/40 hover:border-[#775a19] bg-white/50 hover:bg-white p-6 flex flex-col items-center justify-center gap-2 min-h-[260px] text-stone-500 hover:text-[#775a19] transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-12 h-12 rounded-full bg-[#775a19]/10 group-hover:bg-[#775a19]/20 flex items-center justify-center text-[#775a19] transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-editorial text-base font-semibold">
              Ajouter une nouvelle photo
            </span>
            <span className="text-xs text-stone-400 text-center max-w-[200px]">
              Insérez un cliché supplémentaire pour enrichir l'album public.
            </span>
          </button>
        </div>
      </div>

      {/* Floating or Bottom Save bar */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#c5a059]/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#4e4639]">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Vos modifications sont immédiatement prises en compte après clic sur Sauvegarder.
          </span>
        </div>
        <button
          type="button"
          onClick={handleSaveAllPhotos}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{isSaving ? 'Enregistrement des photos...' : 'Enregistrer toutes les photos'}</span>
        </button>
      </div>

      {/* Lightbox Preview Modal */}
      {previewPhotoModal && (
        <div
          onClick={() => setPreviewPhotoModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={previewPhotoModal}
              alt="Aperçu"
              className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl border border-white/20"
            />
            <p className="text-white text-xs mt-3 bg-black/60 px-3 py-1 rounded-full">
              Cliquez n'importe où pour fermer
            </p>
          </div>
        </div>
      )}

      {/* Uploading & Persisting Progress Floating Indicator */}
      {uploadingTarget && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1b1c1a] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 border border-[#c5a059]/60 animate-bounce">
          <Loader2 className="w-5 h-5 text-[#c5a059] animate-spin shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white">Téléversement & Persistance en cours</p>
            <p className="text-[11px] text-stone-300">Écriture sur le disque serveur et synchronisation SQLite...</p>
          </div>
        </div>
      )}
    </div>
  );
};
