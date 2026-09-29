import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { RSVPData, WeddingDetails, ProgramEvent, VenueData } from '../types';
import { supabase } from '../lib/supabase';

/**
 * Normalise un numéro de téléphone pour WhatsApp (ex: +243 81 234 5678 -> 243812345678)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0')) {
    digits = '243' + digits.substring(1);
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
  details: WeddingDetails,
  pdfPublicUrl?: string
): string {
  const passCode = `PASS-JF2026-${(guest.id || 'INV').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;
  const seats = guest.guests_count || 1;
  const guestNamesNotice = guest.guest_names ? `\n• Accompagnateur(s) : ${guest.guest_names}` : '';
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mariage-jonas-flora.cd';
  const groomName = (details.groom?.fullName || 'Madikani Mbidi Jonas').toUpperCase();
  const brideName = (details.bride?.fullName || 'Matelo Sanga Flora').toUpperCase();
  const contactPhone = details.contactPhone || '0823965480';

  let msg = `*INVITATION OFFICIELLE & BILLET D'HONNEUR NUPTIAL*
*MARIAGE ${groomName} & ${brideName}*
Kinshasa, République Démocratique du Congo

Cher(e) *${guest.full_name}*,

C'est avec un immense honneur et une profonde joie que nous vous prions de bien vouloir assister à la célébration officielle de notre mariage.

*VOTRE PASS D'ACCÈS PERSONNEL & SÉCURISÉ :*
• Invité(e) d'honneur : *${guest.full_name}*
• Places réservées : *${seats} personne(s)*${guestNamesNotice}
• Code Pass officiel : *${passCode}*

*PROGRAMME OFFICIEL DES CÉLÉBRATIONS :*

1. *MARIAGE CIVIL*
• Date : *${details.date1 || 'Jeudi 29 Octobre 2026'}*
• Heure : *11H00* (Accueil dès 10h30)
• Lieu : *Maison Communale de Lemba* (Av. Kadjeke n° 1 Bis, Kinshasa)

2. *MARIAGE COUTUMIER & RÉCEPTION*
• Date : *${details.date2 || 'Samedi 31 Octobre 2026'}*
• Heure : *15H00 à 19H45*
• Lieu : *Résidence Familiale — N'sele* (Av. Bolia n°15, Arrêt 3 Paillote, KIN MARCHE)

• Dress code : *Tenue de ville soignée ou tenue traditionnelle d'apparat.*
• Assistance protocolaire : *WhatsApp ${contactPhone}*`;

  if (pdfPublicUrl) {
    msg += `\n\n📄 *VOTRE BILLET D'INVITATION OFFICIEL (PDF HAUTE DÉFINITION) :*\nCliquez sur ce lien pour ouvrir et télécharger votre carte officielle imprimable :\n${pdfPublicUrl}`;
  }

  msg += `\n\nRetrouvez le programme complet, les coordonnées GPS et la galerie sur notre site officiel :\n${appUrl}

Avec toute notre gratitude et notre considération,
*${details.groom?.shortName || 'Jonas'} & ${details.bride?.shortName || 'Flora'}*`;

  return msg;
}

/**
 * Génère le sujet et le corps de message pour l'envoi Gmail
 */
export function generateGmailInvitationData(
  guest: RSVPData,
  details: WeddingDetails,
  pdfPublicUrl?: string
): { subject: string; body: string; gmailUrl: string; mailtoUrl: string } {
  const passCode = `PASS-JF2026-${(guest.id || 'INV').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;
  const seats = guest.guests_count || 1;
  const guestNamesNotice = guest.guest_names ? `\nAccompagnateur(s) : ${guest.guest_names}` : '';
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mariage-jonas-flora.cd';
  const groomName = (details.groom?.fullName || 'Madikani Mbidi Jonas').toUpperCase();
  const brideName = (details.bride?.fullName || 'Matelo Sanga Flora').toUpperCase();

  const subject = `Invitation Officielle & Pass d'Accès — Mariage ${details.groom?.shortName || 'Jonas'} & ${details.bride?.shortName || 'Flora'} (Kinshasa)`;

  let body = `INVITATION OFFICIELLE & BILLET D'HONNEUR NUPTIAL
Célébration du Mariage de ${groomName} & ${brideName}
Kinshasa, République Démocratique du Congo

Cher(e) ${guest.full_name},

Nous avons l'honneur et le plaisir de vous compter parmi nos invités privilégiés pour célébrer notre union sacrée.

DÉTAILS DE VOTRE INVITATION :
--------------------------------------------------
• Invité d'honneur : ${guest.full_name}
• Places réservées : ${seats} personne(s)${guestNamesNotice}
• Code Pass officiel : ${passCode}

PROGRAMME OFFICIEL DES CÉLÉBRATIONS :
--------------------------------------------------
1. MARIAGE CIVIL
• Date : ${details.date1 || 'Jeudi 29 Octobre 2026'}
• Horaires : 11h00 précises (Accueil des invités dès 10h30)
• Lieu : Maison Communale de Lemba
• Adresse : Avenue Kadjeke n° 1 Bis, Quartier Commercial, Lemba, Kinshasa

2. MARIAGE COUTUMIER & RÉCEPTION
• Date : ${details.date2 || 'Samedi 31 Octobre 2026'}
• Horaires : 15h00 — 19h45
• Lieu : Résidence Familiale — N'sele
• Adresse : Avenue Bolia n°15, Quartier Mpasa 1, Commune de la N'sele, Kinshasa
• Repères : Arrêt 3 Paillote • Référence KIN MARCHE

Code vestimentaire recommandé : Tenue de ville soignée ou tenue traditionnelle de fête.
Prière de vous munir de votre Pass ou de cette confirmation lors de votre accueil.`;

  if (pdfPublicUrl) {
    body += `\n\nLien direct de téléchargement de votre billet d'invitation (PDF officiel) :\n${pdfPublicUrl}`;
  }

  body += `\n\nRetrouvez le programme complet, les coordonnées GPS et la galerie sur notre site officiel :\n${appUrl}

Dans l'attente chaleureuse de partager ces instants mémorables avec vous,

Très cordialement,
${details.groom?.fullName || 'Madikani Mbidi Jonas'} & ${details.bride?.fullName || 'Matelo Sanga Flora'}`;

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
 * Génère le PDF d'invitation officiel au format A4 haute résolution avec QR Code
 */
export async function generateInvitationPdf(
  guest: RSVPData,
  details: WeddingDetails,
  programSteps?: ProgramEvent[],
  venues?: VenueData[]
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const passCode = `PASS-JF2026-${(guest.id || 'INV').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;
  const seats = guest.guests_count || 1;
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mariage-jonas-flora.cd';

  // 1. Fond crème ivoire
  doc.setFillColor(252, 250, 246);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // 2. Encadrement extérieur or noble
  doc.setDrawColor(197, 160, 89); // #c5a059
  doc.setLineWidth(1.4);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // 3. Encadrement intérieur fin
  doc.setLineWidth(0.4);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // 4. Ornements d'angle dorés
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
  let currentY = 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(119, 90, 25);
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

  // Ligne de séparation dorée avec losange
  currentY += 4;
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.5);
  doc.line(55, currentY, 98, currentY);
  doc.line(112, currentY, 155, currentY);
  doc.setFillColor(197, 160, 89);
  doc.rect(103, currentY - 1.5, 4, 3, 'F');

  // 6. Noms des Mariés (100% dynamiques)
  currentY += 12;
  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(96, 94, 92);
  doc.text('Sous la bénédiction de Dieu et l\'accord des deux familles', pageWidth / 2, currentY, {
    align: 'center',
  });

  currentY += 8;
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(119, 90, 25);
  const groomText = (details.groom?.fullName || 'Madikani Mbidi Jonas').toUpperCase();
  doc.text(groomText, pageWidth / 2, currentY, { align: 'center' });

  currentY += 5.5;
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(197, 160, 89);
  doc.text('&', pageWidth / 2, currentY, { align: 'center' });

  currentY += 6.5;
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(119, 90, 25);
  const brideText = (details.bride?.fullName || 'Matelo Sanga Flora').toUpperCase();
  doc.text(brideText, pageWidth / 2, currentY, { align: 'center' });

  currentY += 8;
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('Ont l\'immense honneur et la joie de convier à leur union :', pageWidth / 2, currentY, {
    align: 'center',
  });

  // 7. Cartouche Invité d'Honneur avec QR CODE
  currentY += 5;
  const cardBoxX = 20;
  const cardBoxW = pageWidth - 40;
  const cardBoxH = 36;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cardBoxX, currentY, cardBoxW, cardBoxH, 3, 3, 'F');
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.8);
  doc.roundedRect(cardBoxX, currentY, cardBoxW, cardBoxH, 3, 3, 'S');

  // Génération du QR Code officiel
  try {
    const qrTargetUrl = `${appUrl}/#pass=${passCode}&guest=${encodeURIComponent(guest.full_name)}&seats=${seats}`;
    const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
      margin: 1,
      width: 200,
      color: { dark: '#1b1c1a', light: '#ffffff' },
    });
    const qrSize = 30;
    const qrX = cardBoxX + cardBoxW - qrSize - 3;
    const qrY = currentY + 3;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  } catch (qrErr) {
    console.warn('QR Code generation fallback', qrErr);
  }

  // Contenu textuel du cartouche invité (à gauche du QR Code)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(119, 90, 25);
  doc.text('INVITÉ(E) D\'HONNEUR PRIVILÉGIÉ(E)', cardBoxX + 6, currentY + 6.5);

  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(27, 28, 26);
  doc.text(guest.full_name.toUpperCase(), cardBoxX + 6, currentY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(119, 90, 25);
  doc.text(`Places réservées : ${seats} personne(s)`, cardBoxX + 6, currentY + 20.5);

  if (guest.guest_names) {
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 90);
    doc.text(`Accompagnateur(s) : ${guest.guest_names}`, cardBoxX + 6, currentY + 26);
  }

  // Pass Code
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(119, 90, 25);
  doc.text(`Pass d'accès : ${passCode}`, cardBoxX + 6, currentY + 31.5);

  currentY += cardBoxH + 9;

  // 8. Titre des Célébrations
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(27, 28, 26);
  doc.text('PROGRAMME OFFICIEL DES CÉLÉBRATIONS', pageWidth / 2, currentY, { align: 'center' });

  currentY += 5;

  // 9. Deux Encadrés Cérémonies (Civil & Coutumier)
  const ceremonyBoxW = (pageWidth - 48) / 2;
  const ceremonyBoxH = 68;
  const col1X = 20;
  const col2X = 20 + ceremonyBoxW + 8;

  // Trouver les détails dynamiques de Lemba & N'sele
  const civilVenue = venues?.find(v => v.ceremony?.toLowerCase().includes('civil') || v.name?.toLowerCase().includes('lemba')) || {
    address: 'Avenue Kadjeke n° 1 Bis\nQuartier Commercial, Lemba\nKinshasa • Parking réservé',
    name: 'Maison Communale de Lemba',
    time: '11h00 (Accueil dès 10h30)',
  };

  const coutumierVenue = venues?.find(v => v.ceremony?.toLowerCase().includes('coutumier') || v.name?.toLowerCase().includes('n\'sele')) || {
    address: 'Avenue Bolia n°15\nQuartier Mpasa 1, N\'sele\nArrêt 3 Paillote • Réf. KIN MARCHE',
    name: 'Résidence Familiale — N\'sele',
    time: '15h00 — 19h45',
  };

  // Box 1: Mariage Civil
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(col1X, currentY, ceremonyBoxW, ceremonyBoxH, 2, 2, 'F');
  doc.setDrawColor(209, 197, 180);
  doc.setLineWidth(0.5);
  doc.roundedRect(col1X, currentY, ceremonyBoxW, ceremonyBoxH, 2, 2, 'S');

  doc.setFillColor(245, 240, 230);
  doc.roundedRect(col1X, currentY, ceremonyBoxW, 9, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(119, 90, 25);
  doc.text('1. MARIAGE CIVIL', col1X + ceremonyBoxW / 2, currentY + 6, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(27, 28, 26);
  doc.text(details.date1 || 'Jeudi 29 Octobre 2026', col1X + ceremonyBoxW / 2, currentY + 16.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(119, 90, 25);
  doc.text(civilVenue.time || '11H00 (Accueil dès 10h30)', col1X + ceremonyBoxW / 2, currentY + 22, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(27, 28, 26);
  doc.text(civilVenue.name || 'Maison Communale de Lemba', col1X + ceremonyBoxW / 2, currentY + 29.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(78, 70, 57);
  const civilAddr = doc.splitTextToSize(civilVenue.address || 'Lemba, Kinshasa', ceremonyBoxW - 6);
  doc.text(civilAddr, col1X + ceremonyBoxW / 2, currentY + 36, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(119, 90, 25);
  doc.text('Cérémonie Républicaine Solennelle', col1X + ceremonyBoxW / 2, currentY + 62, { align: 'center' });

  // Box 2: Mariage Coutumier
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(col2X, currentY, ceremonyBoxW, ceremonyBoxH, 2, 2, 'F');
  doc.setDrawColor(209, 197, 180);
  doc.setLineWidth(0.5);
  doc.roundedRect(col2X, currentY, ceremonyBoxW, ceremonyBoxH, 2, 2, 'S');

  doc.setFillColor(245, 240, 230);
  doc.roundedRect(col2X, currentY, ceremonyBoxW, 9, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(119, 90, 25);
  doc.text('2. MARIAGE COUTUMIER', col2X + ceremonyBoxW / 2, currentY + 6, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(27, 28, 26);
  doc.text(details.date2 || 'Samedi 31 Octobre 2026', col2X + ceremonyBoxW / 2, currentY + 16.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(119, 90, 25);
  doc.text(coutumierVenue.time || '15H00 — 19H45', col2X + ceremonyBoxW / 2, currentY + 22, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(27, 28, 26);
  doc.text(coutumierVenue.name || 'Résidence Familiale — N\'sele', col2X + ceremonyBoxW / 2, currentY + 29.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(78, 70, 57);
  const coutumierAddr = doc.splitTextToSize(coutumierVenue.address || 'N\'sele, Kinshasa', ceremonyBoxW - 6);
  doc.text(coutumierAddr, col2X + ceremonyBoxW / 2, currentY + 36, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(119, 90, 25);
  doc.text('Traditions Ancestrales & Réception', col2X + ceremonyBoxW / 2, currentY + 62, { align: 'center' });

  currentY += ceremonyBoxH + 9;

  // 10. Consignes protocolaires & Contact Protocole WhatsApp
  doc.setFillColor(255, 255, 255);
  const protocolBoxH = 26;
  doc.roundedRect(cardBoxX, currentY, cardBoxW, protocolBoxH, 2, 2, 'F');
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.4);
  doc.roundedRect(cardBoxX, currentY, cardBoxW, protocolBoxH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(119, 90, 25);
  doc.text('CONSIGNES D\'ACCÈS & PROTOCOLE NUPTIAL', pageWidth / 2, currentY + 5.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(78, 70, 57);
  doc.text('• Ce billet est personnel et fait foi de pass d\'accès officiel auprès du protocole.', pageWidth / 2, currentY + 10.5, { align: 'center' });
  doc.text('• Dress code exigé : Tenue de ville soignée ou tenue traditionnelle d\'apparat.', pageWidth / 2, currentY + 15, { align: 'center' });

  const contactPhone = details.contactPhone || '0823965480';
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(119, 90, 25);
  doc.text(`• Assistance & Orientation Protocolaire WhatsApp : ${contactPhone}`, pageWidth / 2, currentY + 20, { align: 'center' });

  // 11. Pied de page
  currentY += protocolBoxH + 9;
  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(119, 90, 25);
  doc.text('« Pour le Meilleur et pour Toujours »', pageWidth / 2, currentY, { align: 'center' });

  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  const genDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Édité officiellement par le Comité d'Organisation • Kinshasa • ${genDate}`, pageWidth / 2, currentY, { align: 'center' });

  return doc;
}

/**
 * Upload the PDF invitation to Supabase Storage bucket "wedding-photos/invitations"
 * Returns a permanent public URL
 */
export async function uploadInvitationPdfToStorage(doc: jsPDF, guestId: string): Promise<string> {
  try {
    const pdfBlob = doc.output('blob');
    const safeGuestId = (guestId || 'inv').replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `invitations/invitation_${safeGuestId}.pdf`;

    const { error } = await supabase.storage
      .from('wedding-photos')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.warn('Storage upload warning:', error);
    }

    const { data } = supabase.storage
      .from('wedding-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.error('Error uploading PDF to storage', err);
    return '';
  }
}

/**
 * Partage l'invitation sur WhatsApp :
 * 1. Sur mobile / navigateurs compatibles (Web Share API) : attache directement le vrai fichier PDF !
 * 2. Sur ordinateur / WhatsApp Web : télécharge le PDF localement, héberge le PDF sur Supabase Storage, et transmet le lien direct cliquable du PDF dans le message WhatsApp.
 */
export async function shareInvitationPdfViaWhatsApp(
  guest: RSVPData,
  details: WeddingDetails,
  programSteps?: ProgramEvent[],
  venues?: VenueData[]
): Promise<{ method: 'native' | 'cloud'; pdfUrl?: string }> {
  // 1. Générer le document PDF avec QR Code
  const doc = await generateInvitationPdf(guest, details, programSteps, venues);
  const safeName = (guest.full_name || 'Invite').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Invitation_Officielle_${safeName}.pdf`;

  // 2. Tester le partage natif de fichier PDF (Web Share API - Android, iOS, Windows)
  const pdfBlob = doc.output('blob');
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

  const groomShort = details.groom?.shortName || 'Jonas';
  const brideShort = details.bride?.shortName || 'Flora';

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: `Invitation Officielle — Mariage ${groomShort} & ${brideShort}`,
        text: `Bonjour ${guest.full_name}, voici votre billet d'invitation officiel et pass d'accès en pièce jointe PDF pour le mariage de ${groomShort} & ${brideShort}.`,
      });
      return { method: 'native' };
    } catch (shareErr: any) {
      if (shareErr?.name === 'AbortError') {
        return { method: 'native' }; // L'utilisateur a fermé la boîte de dialogue
      }
      console.warn('Native share failed, falling back to cloud link', shareErr);
    }
  }

  // 3. Fallback Cloud : Upload sur Supabase Storage pour obtenir un lien PDF direct et téléchargement local du fichier
  doc.save(fileName);
  const pdfPublicUrl = await uploadInvitationPdfToStorage(doc, guest.id);

  // 4. Ouvrir WhatsApp avec le message contenant le lien direct du PDF
  const cleanPhone = formatPhoneForWhatsApp(guest.phone);
  const message = generateWhatsAppInvitationMessage(guest, details, pdfPublicUrl);

  const waUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  window.open(waUrl, '_blank');
  return { method: 'cloud', pdfUrl: pdfPublicUrl };
}

/**
 * Télécharge directement le PDF pour un invité
 */
export async function downloadInvitationPdf(
  guest: RSVPData,
  details: WeddingDetails,
  programSteps?: ProgramEvent[],
  venues?: VenueData[]
) {
  const doc = await generateInvitationPdf(guest, details, programSteps, venues);
  const safeName = (guest.full_name || 'Invite').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Invitation_Officielle_Mariage_Jonas_Flora_${safeName}.pdf`);
}
