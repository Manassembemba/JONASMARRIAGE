import {
  RSVPData,
  GuestbookMessage,
  TimelineMilestone,
  ProgramEvent,
  WeddingDetails,
  VenueData,
  GalleryItem,
} from '../types';

export const WEDDING_DETAILS: WeddingDetails = {
  groom: {
    fullName: 'Madikani Mbidi Jonas',
    shortName: 'Jonas',
    role: 'Le Marié',
    photo: '', // À configurer par l'administrateur
    quote: '« Dès le premier instant où nos regards se sont croisés, j\'ai su que mon cœur avait enfin trouvé son havre de paix. Flora incarne l\'élégance, la force et la douceur infinie avec laquelle je souhaite bâtir chaque lendemain de ma vie. »',
  },
  bride: {
    fullName: 'Matelo Sanga Flora',
    shortName: 'Flora',
    role: 'La Mariée',
    photo: '', // À configurer par l'administrateur
    quote: '« Jonas est mon roc, mon confident et mon plus bel allié. Sa générosité d\'esprit et sa foi illuminent mon quotidien. C\'est avec une fierté immense et une joie incommensurable que je lui confie ma main et ma destinée. »',
  },
  centerQuote: 'Deux cœurs, une promesse, une nouvelle histoire à écrire ensemble.',
  centerSubtitle: 'Pour le Meilleur et pour Toujours',
  dateString: '29 & 31 octobre 2026',
  dateFormatted: '29 & 31 Octobre 2026',
  date1: 'Jeudi 29 Octobre 2026',
  date2: 'Samedi 31 Octobre 2026',
  targetDateTime: '2026-10-29T11:00:00+01:00',
  cityCountry: 'KINSHASA, RDC',
  announcementText: 'Nous avons le bonheur de vous annoncer notre mariage',
  heroBadge: 'Célébration Nuptiale Privée',
  heroTagline: 'Deux âmes réunies pour l\'éternité',
  storyIntroTitle: 'Notre Histoire d\'Amour — Le Destin de Jonas & Flora',
  storyIntroText: 'Du premier regard échangé à l\'engagement solennel, chaque chapitre a tissé le fil doré de notre union.',
  programSubtitle: 'Découvrez le déroulement chronologique de cette journée mémorable consacrée à l\'amour, à la loi et aux traditions ancestrales.',
  emotionalQuote1: '« Une nouvelle aventure commence...',
  emotionalQuote2: 'Et nous aimerions la partager avec vous. »',
  footerMessage: 'Nous serions infiniment honorés de votre présence pour célébrer notre union et écrire ensemble les premières pages de notre nouvelle vie.',
  monogramUrl: '', // À configurer par l'administrateur
  coupleHeroPhoto: '', // À configurer par l'administrateur
  musicUrl: '', // À configurer par l'administrateur
};

export const DEFAULT_WEDDING_DETAILS = WEDDING_DETAILS;

// Galerie vide par défaut — l'admin ajoute ses propres photos depuis Supabase
export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [];

export const STORY_MILESTONES: TimelineMilestone[] = [
  {
    title: 'Notre Rencontre',
    subtitle: 'Chapitre I — Le Premier Regard',
    description: 'Le premier regard, les premiers instants inoubliables où le temps semblait s\'être suspendu. Une conversation impromptue qui a allumé une étincelle sincère et réciproque, le prélude discret d\'un attachement profond.',
    icon: 'I',
  },
  {
    title: 'Notre Histoire',
    subtitle: 'Chapitre II — L\'Épanouissement',
    description: 'Les voyages partagés, les fous rires complices, les épreuves surmontées main dans la main. Mois après mois, notre complicité s\'est fortifiée au gré de projets ambitieux et d\'une tendresse inaltérable.',
    icon: 'II',
  },
  {
    title: 'La Décision',
    subtitle: 'Chapitre III — Le Serment',
    description: 'La promesse solennelle, la demande en mariage et l\'engagement d\'une vie entière à deux. Une décision prise avec le cœur, bénie par la certitude d\'être faits l\'un pour l\'autre.',
    icon: 'III',
  },
  {
    title: 'Le Grand Jour',
    subtitle: 'L\'Apogée — Notre Mariage',
    description: 'Le jour sacré où nous unissons nos destins devant Dieu, nos familles bien-aimées et nos amis les plus chers. Une journée de festivités gravée pour toujours dans nos cœurs.',
    icon: 'IV',
  },
];

export const PROGRAM_STEPS: ProgramEvent[] = [
  {
    time: '11H00',
    title: 'Mariage Civil',
    type: 'Cérémonie Républicaine',
    location: 'Maison Communale de Lemba',
    address: 'Avenue Kadjeke n° 1 Bis, Quartier Commercial, Commune de Lemba',
    landmarks: 'Ville-Province de Kinshasa • Accueil dès 10h30',
    mapUrl: 'https://maps.google.com/?q=Maison+Communale+de+Lemba+Kinshasa',
    icon: 'civile',
    badge: '① MARIAGE CIVIL',
  },
  {
    time: '15H00 — 19H45',
    title: 'Mariage Coutumier',
    type: 'Cérémonie Traditionnelle & Réception',
    location: 'Résidence familiale',
    address: 'Avenue Bolia n°15, Quartier Mpasa 1, Commune de la N\'sele',
    landmarks: 'Arrêt : 3 Paillote • Référence : KIN MARCHE',
    mapUrl: 'https://maps.google.com/?q=Mpasa+1+Nsele+Kinshasa',
    icon: 'coutumier',
    badge: '② MARIAGE COUTUMIER',
  },
];

export const VENUES_DATA = [
  {
    id: 'lemba',
    name: 'Maison Communale de Lemba',
    ceremony: 'Mariage Civil',
    date: 'Jeudi 29 Octobre 2026',
    time: '11h00 (Accueil dès 10h30)',
    address: 'Avenue Kadjeke n° 1 Bis, Quartier Commercial, Commune de Lemba, Kinshasa',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxe-SXv_fEG3Avy-LSg6eWU7U0c9foXio-8VQfHr686MibmmPLdBhImHnFqoOGDbtNNg4pJphBOOMrRghPKXU2vjELMU3yJiTZb4c7R44RQd_FTaZjfgCsHy1qMrr2VKfeZeYsOdYi-nHCFzjPCYxDmzn-RRdzvfoUXnpFG-ZP8doJzQLhRggqPAMB-Q9ihnZJ6BL1JruUim1sMI9lY8VA33qtpkXCGnrLTT-gzIfWdFeJCnNcMgqg',
    mapUrl: 'https://maps.google.com/?q=Maison+Communale+de+Lemba+Kinshasa',
    badge: 'Étape 1',
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
    badge: 'Étape 2',
  },
];




export const INITIAL_GUESTBOOK: GuestbookMessage[] = [
  {
    id: 'gb-1',
    name: 'Famille Mbidi & Alliés',
    relation: 'Kinshasa',
    message: 'Toutes nos félicitations aux heureux mariés. Que votre union soit remplie d\'amour, de bonheur, de santé et de prospérité éternelle. Que la paix divine repose sur votre foyer !',
    approved: true,
    created_at: '2026-09-15T14:30:00Z',
  },
  {
    id: 'gb-2',
    name: 'Sarah & David M.',
    relation: 'Amis d\'enfance',
    message: 'Vous formez un couple tout simplement radieux et exemplaire. Hâte de danser et de célébrer ce grand jour sacré à vos côtés ! Jonas & Flora, soyez bénis !',
    approved: true,
    created_at: '2026-09-16T18:20:00Z',
  },
  {
    id: 'gb-3',
    name: 'Pasteur Emmanuel & Épouse',
    relation: 'Guides spirituels',
    message: '« La corde à trois fils ne se rompt pas facilement ». Que l\'Éternel soit au centre de votre foyer jour après jour.',
    approved: true,
    created_at: '2026-09-17T09:15:00Z',
  },
];

export const INITIAL_RSVPS: RSVPData[] = [
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
