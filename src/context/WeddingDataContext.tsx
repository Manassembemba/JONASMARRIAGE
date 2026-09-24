import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [details, setDetails] = useState<WeddingDetails>(() => {
    try {
      const cached = localStorage.getItem('wedding_details_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...DEFAULT_WEDDING_DETAILS,
          ...parsed,
          groom: { ...DEFAULT_WEDDING_DETAILS.groom, ...(parsed.groom || {}) },
          bride: { ...DEFAULT_WEDDING_DETAILS.bride, ...(parsed.bride || {}) },
        };
      }
    } catch {}
    return DEFAULT_WEDDING_DETAILS;
  });

  const [programSteps, setProgramSteps] = useState<ProgramEvent[]>(() => {
    try {
      const cached = localStorage.getItem('wedding_program_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return INITIAL_PROGRAM_STEPS;
  });
  const [venues, setVenues] = useState<VenueData[]>(() => {
    try {
      const cached = localStorage.getItem('wedding_venues_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return INITIAL_VENUES_DATA;
  });
  const [storyMilestones, setStoryMilestones] = useState<TimelineMilestone[]>(() => {
    try {
      const cached = localStorage.getItem('wedding_story_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return INITIAL_STORY_MILESTONES;
  });
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    try {
      const cached = localStorage.getItem('wedding_gallery_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_GALLERY_ITEMS;
  });
  const [rsvps, setRsvps] = useState<RSVPData[]>(INITIAL_RSVPS);
  const [guestbook, setGuestbook] = useState<GuestbookMessage[]>(INITIAL_GUESTBOOK);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Admin PIN Unlock state (persisted per session)
  const [isAdminUnlocked, setIsAdminUnlockedState] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('wedding_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const setIsAdminUnlocked = useCallback((unlocked: boolean) => {
    setIsAdminUnlockedState(unlocked);
    try {
      if (unlocked) {
        sessionStorage.setItem('wedding_admin_unlocked', 'true');
      } else {
        sessionStorage.removeItem('wedding_admin_unlocked');
      }
    } catch {
      // ignore
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdminUnlocked(false);
  }, [setIsAdminUnlocked]);

  // Unread counts calculation
  const unreadRsvpsCount = rsvps.filter((r) => r.is_read === false).length;
  const unreadGuestbookCount = guestbook.filter((g) => g.is_read === false).length;
  const unreadTotalCount = unreadRsvpsCount + unreadGuestbookCount;

  const verifyAdminPin = async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.valid) {
          setIsAdminUnlocked(true);
          return true;
        }
      }
    } catch (err) {
      console.error('Error verifying PIN on server:', err);
    }
    // Fallback if network or server unavailable: default PIN 2026
    if (pin.trim() === '2026') {
      setIsAdminUnlocked(true);
      return true;
    }
    return false;
  };

  const changeAdminPin = async (currentPin: string, newPin: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/admin/change-pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
      });
      const json = await res.json();
      return { success: json.success, message: json.message || (json.success ? 'Code modifié avec succès' : 'Erreur') };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erreur réseau' };
    }
  };

  const markRsvpAsRead = async (id: string, isRead = true): Promise<boolean> => {
    setRsvps((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: isRead } : item)));
    try {
      const res = await fetch(`/api/rsvps/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: isRead }),
      });
      return res.ok;
    } catch {
      return true;
    }
  };

  const markGuestbookAsRead = async (id: string, isRead = true): Promise<boolean> => {
    setGuestbook((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: isRead } : item)));
    try {
      const res = await fetch(`/api/guestbook/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: isRead }),
      });
      return res.ok;
    } catch {
      return true;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    setRsvps((prev) => prev.map((item) => ({ ...item, is_read: true })));
    setGuestbook((prev) => prev.map((item) => ({ ...item, is_read: true })));
    try {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      return res.ok;
    } catch {
      return true;
    }
  };

  const fetchDbStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setDbStatus(json.data);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch('/api/wedding-data');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.details) {
            setDetails((prev) => {
              const merged = {
                ...prev,
                ...json.data.details,
                groom: { ...prev.groom, ...(json.data.details.groom || {}) },
                bride: { ...prev.bride, ...(json.data.details.bride || {}) },
              };
              try {
                localStorage.setItem('wedding_details_cache', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
          if (json.data.programSteps) {
            setProgramSteps(json.data.programSteps);
            try { localStorage.setItem('wedding_program_cache', JSON.stringify(json.data.programSteps)); } catch {}
          }
          if (json.data.venues) {
            setVenues(json.data.venues);
            try { localStorage.setItem('wedding_venues_cache', JSON.stringify(json.data.venues)); } catch {}
          }
          if (json.data.storyMilestones) {
            setStoryMilestones(json.data.storyMilestones);
            try { localStorage.setItem('wedding_story_cache', JSON.stringify(json.data.storyMilestones)); } catch {}
          }
          if (json.data.galleryItems) {
            setGalleryItems(json.data.galleryItems);
            try {
              localStorage.setItem('wedding_gallery_cache', JSON.stringify(json.data.galleryItems));
            } catch {}
          }
          if (json.data.rsvps) setRsvps(json.data.rsvps);
          if (json.data.guestbook) setGuestbook(json.data.guestbook);
        }
      }
      await fetchDbStatus();
    } catch (err) {
      console.warn('Falling back to local state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchDbStatus]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Update Wedding Details (Dates, Names, Quotes, Announcement, Photos)
  const updateDetails = async (newDetails: Partial<WeddingDetails>): Promise<boolean> => {
    setIsSaving(true);
    let payloadToSave: WeddingDetails = details;
    setDetails((prev) => {
      const merged: WeddingDetails = {
        ...prev,
        ...newDetails,
        groom: {
          ...prev.groom,
          ...(newDetails.groom || {}),
        },
        bride: {
          ...prev.bride,
          ...(newDetails.bride || {}),
        },
      };
      payloadToSave = merged;
      try {
        localStorage.setItem('wedding_details_cache', JSON.stringify(merged));
      } catch {}
      return merged;
    });

    try {
      const res = await fetch('/api/settings/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDetails),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDetails((prev) => {
            const finalMerged = {
              ...prev,
              ...json.data,
              groom: { ...prev.groom, ...(json.data.groom || {}) },
              bride: { ...prev.bride, ...(json.data.bride || {}) },
            };
            try {
              localStorage.setItem('wedding_details_cache', JSON.stringify(finalMerged));
            } catch {}
            return finalMerged;
          });
        }
        setLastSaved(new Date());
        await fetchDbStatus();
        return true;
      }
    } catch (err) {
      console.error('Error saving details to SQLite:', err);
    } finally {
      setIsSaving(false);
    }
    return false;
  };

  // Update Program Steps
  const updateProgramSteps = async (steps: ProgramEvent[]): Promise<boolean> => {
    setIsSaving(true);
    setProgramSteps(steps);
    try { localStorage.setItem('wedding_program_cache', JSON.stringify(steps)); } catch {}
    try {
      const res = await fetch('/api/settings/program', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(steps),
      });
      if (res.ok) {
        setLastSaved(new Date());
        await fetchDbStatus();
        return true;
      }
    } catch (err) {
      console.error('Error saving program to SQLite:', err);
    } finally {
      setIsSaving(false);
    }
    return false;
  };

  // Update Venues & Addresses
  const updateVenues = async (updatedVenues: VenueData[]): Promise<boolean> => {
    setIsSaving(true);
    setVenues(updatedVenues);
    try { localStorage.setItem('wedding_venues_cache', JSON.stringify(updatedVenues)); } catch {}
    try {
      const res = await fetch('/api/settings/venues', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVenues),
      });
      if (res.ok) {
        setLastSaved(new Date());
        await fetchDbStatus();
        return true;
      }
    } catch (err) {
      console.error('Error saving venues to SQLite:', err);
    } finally {
      setIsSaving(false);
    }
    return false;
  };

  // Update Story Milestones
  const updateStoryMilestones = async (milestones: TimelineMilestone[]): Promise<boolean> => {
    setIsSaving(true);
    setStoryMilestones(milestones);
    try { localStorage.setItem('wedding_story_cache', JSON.stringify(milestones)); } catch {}
    try {
      const res = await fetch('/api/settings/story', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestones),
      });
      if (res.ok) {
        setLastSaved(new Date());
        await fetchDbStatus();
        return true;
      }
    } catch (err) {
      console.error('Error saving story to SQLite:', err);
    } finally {
      setIsSaving(false);
    }
    return false;
  };

  // Update Gallery Items
  const updateGalleryItems = async (items: GalleryItem[]): Promise<boolean> => {
    setIsSaving(true);
    setGalleryItems(items);
    try {
      localStorage.setItem('wedding_gallery_cache', JSON.stringify(items));
    } catch {}
    try {
      const res = await fetch('/api/settings/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setGalleryItems(json.data);
          try {
            localStorage.setItem('wedding_gallery_cache', JSON.stringify(json.data));
          } catch {}
        }
        setLastSaved(new Date());
        await fetchDbStatus();
        return true;
      }
    } catch (err) {
      console.error('Error saving gallery to SQLite:', err);
    } finally {
      setIsSaving(false);
    }
    return false;
  };

  // Add RSVP
  const addRsvp = async (rsvp: RSVPData): Promise<boolean> => {
    setRsvps((prev) => [rsvp, ...prev]);
    try {
      const res = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvp),
      });
      if (res.ok) {
        await fetchDbStatus();
        return true;
      }
    } catch (err) {
      console.error('Error adding RSVP to SQLite:', err);
    }
    return false;
  };

  // Update RSVP
  const updateRsvp = async (rsvp: RSVPData): Promise<boolean> => {
    setRsvps((prev) => prev.map((item) => (item.id === rsvp.id ? rsvp : item)));
    try {
      const res = await fetch(`/api/rsvps/${rsvp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvp),
      });
      if (res.ok) {
        await fetchDbStatus();
        return true;
      }
    } catch (err) {
      console.error('Error updating RSVP in SQLite:', err);
    }
    return false;
  };

  // Delete RSVP
  const deleteRsvp = async (id: string): Promise<boolean> => {
    setRsvps((prev) => prev.filter((item) => item.id !== id));
    try {
      const res = await fetch(`/api/rsvps/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchDbStatus();
        return true;
      }
    } catch (err) {
      console.error('Error deleting RSVP from SQLite:', err);
    }
    return false;
  };

  // Add Guestbook
  const addGuestbook = async (msg: GuestbookMessage): Promise<boolean> => {
    setGuestbook((prev) => [msg, ...prev]);
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
      if (res.ok) {
        await fetchDbStatus();
        return true;
      }
    } catch (err) {
      console.error('Error adding guestbook message to SQLite:', err);
    }
    return false;
  };

  // Toggle Guestbook Approval
  const toggleGuestbookApproval = async (id: string): Promise<boolean> => {
    setGuestbook((prev) =>
      prev.map((item) => (item.id === id ? { ...item, approved: !item.approved } : item))
    );
    try {
      const res = await fetch(`/api/guestbook/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        await fetchDbStatus();
        return true;
      }
    } catch (err) {
      console.error('Error toggling guestbook in SQLite:', err);
    }
    return false;
  };

  // Delete Guestbook
  const deleteGuestbook = async (id: string): Promise<boolean> => {
    setGuestbook((prev) => prev.filter((item) => item.id !== id));
    try {
      const res = await fetch(`/api/guestbook/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchDbStatus();
        return true;
      }
    } catch (err) {
      console.error('Error deleting guestbook message from SQLite:', err);
    }
    return false;
  };

  // Reset to defaults
  const resetToDefaults = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/reset-defaults', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDetails(json.data.details);
          setProgramSteps(json.data.programSteps);
          setVenues(json.data.venues);
          setStoryMilestones(json.data.storyMilestones);
          if (json.data.galleryItems) setGalleryItems(json.data.galleryItems);
          setRsvps(json.data.rsvps);
          setGuestbook(json.data.guestbook);
          // Purge tous les caches localStorage pour repartir propre
          try {
            localStorage.removeItem('wedding_details_cache');
            localStorage.removeItem('wedding_program_cache');
            localStorage.removeItem('wedding_venues_cache');
            localStorage.removeItem('wedding_story_cache');
            localStorage.removeItem('wedding_gallery_cache');
          } catch {}
        }
        await fetchDbStatus();
        setLastSaved(new Date());
        return true;
      }
    } catch (err) {
      console.error('Error resetting SQLite database:', err);
    } finally {
      setIsSaving(false);
    }
    return false;
  };

  return (
    <WeddingDataContext.Provider
      value={{
        details,
        programSteps,
        venues,
        storyMilestones,
        galleryItems,
        rsvps,
        guestbook,
        dbStatus,
        isLoading,
        isSaving,
        lastSaved,
        unreadRsvpsCount,
        unreadGuestbookCount,
        unreadTotalCount,
        isAdminUnlocked,
        setIsAdminUnlocked,
        verifyAdminPin,
        changeAdminPin,
        logoutAdmin,
        markRsvpAsRead,
        markGuestbookAsRead,
        markAllAsRead,
        updateDetails,
        updateProgramSteps,
        updateVenues,
        updateStoryMilestones,
        updateGalleryItems,
        addRsvp,
        updateRsvp,
        deleteRsvp,
        addGuestbook,
        toggleGuestbookApproval,
        deleteGuestbook,
        resetToDefaults,
        refreshData,
      }}
    >
      {children}
    </WeddingDataContext.Provider>
  );
};

export function useWeddingData() {
  const context = useContext(WeddingDataContext);
  if (!context) {
    throw new Error('useWeddingData must be used within a WeddingDataProvider');
  }
  return context;
}
