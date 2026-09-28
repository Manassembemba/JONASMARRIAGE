import React, { useState } from 'react';
import { GiftPayment, GiftProvider } from '../types';
import {
  Gift,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Smartphone,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
} from 'lucide-react';
import { DEFAULT_GIFT_PAYMENTS } from '../data/weddingData';

interface AdminGiftManagerProps {
  giftPayments: GiftPayment[];
  onUpdateGiftPayments: (items: GiftPayment[]) => Promise<boolean>;
  showNotification: (msg: string) => void;
  openDeleteModal: (title: string, message: string, onConfirm: () => void | Promise<void>) => void;
}

export const AdminGiftManager: React.FC<AdminGiftManagerProps> = ({
  giftPayments,
  onUpdateGiftPayments,
  showNotification,
  openDeleteModal,
}) => {
  const [items, setItems] = useState<GiftPayment[]>(giftPayments || []);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state
  const [formProvider, setFormProvider] = useState<GiftProvider>('mpesa');
  const [formLabel, setFormLabel] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Sync when prop updates
  React.useEffect(() => {
    setItems(giftPayments || []);
  }, [giftPayments]);

  const handleStartAdd = () => {
    setIsEditingId(null);
    setFormProvider('mpesa');
    setFormLabel('M-Pesa (Vodacom)');
    setFormPhone('0823965480');
    setFormRecipient('Madikani Mbidi Jonas');
    setFormDescription('Bénédiction nuptiale & soutien financier');
    setFormIsActive(true);
    setIsAddingNew(true);
  };

  const handleStartEdit = (item: GiftPayment) => {
    setIsAddingNew(false);
    setIsEditingId(item.id);
    setFormProvider(item.provider);
    setFormLabel(item.label);
    setFormPhone(item.phone);
    setFormRecipient(item.recipientName);
    setFormDescription(item.description || '');
    setFormIsActive(item.isActive);
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setIsEditingId(null);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim() || !formPhone.trim() || !formRecipient.trim()) {
      showNotification('Veuillez remplir le libellé, le numéro de téléphone et le bénéficiaire.');
      return;
    }

    let updated: GiftPayment[];
    if (isEditingId) {
      updated = items.map((i) =>
        i.id === isEditingId
          ? {
              ...i,
              provider: formProvider,
              label: formLabel.trim(),
              phone: formPhone.trim(),
              recipientName: formRecipient.trim(),
              description: formDescription.trim() || undefined,
              isActive: formIsActive,
            }
          : i
      );
    } else {
      const newItem: GiftPayment = {
        id: `gift-${Date.now()}`,
        provider: formProvider,
        label: formLabel.trim(),
        phone: formPhone.trim(),
        recipientName: formRecipient.trim(),
        description: formDescription.trim() || undefined,
        isActive: formIsActive,
      };
      updated = [...items, newItem];
    }

    setItems(updated);
    setIsAddingNew(false);
    setIsEditingId(null);

    const ok = await onUpdateGiftPayments(updated);
    if (ok) {
      showNotification(
        isEditingId
          ? 'Rubrique de paiement modifiée avec succès.'
          : 'Nouvelle rubrique de paiement ajoutée avec succès.'
      );
    }
  };

  const handleToggleActive = async (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i));
    setItems(updated);
    await onUpdateGiftPayments(updated);
    showNotification('Statut de la rubrique mis à jour.');
  };

  const handleDelete = (item: GiftPayment) => {
    openDeleteModal(
      'Supprimer cette rubrique de paiement ?',
      `Voulez-vous vraiment retirer la rubrique « ${item.label} » (${item.phone}) ?`,
      async () => {
        const updated = items.filter((i) => i.id !== item.id);
        setItems(updated);
        await onUpdateGiftPayments(updated);
        showNotification('Rubrique de paiement supprimée.');
      }
    );
  };

  const handleResetDefaults = () => {
    openDeleteModal(
      'Rétablir les rubriques recommandées ?',
      'Cette action va rétablir les 3 canaux de paiement par défaut (M-Pesa, Orange Money, Airtel Money).',
      async () => {
        setItems(DEFAULT_GIFT_PAYMENTS);
        await onUpdateGiftPayments(DEFAULT_GIFT_PAYMENTS);
        showNotification('Rubriques par défaut rétablies.');
      }
    );
  };

  const getProviderBadge = (provider: GiftProvider) => {
    switch (provider) {
      case 'mpesa':
        return 'bg-red-600 text-white';
      case 'orange':
        return 'bg-orange-500 text-white';
      case 'airtel':
        return 'bg-red-800 text-white';
      default:
        return 'bg-[#775a19] text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-[#c5a059]/30 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#775a19]/10 flex items-center justify-center text-[#775a19] shrink-0 mt-0.5">
            <Gift className="w-5 h-5 text-[#775a19]" />
          </div>
          <div>
            <h3 className="font-editorial text-lg sm:text-xl text-[#1b1c1a] font-semibold flex items-center gap-2">
              Rubriques Cadeaux & Numéros de Paiement
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#775a19]/15 text-[#775a19] border border-[#c5a059]/30">
                {items.length} rubrique{items.length > 1 ? 's' : ''}
              </span>
            </h3>
            <p className="text-xs text-[#4e4639] mt-0.5">
              Gérez les numéros Mobile Money (M-PESA, Orange Money, Airtel Money) mis à disposition des invités pour leurs contributions et cadeaux.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleStartAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une rubrique</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#605e5c] hover:text-[#1b1c1a] transition-colors border border-stone-200 cursor-pointer"
            title="Rétablir les rubriques recommandées"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form: Add / Edit Modal / Inline */}
      {(isAddingNew || isEditingId) && (
        <form
          onSubmit={handleSaveForm}
          className="bg-white p-6 rounded-2xl border-2 border-[#775a19]/40 shadow-md space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-[#f0ebe3] pb-3">
            <h4 className="font-editorial text-base font-semibold text-[#1b1c1a] flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#775a19]" />
              <span>{isEditingId ? 'Modifier la rubrique de paiement' : 'Nouvelle rubrique de paiement'}</span>
            </h4>
            <button
              type="button"
              onClick={handleCancelForm}
              className="p-1 rounded-lg hover:bg-stone-100 text-[#605e5c]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Provider selection */}
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                Opérateur / Service
              </label>
              <select
                value={formProvider}
                onChange={(e) => {
                  const val = e.target.value as GiftProvider;
                  setFormProvider(val);
                  if (!isEditingId) {
                    if (val === 'mpesa') setFormLabel('M-Pesa (Vodacom)');
                    else if (val === 'orange') setFormLabel('Orange Money');
                    else if (val === 'airtel') setFormLabel('Airtel Money');
                    else setFormLabel('Autre moyen de paiement');
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#c5a059]/40 focus:border-[#775a19] focus:outline-hidden bg-white"
              >
                <option value="mpesa">M-PESA (Vodacom)</option>
                <option value="orange">Orange Money</option>
                <option value="airtel">Airtel Money</option>
                <option value="autre">Autre (Compte bancaire / Espèces)</option>
              </select>
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                Libellé public
              </label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="ex: M-Pesa (Vodacom)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#c5a059]/40 focus:border-[#775a19] focus:outline-hidden"
                required
              />
            </div>

            {/* Phone / Account Number */}
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                Numéro de Téléphone / Compte
              </label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="ex: 0823965480"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#c5a059]/40 focus:border-[#775a19] focus:outline-hidden font-mono"
                required
              />
            </div>

            {/* Recipient Name */}
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
                Nom du Titulaire / Bénéficiaire
              </label>
              <input
                type="text"
                value={formRecipient}
                onChange={(e) => setFormRecipient(e.target.value)}
                placeholder="ex: Madikani Mbidi Jonas"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#c5a059]/40 focus:border-[#775a19] focus:outline-hidden"
                required
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-[#1b1c1a]">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-[#c5a059] text-[#775a19] focus:ring-[#775a19] h-4 w-4"
                />
                <span>Visible pour les invités sur le site</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#1b1c1a] uppercase mb-1">
              Note ou instruction pour les invités (optionnelle)
            </label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="ex: Bénédiction pour le nouveau foyer des mariés"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#c5a059]/40 focus:border-[#775a19] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0ebe3]">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#605e5c] hover:bg-stone-100 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#775a19] hover:bg-[#5f4714] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEditingId ? 'Mettre à jour' : 'Enregistrer la rubrique'}</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              item.isActive
                ? 'bg-white border-[#c5a059]/30 shadow-xs'
                : 'bg-stone-50 border-stone-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getProviderBadge(
                    item.provider
                  )}`}
                >
                  {item.provider}
                </span>

                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 ${
                    item.isActive ? 'text-emerald-700' : 'text-stone-500'
                  }`}
                >
                  {item.isActive ? (
                    <>
                      <Eye className="w-3 h-3 text-emerald-600" />
                      <span>Actif</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-stone-400" />
                      <span>Masqué</span>
                    </>
                  )}
                </span>
              </div>

              <h4 className="font-editorial text-base font-semibold text-[#1b1c1a] mb-1">
                {item.label}
              </h4>

              <p className="font-mono text-base font-bold text-[#775a19] mb-1">
                {item.phone}
              </p>

              <p className="text-xs text-[#4e4639] font-medium mb-1">
                Bénéficiaire : <strong>{item.recipientName}</strong>
              </p>

              {item.description && (
                <p className="text-[11px] text-[#7f7667] italic mt-1 line-clamp-2">
                  « {item.description} »
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#f0ebe3] text-xs">
              <button
                type="button"
                onClick={() => handleToggleActive(item.id)}
                className="text-[11px] font-semibold text-[#775a19] hover:underline cursor-pointer"
              >
                {item.isActive ? 'Masquer' : 'Activer'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartEdit(item)}
                  className="p-1.5 rounded-lg text-[#775a19] hover:bg-[#775a19]/10 transition-colors cursor-pointer"
                  title="Modifier"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-dashed border-[#c5a059]/40 text-[#7f7667]">
            <Gift className="w-8 h-8 text-[#c5a059] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-[#1b1c1a]">Aucune rubrique de paiement configurée</p>
            <p className="text-xs mt-1">Cliquez sur « Ajouter une rubrique » pour créer un canal de réception (M-Pesa, Orange Money, Airtel Money).</p>
          </div>
        )}
      </div>
    </div>
  );
};
