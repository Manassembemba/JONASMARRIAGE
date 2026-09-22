/**
 * Generates an .ics iCalendar file for Jonas & Flora's wedding ceremonies
 */
export function downloadWeddingIcs() {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Jonas & Flora//Mariage 2026//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Mariage Jonas & Flora
BEGIN:VEVENT
SUMMARY:💍 Mariage Civil — Jonas & Flora
DESCRIPTION:Célébration du Mariage Civil de Madikani Mbidi Jonas et Matelo Sanga Flora.\\nLieu : Maison Communale de Lemba.\\nAdresse : Avenue Kadjeke n° 1 Bis, Quartier Commercial, Commune de Lemba, Kinshasa.
DTSTART:20261029T100000Z
DTEND:20261029T120000Z
LOCATION:Maison Communale de Lemba, Avenue Kadjeke n° 1 Bis, Quartier Commercial, Lemba, Kinshasa
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
SUMMARY:❤️ Mariage Coutumier — Jonas & Flora
DESCRIPTION:Cérémonie Coutumière et Réjouissances de Jonas & Flora.\\nLieu : Résidence familiale.\\nAdresse : Avenue Bolia n°15, Quartier Mpasa 1, Commune de la N'sele, Kinshasa.\\nRepères : Arrêt 3 Paillote, Réf KIN MARCHE.
DTSTART:20261031T140000Z
DTEND:20261031T184500Z
LOCATION:Avenue Bolia n°15, Quartier Mpasa 1, Commune de la N'sele, Kinshasa
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Mariage_Jonas_Flora_Kinshasa_2026.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Returns a Google Calendar web url for the main event
 */
export function getGoogleCalendarUrl(): string {
  const title = encodeURIComponent('💍 Mariage Madikani Mbidi Jonas ❤️ Matelo Sanga Flora');
  const details = encodeURIComponent(
    'Célébration nuptiale de Madikani Mbidi Jonas et Matelo Sanga Flora à Kinshasa.\n\n- Jeudi 29 Octobre à 11h00 : Mariage Civil à la Maison Communale de Lemba\n- Samedi 31 Octobre de 15h00 à 19h45 : Mariage Coutumier à la Résidence Familiale (Avenue Bolia n°15, Mpasa 1, N\'sele)'
  );
  const location = encodeURIComponent('Maison Communale de Lemba & Résidence familiale N\'sele, Kinshasa');
  // From Civil to Coutumier
  const dates = '20261029T100000Z/20261031T190000Z';
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

/**
 * Creates a WhatsApp share link
 */
export function shareOnWhatsApp(url?: string): string {
  const targetUrl = url || window.location.href;
  const text = encodeURIComponent(
    `💍 Vous êtes cordialement invité(e) aux Célébrations Nuptiales de Madikani Mbidi Jonas ❤️ Matelo Sanga Flora à Kinshasa :\n• Mariage Civil : Jeudi 29 Octobre 2026 dès 10h30 (Lemba)\n• Mariage Coutumier : Samedi 31 Octobre 2026 de 15h00 à 19h45 (N'sele, Mpasa 1)\n\nDécouvrez le programme officiel et confirmez votre présence ici : ${targetUrl}`
  );
  return `https://api.whatsapp.com/send?text=${text}`;
}
