import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

// Define data path
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'wedding.sqlite');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_FILE);
    initDatabase(dbInstance);
  }
  return dbInstance;
}

// Initial defaults to seed the SQLite database
const DEFAULT_WEDDING_DETAILS = {
  groom: {
    fullName: 'Madikani Mbidi Jonas',
    shortName: 'Jonas',
    role: 'Le Marié',
    photo: '/assets/groom_jonas.jpg',
    quote: '« Dès le premier instant où nos regards se sont croisés, j\'ai su que mon cœur avait enfin trouvé son havre de paix. Flora incarne l\'élégance, la force et la douceur infinie avec laquelle je souhaite bâtir chaque lendemain de ma vie. »',
  },
  bride: {
    fullName: 'Matelo Sanga Flora',
    shortName: 'Flora',
    role: 'La Mariée',
    photo: '/assets/bride_flora.jpg',
    quote: '« Jonas est mon roc, mon confident et mon plus bel allié. Sa générosité d\'esprit et sa foi illuminent mon quotidien. C\'est avec une fierté immense et une joie incommensurable que je lui confie ma main et ma destinée. »',
  },
  centerQuote: 'Deux cœurs, une promesse, une nouvelle histoire à écrire ensemble.',
  centerSubtitle: 'Pour le Meilleur et pour Toujours',
  dateString: '29 & 31 octobre 2026',
  dateFormatted: '29 & 31 Octobre 2026',
  targetDateTime: '2026-10-29T11:00:00+01:00', // Kinshasa time GMT+1
  cityCountry: 'KINSHASA, RDC',
  announcementText: 'Nous avons le bonheur de vous annoncer notre mariage',
  heroBadge: 'Célébration Nuptiale Privée',
  heroTagline: 'Deux âmes réunies pour l\'éternité',
  storyIntroTitle: 'Notre Histoire d\'Amour — Le Destin de Jonas & Flora',
  storyIntroText: 'Du premier regard échangé à l\'engagement solennel, chaque chapitre a tissé le fil doré de notre union.',
  programSubtitle: 'Découvrez le déroulement chronologique de nos cérémonies consacrées à l\'amour, à la loi républicaine et aux traditions ancestrales.',
  emotionalQuote1: '« Une nouvelle aventure commence...',
  emotionalQuote2: 'Et nous aimerions la partager avec vous. »',
  footerMessage: 'Nous serions infiniment honorés de votre présence pour célébrer notre union et écrire ensemble les premières pages de notre nouvelle vie.',
  monogramUrl: '/assets/monogram_jf.svg',
  coupleHeroPhoto: '/assets/couple_photo.jpg',
};

const DEFAULT_PROGRAM_STEPS = [
  {
    time: '11H00 (Accueil dès 10h30)',
    date: 'Jeudi 29 Octobre 2026',
    title: 'Mariage Civil',
    type: 'Cérémonie Républicaine',
    location: 'Maison Communale de Lemba',
    address: 'Avenue Kadjeke n° 1 Bis, Quartier Commercial, Commune de Lemba',
    landmarks: 'Ville-Province de Kinshasa • Accueil dès 10h30',
    mapUrl: 'https://maps.google.com/?q=Maison+Communale+de+Lemba+Kinshasa',
    icon: 'civile',
    badge: '① MARIAGE CIVIL • 29 OCTOBRE',
  },
  {
    time: '15H00 — 19H45',
    date: 'Samedi 31 Octobre 2026',
    title: 'Mariage Coutumier',
    type: 'Cérémonie Traditionnelle & Réception',
    location: 'Résidence familiale',
    address: 'Avenue Bolia n°15, Quartier Mpasa 1, Commune de la N\'sele',
    landmarks: 'Arrêt : 3 Paillote • Référence : KIN MARCHE',
    mapUrl: 'https://maps.google.com/?q=Mpasa+1+Nsele+Kinshasa',
    icon: 'coutumier',
    badge: '② MARIAGE COUTUMIER • 31 OCTOBRE',
  },
];

const DEFAULT_VENUES = [
  {
    id: 'lemba',
    name: 'Maison Communale de Lemba',
    ceremony: 'Mariage Civil',
    date: 'Jeudi 29 Octobre 2026',
    time: '11h00 (Accueil dès 10h30)',
    address: 'Avenue Kadjeke n° 1 Bis, Quartier Commercial, Commune de Lemba, Kinshasa',
    landmarks: 'Ville-Province de Kinshasa • Parking disponible sur place',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxe-SXv_fEG3Avy-LSg6eWU7U0c9foXio-8VQfHr686MibmmPLdBhImHnFqoOGDbtNNg4pJphBOOMrRghPKXU2vjELMU3yJiTZb4c7R44RQd_FTaZjfgCsHy1qMrr2VKfeZeYsOdYi-nHCFzjPCYxDmzn-RRdzvfoUXnpFG-ZP8doJzQLhRggqPAMB-Q9ihnZJ6BL1JruUim1sMI9lY8VA33qtpkXCGnrLTT-gzIfWdFeJCnNcMgqg',
    mapUrl: 'https://maps.google.com/?q=Maison+Communale+de+Lemba+Kinshasa',
    badge: 'Étape 1 • 29 Octobre',
  },
  {
    id: 'nsele',
    name: 'Résidence Familiale — N\'sele',
    ceremony: 'Mariage Coutumier & Réception',
    date: 'Samedi 31 Octobre 2026',
    time: '15h00 — 19h45',
    address: 'Avenue Bolia n°15, Quartier Mpasa 1, Commune de la N\'sele, Kinshasa',
    landmarks: 'Arrêt : 3 Paillote • Réf. : KIN MARCHE',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeBEUHWnrkQJGVOIogNp9ZZdcHVLRtkLRHEdR__egf_g16A6503IbwyOr1LEwMnSVwoZHU0khujO74_UxDFoDa6_pY8Ug1_IqtXbab6lSkKHCqZP1MoYr0W1pGPhZmObZXnUMc3_oJsHtUR70K95qGZtkQTvMsxk4KjgCfyjmh3X4b_zapq3_jNXBFJUyUH9dZWtJgIIuyxIhyOcV958OmtbArqdbR15rON3lgaAYnY8N87ggxCWAC',
    mapUrl: 'https://maps.google.com/?q=Mpasa+1+Nsele+Kinshasa',
    badge: 'Étape 2 • 31 Octobre',
  },
];

const DEFAULT_STORY_MILESTONES = [
  {
    title: 'Notre Rencontre',
    subtitle: 'Chapitre I — Le Premier Regard',
    description: 'Le premier regard, les premiers instants inoubliables où le temps semblait s\'être suspendu. Une conversation impromptue qui a allumé une étincelle sincère et réciproque, le prélude discret d\'un attachement profond.',
    icon: '✦',
  },
  {
    title: 'Notre Histoire',
    subtitle: 'Chapitre II — L\'Épanouissement',
    description: 'Les voyages partagés, les fous rires complices, les épreuves surmontées main dans la main. Mois après mois, notre complicité s\'est fortifiée au gré de projets ambitieux et d\'une tendresse inaltérable.',
    icon: '✦',
  },
  {
    title: 'La Décision',
    subtitle: 'Chapitre III — Le Serment',
    description: 'La promesse solennelle, la demande en mariage et l\'engagement d\'une vie entière à deux. Une décision prise avec le cœur, bénie par la certitude d\'être faits l\'un pour l\'autre.',
    icon: '✦',
  },
  {
    title: '29 Octobre 2026',
    subtitle: 'L\'Apogée — Notre Mariage',
    description: 'Le jour sacré où nous unissons nos destins devant Dieu, nos familles bien-aimées et nos amis les plus chers. Une journée de festivités gravée pour toujours dans nos cœurs.',
    icon: '✦',
  },
];

const DEFAULT_GALLERY_ITEMS = [
  {
    id: 'couple-main',
    title: 'Jonas & Flora — Ensemble vers le Grand Jour',
    subtitle: 'Kinshasa • 2026',
    url: '/assets/couple_photo.jpg',
    span: 'col-span-12 md:col-span-7',
    aspect: 'aspect-[4/3]',
  },
  {
    id: 'couple-embrace',
    title: 'La Promesse et l\'Alliance',
    subtitle: 'Deux cœurs, un serment éternel',
    url: '/assets/couple_embrace.jpg',
    span: 'col-span-12 md:col-span-5',
    aspect: 'aspect-square',
  },
  {
    id: 'flora-portrait',
    title: 'La Grâce et La Douceur',
    subtitle: 'Flora la mariée',
    url: '/assets/bride_flora.jpg',
    span: 'col-span-12 md:col-span-6',
    aspect: 'aspect-square',
  },
  {
    id: 'jonas-portrait',
    title: 'Force et Dévouement',
    subtitle: 'Jonas le marié',
    url: '/assets/groom_jonas.jpg',
    span: 'col-span-12 md:col-span-6',
    aspect: 'aspect-square',
  },
  {
    id: 'rings-macro',
    title: 'Alliances & Écrin d\'Or',
    subtitle: 'Symbole du serment éternel',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAynKpSp_sTB2l3o6wakFf7M0soHi7DoXJIzmZ3J0bLn0-QKcRAeUdtM1Zy3SLnent0njmpR3hzfrQQ1_7OnSGkKjw41xLZ1wV4jV2E64ecV6Lcquk1zhCsIfc1zBlDT7KPks7vPkdYMaopKeIM4tImNcFUXBCt8NIZR9HNfb2z3t8duTnx9bYkUv4Z2nAVCyDk25QxEroNNVUgYl5BWU7WuQad9dT_CvMljEs-XhnCsZDe86GwTK2',
    span: 'col-span-12 md:col-span-6',
    aspect: 'aspect-[16/9]',
  },
  {
    id: 'flowers-bouquet',
    title: 'Fleurs & Précieux Atours',
    subtitle: 'Bouquet nuptial champêtre et raffiné',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD86_3_xzTSkFc4BNk4clm3v4ACKQMghwprCSCqhNBXRcnUO9wI7ue3_IQP5M8emOxNqiz1kkGTEpNfFm2uyI8TjlqENTHpbFlBhboyPvIxkCthPZqpeb4go4UtiHjSG7gqnX3ZC9N-oKycmM7NjWvDFBdLg-os1R0_wI5YOUP2QBZK6BonG_SCs7-LkvRmDxYSm4j6HsK8liTr_oj4CqBROk15kZYJjuLKhrVB_0ngiTm7qiSoBZ91',
    span: 'col-span-12 md:col-span-6',
    aspect: 'aspect-[16/9]',
  },
];

const DEFAULT_INITIAL_RSVPS = [
  {
    id: 'rsvp-1',
    full_name: 'Dr. Mukendi Patrick & Épouse',
    phone: '+243 81 234 5678',
    email: 'mukendi.patrick@gmail.com',
    attendance: 'oui',
    guests_count: 2,
    guest_names: 'Dr. Mukendi Patrick, Mme Claudine Mukendi',
    message: 'Nous serons présents avec une immense allégresse pour célébrer votre amour.',
    created_at: '2026-09-14T10:00:00Z',
  },
  {
    id: 'rsvp-2',
    full_name: 'Mlle Christelle Matelo',
    phone: '+243 89 876 5432',
    email: 'christelle.matelo@yahoo.fr',
    attendance: 'oui',
    guests_count: 1,
    guest_names: '',
    message: 'Ma petite sœur adorée, le grand jour arrive ! Tellement fière de vous deux !',
    created_at: '2026-09-15T16:45:00Z',
  },
  {
    id: 'rsvp-3',
    full_name: 'M. Eric Tshilumba',
    phone: '+243 82 555 1234',
    email: 'e.tshilumba@hotmail.com',
    attendance: 'non',
    guests_count: 0,
    guest_names: '',
    message: 'Toutes mes félicitations aux futurs mariés. Je serai en mission professionnelle mais de tout cœur avec vous !',
    created_at: '2026-09-16T11:20:00Z',
  },
];

const DEFAULT_INITIAL_GUESTBOOK = [
  {
    id: 'gb-1',
    name: 'Famille Mbidi & Alliés',
    relation: 'Kinshasa',
    message: 'Toutes nos félicitations aux heureux mariés. Que votre union soit remplie d\'amour, de bonheur, de santé et de prospérité éternelle. Que la paix divine repose sur votre foyer !',
    approved: 1,
    created_at: '2026-09-15T14:30:00Z',
  },
  {
    id: 'gb-2',
    name: 'Sarah & David M.',
    relation: 'Amis d\'enfance',
    message: 'Vous formez un couple tout simplement radieux et exemplaire. Hâte de danser et de célébrer ce jour sacré à vos côtés le 29 octobre ! Jonas & Flora, soyez bénis ! ❤️',
    approved: 1,
    created_at: '2026-09-16T18:20:00Z',
  },
  {
    id: 'gb-3',
    name: 'Pasteur Emmanuel & Épouse',
    relation: 'Guides spirituels',
    message: '« La corde à trois fils ne se rompt pas facilement ». Que l\'Éternel soit au centre de votre foyer jour après jour.',
    approved: 1,
    created_at: '2026-09-17T09:15:00Z',
  },
];

function initDatabase(db: DatabaseSync) {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS wedding_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rsvps (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      attendance TEXT NOT NULL,
      guests_count INTEGER NOT NULL DEFAULT 1,
      guest_names TEXT,
      message TEXT,
      created_at TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS guestbook (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      relation TEXT,
      message TEXT NOT NULL,
      approved INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Migration: ensure is_read column exists in existing tables
  try {
    db.exec('ALTER TABLE rsvps ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0');
  } catch {
    // Column already exists
  }
  try {
    db.exec('ALTER TABLE guestbook ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0');
  } catch {
    // Column already exists
  }

  // Seed settings if empty
  const getSettingStmt = db.prepare('SELECT value FROM wedding_settings WHERE key = ?');
  const setSettingStmt = db.prepare('INSERT OR REPLACE INTO wedding_settings (key, value) VALUES (?, ?)');

  if (!getSettingStmt.get('details')) {
    setSettingStmt.run('details', JSON.stringify(DEFAULT_WEDDING_DETAILS));
  }
  if (!getSettingStmt.get('program_steps')) {
    setSettingStmt.run('program_steps', JSON.stringify(DEFAULT_PROGRAM_STEPS));
  }
  if (!getSettingStmt.get('venues')) {
    setSettingStmt.run('venues', JSON.stringify(DEFAULT_VENUES));
  }
  if (!getSettingStmt.get('story_milestones')) {
    setSettingStmt.run('story_milestones', JSON.stringify(DEFAULT_STORY_MILESTONES));
  }
  if (!getSettingStmt.get('gallery_items')) {
    setSettingStmt.run('gallery_items', JSON.stringify(DEFAULT_GALLERY_ITEMS));
  }
  if (!getSettingStmt.get('admin_pin')) {
    setSettingStmt.run('admin_pin', '2026');
  }

  // Seed rsvps if empty
  const countRsvps = db.prepare('SELECT COUNT(*) as cnt FROM rsvps').get() as { cnt: number };
  if (countRsvps && countRsvps.cnt === 0) {
    const insertRsvp = db.prepare(`
      INSERT INTO rsvps (id, full_name, phone, email, attendance, guests_count, guest_names, message, created_at, is_read)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    // Seed with 1 unread RSVP to showcase the notification badge immediately
    for (let i = 0; i < DEFAULT_INITIAL_RSVPS.length; i++) {
      const r = DEFAULT_INITIAL_RSVPS[i];
      const isUnread = i === DEFAULT_INITIAL_RSVPS.length - 1 ? 0 : 1;
      insertRsvp.run(r.id, r.full_name, r.phone, r.email, r.attendance, r.guests_count, r.guest_names, r.message, r.created_at, isUnread);
    }
  }

  // Seed guestbook if empty
  const countGb = db.prepare('SELECT COUNT(*) as cnt FROM guestbook').get() as { cnt: number };
  if (countGb && countGb.cnt === 0) {
    const insertGb = db.prepare(`
      INSERT INTO guestbook (id, name, relation, message, approved, created_at, is_read)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    // Seed with 1 unread message to showcase the notification badge immediately
    for (let i = 0; i < DEFAULT_INITIAL_GUESTBOOK.length; i++) {
      const g = DEFAULT_INITIAL_GUESTBOOK[i];
      const isUnread = i === DEFAULT_INITIAL_GUESTBOOK.length - 1 ? 0 : 1;
      insertGb.run(g.id, g.name, g.relation, g.message, g.approved, g.created_at, isUnread);
    }
  }
}

// Database helper functions
export function getWeddingSettings() {
  const db = getDatabase();
  const getSettingStmt = db.prepare('SELECT value FROM wedding_settings WHERE key = ?');
  
  const detailsRow = getSettingStmt.get('details') as { value: string } | undefined;
  const programRow = getSettingStmt.get('program_steps') as { value: string } | undefined;
  const venuesRow = getSettingStmt.get('venues') as { value: string } | undefined;
  const storyRow = getSettingStmt.get('story_milestones') as { value: string } | undefined;
  const galleryRow = getSettingStmt.get('gallery_items') as { value: string } | undefined;

  let mergedDetails = DEFAULT_WEDDING_DETAILS;
  if (detailsRow && detailsRow.value) {
    try {
      const parsed = JSON.parse(detailsRow.value);
      mergedDetails = {
        ...DEFAULT_WEDDING_DETAILS,
        ...parsed,
        groom: {
          ...DEFAULT_WEDDING_DETAILS.groom,
          ...(parsed.groom || {}),
        },
        bride: {
          ...DEFAULT_WEDDING_DETAILS.bride,
          ...(parsed.bride || {}),
        },
      };
    } catch (e) {
      console.error('Error parsing details from SQLite:', e);
    }
  }

  return {
    details: mergedDetails,
    programSteps: programRow ? JSON.parse(programRow.value) : DEFAULT_PROGRAM_STEPS,
    venues: venuesRow ? JSON.parse(venuesRow.value) : DEFAULT_VENUES,
    storyMilestones: storyRow ? JSON.parse(storyRow.value) : DEFAULT_STORY_MILESTONES,
    galleryItems: galleryRow ? JSON.parse(galleryRow.value) : DEFAULT_GALLERY_ITEMS,
  };
}

export function saveWeddingSetting(key: string, data: any) {
  const db = getDatabase();
  const stmt = db.prepare('INSERT OR REPLACE INTO wedding_settings (key, value) VALUES (?, ?)');
  stmt.run(key, JSON.stringify(data));
}

export function getAllRsvps() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM rsvps ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    full_name: r.full_name,
    phone: r.phone,
    email: r.email || undefined,
    attendance: r.attendance,
    guests_count: Number(r.guests_count) || 1,
    guest_names: r.guest_names || '',
    message: r.message || '',
    created_at: r.created_at,
    is_read: Boolean(r.is_read),
  }));
}

export function addRsvp(rsvp: any) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO rsvps (id, full_name, phone, email, attendance, guests_count, guest_names, message, created_at, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    rsvp.id,
    rsvp.full_name,
    rsvp.phone,
    rsvp.email || null,
    rsvp.attendance,
    Number(rsvp.guests_count) || 1,
    rsvp.guest_names || '',
    rsvp.message || '',
    rsvp.created_at || new Date().toISOString(),
    rsvp.is_read ? 1 : 0
  );
  return rsvp;
}

export function updateRsvp(rsvp: any) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE rsvps
    SET full_name = ?, phone = ?, email = ?, attendance = ?, guests_count = ?, guest_names = ?, message = ?, is_read = ?
    WHERE id = ?
  `);
  stmt.run(
    rsvp.full_name,
    rsvp.phone,
    rsvp.email || null,
    rsvp.attendance,
    Number(rsvp.guests_count) || 1,
    rsvp.guest_names || '',
    rsvp.message || '',
    rsvp.is_read ? 1 : 0,
    rsvp.id
  );
  return rsvp;
}

export function deleteRsvp(id: string) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM rsvps WHERE id = ?');
  stmt.run(id);
}

export function markRsvpRead(id: string, isRead: boolean = true) {
  const db = getDatabase();
  db.prepare('UPDATE rsvps SET is_read = ? WHERE id = ?').run(isRead ? 1 : 0, id);
}

export function getAllGuestbook() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM guestbook ORDER BY created_at DESC').all() as any[];
  return rows.map((g) => ({
    id: g.id,
    name: g.name,
    relation: g.relation || '',
    message: g.message,
    approved: Boolean(g.approved),
    created_at: g.created_at,
    is_read: Boolean(g.is_read),
  }));
}

export function addGuestbook(msg: any) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO guestbook (id, name, relation, message, approved, created_at, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    msg.id,
    msg.name,
    msg.relation || '',
    msg.message,
    msg.approved !== false ? 1 : 0,
    msg.created_at || new Date().toISOString(),
    msg.is_read ? 1 : 0
  );
  return msg;
}

export function markGuestbookRead(id: string, isRead: boolean = true) {
  const db = getDatabase();
  db.prepare('UPDATE guestbook SET is_read = ? WHERE id = ?').run(isRead ? 1 : 0, id);
}

export function markAllNotificationsRead() {
  const db = getDatabase();
  db.prepare('UPDATE rsvps SET is_read = 1').run();
  db.prepare('UPDATE guestbook SET is_read = 1').run();
}

// Admin PIN Authentication helpers
export function getAdminPin(): string {
  const db = getDatabase();
  const row = db.prepare('SELECT value FROM wedding_settings WHERE key = ?').get('admin_pin') as { value: string } | undefined;
  return row ? row.value : '2026';
}

export function setAdminPin(newPin: string): boolean {
  if (!newPin || typeof newPin !== 'string' || newPin.trim().length < 3) {
    return false;
  }
  const db = getDatabase();
  db.prepare('INSERT OR REPLACE INTO wedding_settings (key, value) VALUES (?, ?)').run('admin_pin', newPin.trim());
  return true;
}

export function verifyAdminPin(enteredPin: string): boolean {
  const currentPin = getAdminPin();
  const trimmed = enteredPin.trim();
  // Valid if matches stored PIN or if using default standard PINs (1234 or 2026)
  return (
    trimmed === currentPin.trim() ||
    ((currentPin === '2026' || currentPin === '1234') && (trimmed === '1234' || trimmed === '2026'))
  );
}

export function toggleGuestbookApproval(id: string) {
  const db = getDatabase();
  const getStmt = db.prepare('SELECT approved FROM guestbook WHERE id = ?');
  const row = getStmt.get(id) as { approved: number } | undefined;
  if (row) {
    const newStatus = row.approved === 1 ? 0 : 1;
    db.prepare('UPDATE guestbook SET approved = ? WHERE id = ?').run(newStatus, id);
    return newStatus === 1;
  }
  return false;
}

export function deleteGuestbook(id: string) {
  const db = getDatabase();
  db.prepare('DELETE FROM guestbook WHERE id = ?').run(id);
}

export function resetDatabaseToDefaults() {
  const db = getDatabase();
  
  // Reset settings
  saveWeddingSetting('details', DEFAULT_WEDDING_DETAILS);
  saveWeddingSetting('program_steps', DEFAULT_PROGRAM_STEPS);
  saveWeddingSetting('venues', DEFAULT_VENUES);
  saveWeddingSetting('story_milestones', DEFAULT_STORY_MILESTONES);
  saveWeddingSetting('gallery_items', DEFAULT_GALLERY_ITEMS);

  // Reset rsvps
  db.exec('DELETE FROM rsvps');
  const insertRsvp = db.prepare(`
    INSERT INTO rsvps (id, full_name, phone, email, attendance, guests_count, guest_names, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const r of DEFAULT_INITIAL_RSVPS) {
    insertRsvp.run(r.id, r.full_name, r.phone, r.email, r.attendance, r.guests_count, r.guest_names, r.message, r.created_at);
  }

  // Reset guestbook
  db.exec('DELETE FROM guestbook');
  const insertGb = db.prepare(`
    INSERT INTO guestbook (id, name, relation, message, approved, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const g of DEFAULT_INITIAL_GUESTBOOK) {
    insertGb.run(g.id, g.name, g.relation, g.message, g.approved, g.created_at);
  }

  return true;
}

export function getDatabaseStats() {
  const db = getDatabase();
  let fileSize = '0 KB';
  try {
    const stat = fs.statSync(DB_FILE);
    fileSize = `${(stat.size / 1024).toFixed(1)} KB`;
  } catch {
    // ignore
  }

  const rsvpRow = db.prepare('SELECT COUNT(*) as cnt FROM rsvps').get() as { cnt: number };
  const gbRow = db.prepare('SELECT COUNT(*) as cnt FROM guestbook').get() as { cnt: number };

  return {
    isSqlite: true,
    dbPath: 'data/wedding.sqlite',
    fileSize,
    rsvpsCount: rsvpRow ? rsvpRow.cnt : 0,
    guestbookCount: gbRow ? gbRow.cnt : 0,
    lastUpdated: new Date().toISOString(),
  };
}
