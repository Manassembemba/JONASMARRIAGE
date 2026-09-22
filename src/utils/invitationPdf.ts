import { jsPDF } from 'jspdf';
import { RSVPData, WeddingDetails, ProgramEvent, VenueData } from '../types';

/**
 * Normalise un numéro de téléphone pour WhatsApp (ex: +243 81 234 5678 -> 243812345678)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  // Garde uniquement les chiffres
  let digits = phone.replace(/\D/g, '');

  // Si commence par 0, remplace par 243 (indicatif RDC par défaut)
  if (digits.startsWith('0')) {
    digits = '243' + digits.substring(1);
  } else if (digits.startsWith('243')) {
    // Déjà bon
  } else if (digits.length === 9) {
    digits = '243' + digits;
  }
  return digits;
}

/**
 * Génère le texte officiel d'invitation pour WhatsApp
 */
export function generateWhatsAppInvitationMessage(
  guest: RSVPData,
  details: WeddingDetails
): string {
  const passCode = `PASS-JF2026-${(guest.id || 'INV').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;
  const seats = guest.guests_count || 1;
  const guestNamesNotice = guest.guest_names ? `\n👥 *Accompagnateur(s)* : ${guest.guest_names}` : '';
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mariage-jonas-flora.cd';

  return `👑 *INVITATION OFFICIELLE & PASS D'ACCÈS* 👑
*MARIAGE MADIKANI MBIDI JONAS & MATELO SANGA FLORA*
Kinshasa, République Démocratique du Congo

Cher(e) *${guest.full_name}*,

C'est avec un immense bonheur et un profond honneur que nous vous convions à la célébration officielle de notre mariage. Votre présence à nos côtés illuminera ces journées mémorables.

📋 *VOTRE BILLET D'ACCÈS PERSONNEL* :
• Invité d'honneur : *${guest.full_name}*
• Places réservées : *${seats} personne(s)*${guestNamesNotice}
• Code Pass officiel : *${passCode}*

🗓️ *PROGRAMME OFFICIEL DES CÉLÉBRATIONS* :

🏛️ *1. MARIAGE CIVIL*
• *Jeudi 29 Octobre 2026*
• Heure : *11H00* (Accueil protocolaire dès 10h30)
• Lieu : *Maison Communale de Lemba*
• Adresse : Avenue Kadjeke n° 1 Bis, Quartier Commercial, Lemba, Kinshasa

🌺 *2. MARIAGE COUTUMIER & RÉCEPTION*
• *Samedi 31 Octobre 2026*
• Heure : *15H00 à 19H45*
• Lieu : *Résidence Familiale — N'sele*
• Adresse : Avenue Bolia n°15, Quartier Mpasa 1, N'sele, Kinshasa
• Repères : Arrêt 3 Paillote • Référence KIN MARCHE

👗 *Code Vestimentaire* : Tenue de ville élégante ou tenue traditionnelle d'apparat.

📄 *Votre carte d'invitation officielle au format PDF* a été générée. Vous pouvez également retrouver tous les détails, le plan d'accès et les photos sur notre site :
${appUrl}

Nous avons hâte de célébrer ces moments inoubliables avec vous.

Bien chaleureusement,
*Jonas & Flora* ❤️`;
}

/**
 * Génère le sujet et le corps de message pour l'envoi Gmail
 */
export function generateGmailInvitationData(
  guest: RSVPData,
  details: WeddingDetails
): { subject: string; body: string; gmailUrl: string; mailtoUrl: string } {
  const passCode = `PASS-JF2026-${(guest.id || 'INV').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;
  const seats = guest.guests_count || 1;
  const guestNamesNotice = guest.guest_names ? `\nAccompagnateur(s) : ${guest.guest_names}` : '';
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mariage-jonas-flora.cd';

  const subject = `💍 Invitation Officielle & Pass d'Accès — Mariage Jonas & Flora (Kinshasa 2026)`;

  const body = `INVITATION OFFICIELLE & BILLET D'HONNEUR NUPTIAL
Célébration du Mariage de Madikani Mbidi Jonas & Matelo Sanga Flora
Kinshasa, République Démocratique du Congo

Cher(e) ${guest.full_name},

Nous avons l'honneur et le plaisir de vous compter parmi nos invités privilégiés pour célébrer notre union sacrée.

DÉTAILS DE VOTRE INVITATION :
--------------------------------------------------
• Invité d'honneur : ${guest.full_name}
• Places réservées : ${seats} personne(s)${guestNamesNotice}
• Code Pass officiel : ${passCode}
• Statut de confirmation : Confirmé(e) avec joie

PROGRAMME OFFICIEL DES CÉLÉBRATIONS :
--------------------------------------------------
1. MARIAGE CIVIL
• Date : Jeudi 29 Octobre 2026
• Horaires : 11h00 précises (Accueil des invités dès 10h30)
• Lieu : Maison Communale de Lemba
• Adresse : Avenue Kadjeke n° 1 Bis, Quartier Commercial, Lemba, Kinshasa

2. MARIAGE COUTUMIER & RÉCEPTION
• Date : Samedi 31 Octobre 2026
• Horaires : 15h00 — 19h45
• Lieu : Résidence Familiale — N'sele
• Adresse : Avenue Bolia n°15, Quartier Mpasa 1, Commune de la N'sele, Kinshasa
• Repères : Arrêt 3 Paillote • Référence KIN MARCHE

Code vestimentaire recommandé : Tenue de ville soignée ou tenue traditionnelle de fête.
Prière de vous munir de votre Pass ou de cette confirmation lors de votre accueil.

Retrouvez le programme complet, les coordonnées GPS et la galerie sur notre site officiel :
${appUrl}

Dans l'attente chaleureuse de partager ces instants mémorables avec vous,

Très cordialement,
Madikani Mbidi Jonas & Matelo Sanga Flora`;

  const toEmail = guest.email || '';
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    toEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return { subject, body, gmailUrl, mailtoUrl };
}

/**
 * Génère le PDF d'invitation officiel au format A4 haute résolution
 */
export function generateInvitationPdf(
  guest: RSVPData,
  details: WeddingDetails,
  programSteps?: ProgramEvent[],
  venues?: VenueData[]
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const passCode = `PASS-JF2026-${(guest.id || 'INV').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;
  const seats = guest.guests_count || 1;

  // 1. Fond légèrement ivoire / crème élégant
  doc.setFillColor(252, 250, 246);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // 2. Encadrement extérieur or noble
  doc.setDrawColor(197, 160, 89); // #c5a059
  doc.setLineWidth(1.4);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // 3. Encadrement intérieur fin
  doc.setLineWidth(0.4);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // 4. Ornements d'angle (coins dorés)
  const cornerSize = 5;
  const drawCornerFlourish = (x: number, y: number, dx: number, dy: number) => {
    doc.setDrawColor(119, 90, 25);
    doc.setLineWidth(0.8);
    doc.line(x, y, x + dx * cornerSize, y);
    doc.line(x, y, x, y + dy * cornerSize);
    doc.setFillColor(197, 160, 89);
    doc.circle(x + dx * 2, y + dy * 2, 0.9, 'F');
  };
  drawCornerFlourish(13, 13, 1, 1);
  drawCornerFlourish(pageWidth - 13, 13, -1, 1);
  drawCornerFlourish(13, pageHeight - 13, 1, -1);
  drawCornerFlourish(pageWidth - 13, pageHeight - 13, -1, -1);

  // 5. En-tête officiel
  let currentY = 25;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(119, 90, 25); // #775a19
  doc.text('RÉPUBLIQUE DÉMOCRATIQUE DU CONGO  •  VILLE DE KINSHASA', pageWidth / 2, currentY, {
    align: 'center',
  });

  currentY += 5;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(27, 28, 26);
  doc.text('INVITATION OFFICIELLE & BILLET D\'HONNEUR', pageWidth / 2, currentY, {
    align: 'center',
  });

  // Ligne de séparation dorée avec losange au centre
  currentY += 4;
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.5);
  doc.line(55, currentY, 98, currentY);
  doc.line(112, currentY, 155, currentY);
  doc.setFillColor(197, 160, 89);
  doc.rect(103, currentY - 1.5, 4, 3, 'F');

  // 6. Monogramme et Noms des Mariés
  currentY += 13;
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(96, 94, 92);
  doc.text('Sous la bénédiction de Dieu et l\'accord des deux familles', pageWidth / 2, currentY, {
    align: 'center',
  });

  currentY += 9;
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(119, 90, 25);
  doc.text('MADIKANI MBIDI JONAS', pageWidth / 2, currentY, { align: 'center' });

  currentY += 6;
  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.setTextColor(197, 160, 89);
  doc.text('&', pageWidth / 2, currentY, { align: 'center' });

  currentY += 7;
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(119, 90, 25);
  doc.text('MATELO SANGA FLORA', pageWidth / 2, currentY, { align: 'center' });

  currentY += 9;
  doc.setFont('times', 'italic');
  doc.setFontSize(11.5);
  doc.setTextColor(40, 40, 40);
  doc.text('Ont l\'immense honneur et la joie de convier à leur union :', pageWidth / 2, currentY, {
    align: 'center',
  });

  // 7. Cartouche Invité d'Honneur (Cadre doré raffiné)
  currentY += 6;
  const cardBoxX = 22;
  const cardBoxW = pageWidth - 44;
  const cardBoxH = 34;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cardBoxX, currentY, cardBoxW, cardBoxH, 3, 3, 'F');
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.8);
  doc.roundedRect(cardBoxX, currentY, cardBoxW, cardBoxH, 3, 3, 'S');

  // Contenu du cartouche invité
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(119, 90, 25);
  doc.text('INVITÉ D\'HONNEUR PRIVILÉGIÉ', pageWidth / 2, currentY + 6.5, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(27, 28, 26);
  doc.text(guest.full_name.toUpperCase(), pageWidth / 2, currentY + 14.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(78, 70, 57);
  const seatsText = `Nombre de place(s) réservée(s) : ${seats} personne(s)`;
  doc.text(seatsText, pageWidth / 2, currentY + 21, { align: 'center' });

  if (guest.guest_names) {
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Accompagnateur(s) : ${guest.guest_names}`, pageWidth / 2, currentY + 26.5, {
      align: 'center',
    });
  }

  // Code Pass discret dans le coin du cartouche
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(119, 90, 25);
  doc.text(`CODE ACCÈS : ${passCode}`, cardBoxX + cardBoxW - 4, currentY + cardBoxH - 3, {
    align: 'right',
  });

  currentY += cardBoxH + 11;

  // 8. Titre des Célébrations
  doc.setFont('times', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(27, 28, 26);
  doc.text('PROGRAMME OFFICIEL DES CÉLÉBRATIONS', pageWidth / 2, currentY, { align: 'center' });

  currentY += 6;

  // 9. Deux Encadrés Cérémonies (Civil & Coutumier)
  const ceremonyBoxW = (pageWidth - 52) / 2;
  const ceremonyBoxH = 68;
  const col1X = 22;
  const col2X = 22 + ceremonyBoxW + 8;

  // Box 1: Mariage Civil
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(col1X, currentY, ceremonyBoxW, ceremonyBoxH, 2, 2, 'F');
  doc.setDrawColor(209, 197, 180);
  doc.setLineWidth(0.5);
  doc.roundedRect(col1X, currentY, ceremonyBoxW, ceremonyBoxH, 2, 2, 'S');

  // En-tête Box 1
  doc.setFillColor(245, 240, 230);
  doc.roundedRect(col1X, currentY, ceremonyBoxW, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(119, 90, 25);
  doc.text('1. MARIAGE CIVIL', col1X + ceremonyBoxW / 2, currentY + 6.5, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(27, 28, 26);
  doc.text('Jeudi 29 Octobre 2026', col1X + ceremonyBoxW / 2, currentY + 18, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(119, 90, 25);
  doc.text('11H00 (Accueil dès 10h30)', col1X + ceremonyBoxW / 2, currentY + 23.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(27, 28, 26);
  doc.text('Maison Communale de Lemba', col1X + ceremonyBoxW / 2, currentY + 31, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(78, 70, 57);
  const civilAddr = doc.splitTextToSize(
    'Avenue Kadjeke n° 1 Bis\nQuartier Commercial, Lemba\nVille de Kinshasa\nParking réservé sur place',
    ceremonyBoxW - 8
  );
  doc.text(civilAddr, col1X + ceremonyBoxW / 2, currentY + 37, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(119, 90, 25);
  doc.text('Cérémonie Républicaine Solennelle', col1X + ceremonyBoxW / 2, currentY + 62, {
    align: 'center',
  });

  // Box 2: Mariage Coutumier & Réception
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(col2X, currentY, ceremonyBoxW, ceremonyBoxH, 2, 2, 'F');
  doc.setDrawColor(209, 197, 180);
  doc.setLineWidth(0.5);
  doc.roundedRect(col2X, currentY, ceremonyBoxW, ceremonyBoxH, 2, 2, 'S');

  // En-tête Box 2
  doc.setFillColor(245, 240, 230);
  doc.roundedRect(col2X, currentY, ceremonyBoxW, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(119, 90, 25);
  doc.text('2. MARIAGE COUTUMIER', col2X + ceremonyBoxW / 2, currentY + 6.5, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(27, 28, 26);
  doc.text('Samedi 31 Octobre 2026', col2X + ceremonyBoxW / 2, currentY + 18, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(119, 90, 25);
  doc.text('15H00 — 19H45', col2X + ceremonyBoxW / 2, currentY + 23.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(27, 28, 26);
  doc.text('Résidence Familiale — N\'sele', col2X + ceremonyBoxW / 2, currentY + 31, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(78, 70, 57);
  const coutumierAddr = doc.splitTextToSize(
    'Avenue Bolia n°15\nQuartier Mpasa 1, Commune N\'sele\nArrêt : 3 Paillote\nRéférence : KIN MARCHE',
    ceremonyBoxW - 8
  );
  doc.text(coutumierAddr, col2X + ceremonyBoxW / 2, currentY + 37, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(119, 90, 25);
  doc.text('Traditions Ancestrales & Réception', col2X + ceremonyBoxW / 2, currentY + 62, {
    align: 'center',
  });

  currentY += ceremonyBoxH + 11;

  // 10. Consignes protocolaires & d'accès
  doc.setFillColor(255, 255, 255);
  const protocolBoxH = 24;
  doc.roundedRect(cardBoxX, currentY, cardBoxW, protocolBoxH, 2, 2, 'F');
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.4);
  doc.roundedRect(cardBoxX, currentY, cardBoxW, protocolBoxH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(119, 90, 25);
  doc.text('CONSIGNES D\'ACCÈS & PROTOCOLE NUPTIAL', pageWidth / 2, currentY + 5.5, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(78, 70, 57);
  doc.text(
    '• Ce billet d\'invitation est personnel et fait foi de pass d\'accès auprès de la commission protocolaire.',
    pageWidth / 2,
    currentY + 11,
    { align: 'center' }
  );
  doc.text(
    '• Code vestimentaire exigé : Tenue de ville soignée ou tenue traditionnelle d\'apparat.',
    pageWidth / 2,
    currentY + 15.5,
    { align: 'center' }
  );
  doc.text(
    '• Prière de respecter les horaires d\'accueil afin d\'assurer le bon déroulement des cérémonies.',
    pageWidth / 2,
    currentY + 20,
    { align: 'center' }
  );

  // 11. Pied de page
  currentY += protocolBoxH + 11;

  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(119, 90, 25);
  doc.text('« Pour le Meilleur et pour Toujours »', pageWidth / 2, currentY, { align: 'center' });

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  const genDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(
    `Édité officiellement par le Comité d'Organisation • Kinshasa • ${genDate}`,
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );

  return doc;
}

/**
 * Télécharge directement le PDF pour un invité
 */
export function downloadInvitationPdf(
  guest: RSVPData,
  details: WeddingDetails,
  programSteps?: ProgramEvent[],
  venues?: VenueData[]
) {
  const doc = generateInvitationPdf(guest, details, programSteps, venues);
  const safeName = (guest.full_name || 'Invite').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Invitation_Officielle_Mariage_Jonas_Flora_${safeName}.pdf`);
}
