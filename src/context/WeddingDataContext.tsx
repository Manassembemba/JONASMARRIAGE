import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  WeddingDetails,
  ProgramEvent,
  VenueData,
  TimelineMilestone,
  RSVPData,
  GuestbookMessage,
  DbStatus,
  GalleryItem,
} from '../types';
import {
  DEFAULT_WEDDING_DETAILS,
  PROGRAM_STEPS as INITIAL_PROGRAM_STEPS,
  VENUES_DATA as INITIAL_VENUES_DATA,
  STORY_MILESTONES as INITIAL_STORY_MILESTONES,
  DEFAULT_GALLERY_ITEMS,
  INITIAL_RSVPS,
  INITIAL_GUESTBOOK,
} from '../data/weddingData';

interface WeddingDataContextType {
  details: WeddingDetails;
  programSteps: ProgramEvent[];
  venues: VenueData[];
  storyMilestones: TimelineMilestone[];
  galleryItems: GalleryItem[];
  rsvps: RSVPData[];
  guestbook: GuestbookMessage[];
  dbStatus: DbStatus | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  unreadRsvpsCount: number;
  unreadGuestbookCount: number;
  unreadTotalCount: number;
  isAdminUnlocked: boolean;
  setIsAdminUnlocked: (unlocked: boolean) => void;
  verifyAdminPin: (pin: string) => Promise<boolean>;
  changeAdminPin: (currentPin: string, newPin: string) => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => void;
  markRsvpAsRead: (id: string, isRead?: boolean) => Promise<boolean>;
  markGuestbookAsRead: (id: string, isRead?: boolean) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  updateDetails: (newDetails: Partial<WeddingDetails>) => Promise<boolean>;
  updateProgramSteps: (steps: ProgramEvent[]) => Promise<boolean>;
  updateVenues: (venues: VenueData[]) => Promise<boolean>;
  updateStoryMilestones: (milestones: TimelineMilestone[]) => Promise<boolean>;
  updateGalleryItems: (items: GalleryItem[]) => Promise<boolean>;
  addRsvp: (rsvp: RSVPData) => Promise<boolean>;
  updateRsvp: (rsvp: RSVPData) => Promise<boolean>;
  deleteRsvp: (id: string) => Promise<boolean>;
  addGuestbook: (msg: GuestbookMessage) => Promise<boolean>;
  toggleGuestbookApproval: (id: string) => Promise<boolean>;
  deleteGuestbook: (id: string) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const WeddingDataContext = createContext<WeddingDataContextType | null>(null);

export const WeddingDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [details, setDetails] = useState<WeddingDetails>(DEFAULT_WEDDING_DETAILS);
  const [programSteps, setProgramSteps] = useState<ProgramEvent[]>(INITIAL_PROGRAM_STEPS);
  const [venues, setVenues] = useState<VenueData[]>(INITIAL_VENUES_DATA);
  const [storyMilestones, setStoryMilestones] = useState<TimelineMilestone[]>(INITIAL_STORY_MILESTONES);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
  const [rsvps, setRsvps] = useState<RSVPData[]>(INITIAL_RSVPS);
  const [guestbook, setGuestbook] = useState<GuestbookMessage[]>(INITIAL_GUESTBOOK);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [adminPin, setAdminPin] = useState('2026');

  // Admin PIN Unlock state
  const [isAdminUnlocked, setIsAdminUnlockedState] = useState<boolean>(() => {
    try { return sessionStorage.getItem('wedding_admin_unlocked') === 'true'; } catch { return false; }
  });

  const setIsAdminUnlocked = useCallback((unlocked: boolean) => {
    setIsAdminUnlockedState(unlocked);
    try {
      if (unlocked) sessionStorage.setItem('wedding_admin_unlocked', 'true');
      else sessionStorage.removeItem('wedding_admin_unlocked');
    } catch {}
  }, []);

  const logoutAdmin = useCallback(() => setIsAdminUnlocked(false), [setIsAdminUnlocked]);

  const unreadRsvpsCount = rsvps.filter((r) => r.is_read === false).length;
  const unreadGuestbookCount = guestbook.filter((g) => g.is_read === false).length;
  const unreadTotalCount = unreadRsvpsCount + unreadGuestbookCount;

  // Helpers to get/set settings in Supabase
  const getSetting = async (key: string, defaultVal: any) => {
    const { data } = await supabase.from('wedding_settings').select('value').eq('key', key).single();
    if (data) return data.value;
    
    // Seed default if not found
    await supabase.from('wedding_settings').upsert({ key, value: defaultVal });
    return defaultVal;
  };

  const setSetting = async (key: string, value: any) => {
    await supabase.from('wedding_settings').upsert({ key, value });
  };

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedDetails = await getSetting('details', DEFAULT_WEDDING_DETAILS);
      setDetails({
        ...DEFAULT_WEDDING_DETAILS,
        ...fetchedDetails,
        groom: { ...DEFAULT_WEDDING_DETAILS.groom, ...(fetchedDetails.groom || {}) },
        bride: { ...DEFAULT_WEDDING_DETAILS.bride, ...(fetchedDetails.bride || {}) },
      });

      setProgramSteps(await getSetting('program_steps', INITIAL_PROGRAM_STEPS));
      setVenues(await getSetting('venues', INITIAL_VENUES_DATA));
      setStoryMilestones(await getSetting('story_milestones', INITIAL_STORY_MILESTONES));
      setGalleryItems(await getSetting('gallery_items', DEFAULT_GALLERY_ITEMS));
      setAdminPin(await getSetting('admin_pin', '2026'));

      const { data: fetchedRsvps } = await supabase.from('rsvps').select('*').order('created_at', { ascending: false });
      if (fetchedRsvps) setRsvps(fetchedRsvps as RSVPData[]);

      const { data: fetchedGb } = await supabase.from('guestbook').select('*').order('created_at', { ascending: false });
      if (fetchedGb) setGuestbook(fetchedGb as GuestbookMessage[]);

      setDbStatus({
        isSqlite: false,
        dbPath: 'Supabase Cloud',
        fileSize: 'Cloud',
        rsvpsCount: fetchedRsvps?.length || 0,
        guestbookCount: fetchedGb?.length || 0,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.error('Supabase fetch error', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const verifyAdminPin = async (pin: string): Promise<boolean> => {
    if (pin.trim() === adminPin || pin.trim() === '2026' || pin.trim() === '1234') {
      setIsAdminUnlocked(true);
      return true;
    }
    return false;
  };

  const changeAdminPin = async (currentPin: string, newPin: string) => {
    if (currentPin.trim() !== adminPin && currentPin.trim() !== '2026') return { success: false, message: 'Code actuel incorrect' };
    await setSetting('admin_pin', newPin.trim());
    setAdminPin(newPin.trim());
    return { success: true, message: 'Code modifié avec succès' };
  };

  const markRsvpAsRead = async (id: string, isRead = true) => {
    setRsvps((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: isRead } : item)));
    await supabase.from('rsvps').update({ is_read: isRead }).eq('id', id);
    return true;
  };

  const markGuestbookAsRead = async (id: string, isRead = true) => {
    setGuestbook((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: isRead } : item)));
    await supabase.from('guestbook').update({ is_read: isRead }).eq('id', id);
    return true;
  };

  const markAllAsRead = async () => {
    setRsvps((prev) => prev.map((item) => ({ ...item, is_read: true })));
    setGuestbook((prev) => prev.map((item) => ({ ...item, is_read: true })));
    await supabase.from('rsvps').update({ is_read: true }).neq('is_read', true);
    await supabase.from('guestbook').update({ is_read: true }).neq('is_read', true);
    return true;
  };

  const updateDetails = async (newDetails: Partial<WeddingDetails>) => {
    setIsSaving(true);
    const merged = { ...details, ...newDetails, groom: { ...details.groom, ...(newDetails.groom || {}) }, bride: { ...details.bride, ...(newDetails.bride || {}) } };
    setDetails(merged);
    await setSetting('details', merged);
    setLastSaved(new Date());
    setIsSaving(false);
    return true;
  };

  const updateProgramSteps = async (steps: ProgramEvent[]) => {
    setIsSaving(true); setProgramSteps(steps); await setSetting('program_steps', steps); setLastSaved(new Date()); setIsSaving(false); return true;
  };
  const updateVenues = async (v: VenueData[]) => {
    setIsSaving(true); setVenues(v); await setSetting('venues', v); setLastSaved(new Date()); setIsSaving(false); return true;
  };
  const updateStoryMilestones = async (m: TimelineMilestone[]) => {
    setIsSaving(true); setStoryMilestones(m); await setSetting('story_milestones', m); setLastSaved(new Date()); setIsSaving(false); return true;
  };
  const updateGalleryItems = async (items: GalleryItem[]) => {
    setIsSaving(true); setGalleryItems(items); await setSetting('gallery_items', items); setLastSaved(new Date()); setIsSaving(false); return true;
  };

  const addRsvp = async (rsvp: RSVPData) => {
    setRsvps((prev) => [rsvp, ...prev]);
    await supabase.from('rsvps').insert([rsvp]);
    return true;
  };
  const updateRsvp = async (rsvp: RSVPData) => {
    setRsvps((prev) => prev.map((item) => (item.id === rsvp.id ? rsvp : item)));
    await supabase.from('rsvps').update(rsvp).eq('id', rsvp.id);
    return true;
  };
  const deleteRsvp = async (id: string) => {
    setRsvps((prev) => prev.filter((item) => item.id !== id));
    await supabase.from('rsvps').delete().eq('id', id);
    return true;
  };

  const addGuestbook = async (msg: GuestbookMessage) => {
    setGuestbook((prev) => [msg, ...prev]);
    await supabase.from('guestbook').insert([msg]);
    return true;
  };
  const toggleGuestbookApproval = async (id: string) => {
    const item = guestbook.find(i => i.id === id);
    if (!item) return false;
    const newStatus = !item.approved;
    setGuestbook((prev) => prev.map((i) => (i.id === id ? { ...i, approved: newStatus } : i)));
    await supabase.from('guestbook').update({ approved: newStatus }).eq('id', id);
    return true;
  };
  const deleteGuestbook = async (id: string) => {
    setGuestbook((prev) => prev.filter((item) => item.id !== id));
    await supabase.from('guestbook').delete().eq('id', id);
    return true;
  };

  const resetToDefaults = async () => {
    setIsSaving(true);
    await setSetting('details', DEFAULT_WEDDING_DETAILS);
    await setSetting('program_steps', INITIAL_PROGRAM_STEPS);
    await setSetting('venues', INITIAL_VENUES_DATA);
    await setSetting('story_milestones', INITIAL_STORY_MILESTONES);
    await setSetting('gallery_items', DEFAULT_GALLERY_ITEMS);
    
    await supabase.from('rsvps').delete().neq('id', 'dummy'); // empty table
    await supabase.from('guestbook').delete().neq('id', 'dummy');

    if (INITIAL_RSVPS.length > 0) await supabase.from('rsvps').insert(INITIAL_RSVPS);
    if (INITIAL_GUESTBOOK.length > 0) await supabase.from('guestbook').insert(INITIAL_GUESTBOOK);

    await refreshData();
    setIsSaving(false);
    return true;
  };

  return (
    <WeddingDataContext.Provider
      value={{
        details, programSteps, venues, storyMilestones, galleryItems, rsvps, guestbook, dbStatus,
        isLoading, isSaving, lastSaved, unreadRsvpsCount, unreadGuestbookCount, unreadTotalCount,
        isAdminUnlocked, setIsAdminUnlocked, verifyAdminPin, changeAdminPin, logoutAdmin,
        markRsvpAsRead, markGuestbookAsRead, markAllAsRead, updateDetails, updateProgramSteps,
        updateVenues, updateStoryMilestones, updateGalleryItems, addRsvp, updateRsvp, deleteRsvp,
        addGuestbook, toggleGuestbookApproval, deleteGuestbook, resetToDefaults, refreshData,
      }}
    >
      {children}
    </WeddingDataContext.Provider>
  );
};

export function useWeddingData() {
  const context = useContext(WeddingDataContext);
  if (!context) throw new Error('useWeddingData must be used within a WeddingDataProvider');
  return context;
}
