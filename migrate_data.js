import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';
import path from 'node:path';
import fs from 'node:fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const dbPath = path.resolve(process.cwd(), 'data', 'wedding.sqlite');

if (!fs.existsSync(dbPath)) {
  console.error(`SQLite file not found at ${dbPath}`);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

async function migrate() {
  console.log('--- Starting Migration from SQLite to Supabase ---');

  // 1. Migrate Settings
  console.log('Migrating wedding_settings...');
  const settings = db.prepare('SELECT key, value FROM wedding_settings').all();
  for (const setting of settings) {
    let parsedValue = setting.value;
    try {
      parsedValue = JSON.parse(setting.value);
    } catch (e) {
      // It's a string, wrap it
    }
    const { error } = await supabase.from('wedding_settings').upsert({
      key: setting.key,
      value: parsedValue
    });
    if (error) console.error(`Error migrating setting ${setting.key}:`, error);
  }
  console.log(`Migrated ${settings.length} settings.`);

  // 2. Migrate RSVPs
  console.log('Migrating RSVPs...');
  const rsvps = db.prepare('SELECT * FROM rsvps').all();
  if (rsvps.length > 0) {
    const formattedRsvps = rsvps.map(r => ({
      id: r.id,
      full_name: r.full_name,
      phone: r.phone,
      email: r.email,
      attendance: r.attendance,
      guests_count: r.guests_count,
      guest_names: r.guest_names,
      message: r.message,
      created_at: r.created_at,
      is_read: Boolean(r.is_read)
    }));
    const { error } = await supabase.from('rsvps').upsert(formattedRsvps);
    if (error) console.error('Error migrating RSVPs:', error);
    else console.log(`Migrated ${rsvps.length} RSVPs.`);
  } else {
    console.log('No RSVPs to migrate.');
  }

  // 3. Migrate Guestbook
  console.log('Migrating Guestbook...');
  const guestbook = db.prepare('SELECT * FROM guestbook').all();
  if (guestbook.length > 0) {
    const formattedGb = guestbook.map(g => ({
      id: g.id,
      name: g.name,
      relation: g.relation,
      message: g.message,
      approved: Boolean(g.approved),
      created_at: g.created_at,
      is_read: Boolean(g.is_read)
    }));
    const { error } = await supabase.from('guestbook').upsert(formattedGb);
    if (error) console.error('Error migrating Guestbook:', error);
    else console.log(`Migrated ${guestbook.length} Guestbook messages.`);
  } else {
    console.log('No Guestbook messages to migrate.');
  }

  console.log('--- Migration Completed Successfully ---');
}

migrate().catch(console.error);
