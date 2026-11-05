/**
 * Storage. SQLite for the prototype; the schema maps 1:1 to Postgres for production.
 * Double bookings are impossible: every booking claims its time slots in `booking_slots`,
 * and a slot can only be claimed once (primary key). Two people racing for 3:00 → one wins.
 */
import { DatabaseSync } from 'node:sqlite';

export function openDb(file = ':memory:') {
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT NOT NULL,
      date TEXT NOT NULL,           -- shop-local YYYY-MM-DD
      start TEXT NOT NULL,          -- shop-local HH:MM
      minutes INTEGER NOT NULL CHECK (minutes > 0),
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled')),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX IF NOT EXISTS bookings_by_day ON bookings (date, start);
    CREATE TABLE IF NOT EXISTS booking_slots (
      slot TEXT PRIMARY KEY,        -- "YYYY-MM-DD HH:MM", one row per occupied 30-minute slot
      booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE
    );
  `);

  const insertBooking = db.prepare(`INSERT INTO bookings (service_id, date, start, minutes, customer_name, customer_phone, customer_email)
    VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`);
  const claimSlot = db.prepare('INSERT INTO booking_slots (slot, booking_id) VALUES (?, ?)');
  const takenSlots = db.prepare('SELECT slot FROM booking_slots WHERE slot >= ? AND slot < ?');
  const byRange = db.prepare(`SELECT * FROM bookings WHERE date >= ? AND date <= ? ORDER BY date, start`);
  const byId = db.prepare('SELECT * FROM bookings WHERE id = ?');
  const cancelOne = db.prepare(`UPDATE bookings SET status = 'cancelled' WHERE id = ? AND status = 'booked' RETURNING *`);
  const freeSlots = db.prepare('DELETE FROM booking_slots WHERE booking_id = ?');

  return {
    /** Returns the booking, or null if any of its slots is already taken. */
    book({ serviceId, date, start, minutes, slots, name, phone, email }) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const b = insertBooking.get(serviceId, date, start, minutes, name, phone, email ?? null);
        for (const s of slots) claimSlot.run(s, b.id);
        db.exec('COMMIT');
        return b;
      } catch (err) {
        db.exec('ROLLBACK');
        if (String(err.message).includes('UNIQUE')) return null;
        throw err;
      }
    },
    taken(date) {
      return new Set(takenSlots.all(`${date} 00:00`, `${date} 99:99`).map((r) => r.slot));
    },
    range(from, to) { return byRange.all(from, to); },
    get(id) { return byId.get(id) ?? null; },
    cancel(id) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const b = cancelOne.get(id);
        if (b) freeSlots.run(id);
        db.exec('COMMIT');
        return b ?? null;
      } catch (err) { db.exec('ROLLBACK'); throw err; }
    },
    close() { db.close(); },
  };
}
