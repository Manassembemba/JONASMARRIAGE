import express from 'express';
import path from 'path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  getWeddingSettings,
  saveWeddingSetting,
  getAllRsvps,
  addRsvp,
  updateRsvp,
  deleteRsvp,
  markRsvpRead,
  getAllGuestbook,
  addGuestbook,
  toggleGuestbookApproval,
  deleteGuestbook,
  markGuestbookRead,
  markAllNotificationsRead,
  getAdminPin,
  setAdminPin,
  verifyAdminPin,
  resetDatabaseToDefaults,
  getDatabaseStats,
} from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Ensure persistent uploads and public directories are served statically
  const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  app.use('/uploads', express.static(UPLOADS_DIR));

  const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
  app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets')));
  app.use(express.static(PUBLIC_DIR));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Dedicated upload endpoint: saves image to disk and returns persistent URL
  app.post('/api/upload', (req, res) => {
    try {
      const { dataUrl, filename } = req.body || {};
      if (!dataUrl || typeof dataUrl !== 'string') {
        return res.status(400).json({ success: false, error: "Données d'image manquantes" });
      }

      // If it's already an external or absolute URL, return it directly
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://') || dataUrl.startsWith('/uploads/')) {
        return res.json({ success: true, url: dataUrl });
      }

      // Parse data URI format: data:image/jpeg;base64,....
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ success: false, error: 'Format de fichier non reconnu' });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      let ext = 'jpg';
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('gif')) ext = 'gif';

      const cleanName = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) : 'photo';
      const fileBaseName = `${cleanName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, fileBaseName);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${fileBaseName}`;
      console.log(`[Upload] Image persisted to disk: ${publicUrl} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return res.json({ success: true, url: publicUrl, size: buffer.length });
    } catch (err: any) {
      console.error('Error handling upload:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get full wedding data (settings + rsvps + guestbook)
  app.get('/api/wedding-data', (req, res) => {
    try {
      const settings = getWeddingSettings();
      const rsvps = getAllRsvps();
      const guestbook = getAllGuestbook();
      res.json({
        success: true,
        data: {
          ...settings,
          rsvps,
          guestbook,
        },
      });
    } catch (err: any) {
      console.error('Error fetching wedding data:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Wedding Details (Dates, Names, Quotes, Announcement...)
  app.put('/api/settings/details', (req, res) => {
    try {
      const details = req.body;
      if (!details || typeof details !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid details object' });
      }
      saveWeddingSetting('details', details);
      res.json({ success: true, data: details });
    } catch (err: any) {
      console.error('Error updating details:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Program Steps
  app.put('/api/settings/program', (req, res) => {
    try {
      const programSteps = req.body;
      if (!Array.isArray(programSteps)) {
        return res.status(400).json({ success: false, error: 'Program steps must be an array' });
      }
      saveWeddingSetting('program_steps', programSteps);
      res.json({ success: true, data: programSteps });
    } catch (err: any) {
      console.error('Error updating program:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Venues & Addresses
  app.put('/api/settings/venues', (req, res) => {
    try {
      const venues = req.body;
      if (!Array.isArray(venues)) {
        return res.status(400).json({ success: false, error: 'Venues must be an array' });
      }
      saveWeddingSetting('venues', venues);
      res.json({ success: true, data: venues });
    } catch (err: any) {
      console.error('Error updating venues:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Story Milestones
  app.put('/api/settings/story', (req, res) => {
    try {
      const milestones = req.body;
      if (!Array.isArray(milestones)) {
        return res.status(400).json({ success: false, error: 'Milestones must be an array' });
      }
      saveWeddingSetting('story_milestones', milestones);
      res.json({ success: true, data: milestones });
    } catch (err: any) {
      console.error('Error updating story:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Gallery Items
  app.put('/api/settings/gallery', (req, res) => {
    try {
      const galleryItems = req.body;
      if (!Array.isArray(galleryItems)) {
        return res.status(400).json({ success: false, error: 'Gallery items must be an array' });
      }
      saveWeddingSetting('gallery_items', galleryItems);
      res.json({ success: true, data: galleryItems });
    } catch (err: any) {
      console.error('Error updating gallery:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // RSVPs endpoints
  app.get('/api/rsvps', (req, res) => {
    try {
      const rsvps = getAllRsvps();
      res.json({ success: true, data: rsvps });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/rsvps', (req, res) => {
    try {
      const { full_name, phone, email, attendance, guests_count, guest_names, message } = req.body;
      if (!full_name || !phone) {
        return res.status(400).json({ success: false, error: 'Nom et téléphone requis' });
      }

      const rsvp = {
        id: req.body.id || `rsvp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        full_name: full_name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : '',
        attendance: attendance === 'non' ? 'non' : 'oui',
        guests_count: Number(guests_count) || 1,
        guest_names: guest_names || '',
        message: message || '',
        created_at: req.body.created_at || new Date().toISOString(),
      };

      addRsvp(rsvp);
      res.status(201).json({ success: true, data: rsvp });
    } catch (err: any) {
      console.error('Error adding RSVP:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/rsvps/:id', (req, res) => {
    try {
      const id = req.params.id;
      const updated = { ...req.body, id };
      updateRsvp(updated);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      console.error('Error updating RSVP:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/rsvps/:id', (req, res) => {
    try {
      const id = req.params.id;
      deleteRsvp(id);
      res.json({ success: true, message: 'RSVP supprimé' });
    } catch (err: any) {
      console.error('Error deleting RSVP:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Guestbook endpoints
  app.get('/api/guestbook', (req, res) => {
    try {
      const guestbook = getAllGuestbook();
      res.json({ success: true, data: guestbook });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/guestbook', (req, res) => {
    try {
      const { name, relation, message } = req.body;
      if (!name || !message) {
        return res.status(400).json({ success: false, error: 'Nom et message requis' });
      }

      const entry = {
        id: req.body.id || `gb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim(),
        relation: relation ? relation.trim() : '',
        message: message.trim(),
        approved: req.body.approved !== undefined ? Boolean(req.body.approved) : true,
        created_at: req.body.created_at || new Date().toISOString(),
      };

      addGuestbook(entry);
      res.status(201).json({ success: true, data: entry });
    } catch (err: any) {
      console.error('Error adding guestbook message:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/guestbook/:id/toggle', (req, res) => {
    try {
      const id = req.params.id;
      const newStatus = toggleGuestbookApproval(id);
      res.json({ success: true, approved: newStatus });
    } catch (err: any) {
      console.error('Error toggling guestbook:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/guestbook/:id', (req, res) => {
    try {
      const id = req.params.id;
      deleteGuestbook(id);
      res.json({ success: true, message: 'Message supprimé' });
    } catch (err: any) {
      console.error('Error deleting guestbook message:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mark RSVP read/unread
  app.patch('/api/rsvps/:id/read', (req, res) => {
    try {
      const id = req.params.id;
      const { is_read = true } = req.body || {};
      markRsvpRead(id, Boolean(is_read));
      res.json({ success: true, message: 'Statut mis à jour' });
    } catch (err: any) {
      console.error('Error marking RSVP as read:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mark Guestbook message read/unread
  app.patch('/api/guestbook/:id/read', (req, res) => {
    try {
      const id = req.params.id;
      const { is_read = true } = req.body || {};
      markGuestbookRead(id, Boolean(is_read));
      res.json({ success: true, message: 'Statut mis à jour' });
    } catch (err: any) {
      console.error('Error marking guestbook message as read:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mark all notifications (RSVPs & Guestbook) as read
  app.post('/api/notifications/mark-all-read', (req, res) => {
    try {
      markAllNotificationsRead();
      res.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin PIN verification
  app.post('/api/admin/verify-pin', (req, res) => {
    try {
      const { pin } = req.body || {};
      if (!pin || typeof pin !== 'string') {
        return res.status(400).json({ success: false, valid: false, message: 'Code PIN requis' });
      }
      const isValid = verifyAdminPin(pin);
      res.json({ success: true, valid: isValid });
    } catch (err: any) {
      console.error('Error verifying PIN:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin PIN change
  app.put('/api/admin/change-pin', (req, res) => {
    try {
      const { currentPin, newPin } = req.body || {};
      if (!currentPin || !newPin) {
        return res.status(400).json({ success: false, message: 'Code actuel et nouveau code requis' });
      }
      if (!verifyAdminPin(currentPin)) {
        return res.status(401).json({ success: false, message: 'Code d\'accès actuel incorrect' });
      }
      if (typeof newPin !== 'string' || newPin.trim().length < 4) {
        return res.status(400).json({ success: false, message: 'Le nouveau code doit comporter au moins 4 caractères' });
      }
      setAdminPin(newPin.trim());
      res.json({ success: true, message: 'Code d\'accès mis à jour avec succès' });
    } catch (err: any) {
      console.error('Error changing PIN:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reset to default data
  app.post('/api/admin/reset-defaults', (req, res) => {
    try {
      resetDatabaseToDefaults();
      const settings = getWeddingSettings();
      const rsvps = getAllRsvps();
      const guestbook = getAllGuestbook();
      res.json({
        success: true,
        message: 'Base de données SQLite réinitialisée avec succès',
        data: {
          ...settings,
          rsvps,
          guestbook,
        },
      });
    } catch (err: any) {
      console.error('Error resetting database:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DB Status
  app.get('/api/db/status', (req, res) => {
    try {
      const stats = getDatabaseStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development vs Static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Jonas & Flora Wedding Platform running on port ${PORT}`);
  });
}

startServer();
