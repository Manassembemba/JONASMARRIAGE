export interface PersonProfile {
  fullName: string;
  shortName: string;
  role: string;
  photo: string;
  quote: string;
}

export interface WeddingDetails {
  groom: PersonProfile;
  bride: PersonProfile;
  centerQuote: string;
  centerSubtitle?: string; // e.g. "Pour le Meilleur et pour Toujours"
  dateString: string;
  dateFormatted: string;
  date1: string; // e.g. "Jeudi 29 Octobre 2026" (Mariage Civil)
  date2: string; // e.g. "Samedi 31 Octobre 2026" (Mariage Coutumier)
  targetDateTime: string; // ISO string e.g. 2026-10-29T11:00:00+01:00
  cityCountry: string; // e.g. KINSHASA, RDC
  announcementText: string;
  heroBadge?: string; // e.g. "Célébration Nuptiale Privée"
  heroTagline?: string; // e.g. "Deux âmes réunies pour l'éternité"
  storyIntroTitle?: string; // e.g. "Notre Histoire d'Amour — Le Destin de Jonas & Flora"
  storyIntroText?: string; // e.g. "Du premier regard échangé à l'engagement solennel..."
  programSubtitle?: string; // e.g. "Découvrez le déroulement chronologique..."
  emotionalQuote1?: string; // e.g. "« Une nouvelle aventure commence..."
  emotionalQuote2?: string; // e.g. "Et nous aimerions la partager avec vous. »"
  footerMessage?: string; // e.g. "Nous serions infiniment honorés..."
  monogramUrl: string;
  coupleHeroPhoto: string;
  musicUrl?: string; // URL Supabase de la musique de fond (mp3/wav)
}

export interface RSVPData {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  attendance: 'oui' | 'non';
  guests_count: number;
  guest_names?: string;
  message?: string;
  created_at: string;
  is_read?: boolean;
}

export interface GuestbookMessage {
  id: string;
  name: string;
  relation?: string;
  message: string;
  approved: boolean;
  created_at: string;
  is_read?: boolean;
}

export interface TimelineMilestone {
  title: string;
  subtitle: string;
  dateLabel?: string;
  description: string;
  icon: string;
}

export interface ProgramEvent {
  time: string;
  date?: string;
  title: string;
  type: string;
  location: string;
  address: string;
  landmarks?: string;
  mapUrl: string;
  icon: string;
  badge: string;
}

export interface VenueData {
  id: string;
  name: string;
  ceremony: string;
  date?: string;
  time: string;
  address: string;
  landmarks?: string;
  image: string;
  mapUrl: string;
  badge: string;
}

export interface DbStatus {
  isSqlite: boolean;
  dbPath: string;
  fileSize: string;
  rsvpsCount: number;
  guestbookCount: number;
  lastUpdated: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  span?: string;
  aspect?: string;
}
