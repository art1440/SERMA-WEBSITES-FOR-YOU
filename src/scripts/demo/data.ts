/** Made-up shops and bookings for the interactive demo. Nothing here is a real business or customer. */

export type Industry = 'barber' | 'nails' | 'massage';

export interface Service { id: string; name: string; short: string; minutes: number; price: number }
export interface Shop { name: string; services: Service[]; staff: string }

export const shops: Record<Industry, Shop> = {
  barber: {
    name: 'Demo Barber Co.',
    staff: 'Chris',
    services: [
      { id: 'cut', name: 'Haircut', short: 'Cut', minutes: 30, price: 30 },
      { id: 'fade', name: 'Skin fade', short: 'Fade', minutes: 45, price: 38 },
      { id: 'beard', name: 'Beard trim', short: 'Beard', minutes: 20, price: 18 },
      { id: 'combo', name: 'Fade + beard', short: 'Fade+beard', minutes: 60, price: 52 },
    ],
  },
  nails: {
    name: 'Demo Nail Studio',
    staff: 'Lupe',
    services: [
      { id: 'gel', name: 'Gel manicure', short: 'Gel', minutes: 45, price: 40 },
      { id: 'set', name: 'Full set', short: 'Full set', minutes: 75, price: 60 },
      { id: 'fill', name: 'Fill', short: 'Fill', minutes: 45, price: 35 },
      { id: 'pedi', name: 'Pedicure', short: 'Pedi', minutes: 50, price: 45 },
    ],
  },
  massage: {
    name: 'Demo Massage',
    staff: 'Dana',
    services: [
      { id: 'swe60', name: '60-min Swedish', short: 'Swedish 60', minutes: 60, price: 90 },
      { id: 'deep90', name: '90-min deep tissue', short: 'Deep 90', minutes: 90, price: 130 },
      { id: 'sport60', name: '60-min sports', short: 'Sports 60', minutes: 60, price: 95 },
      { id: 'chair30', name: '30-min chair', short: 'Chair 30', minutes: 30, price: 45 },
    ],
  },
};

export const slots = [
  { label: '9:00 AM', min: 9 * 60 },
  { label: '10:00 AM', min: 10 * 60 },
  { label: '11:00 AM', min: 11 * 60 },
  { label: '12:30 PM', min: 12 * 60 + 30 },
  { label: '1:30 PM', min: 13 * 60 + 30 },
  { label: '2:30 PM', min: 14 * 60 + 30 },
  { label: '3:30 PM', min: 15 * 60 + 30 },
  { label: '4:30 PM', min: 16 * 60 + 30 },
];

const clients = ['Marcus', 'Sofia', 'Diego', 'Kayla', 'Andre', 'Lupita', 'Chris', 'Mia', 'Javier', 'Taylor', 'Renee', 'Omar'];

export interface Day { index: number; date: Date; short: string; long: string }

/** The next six open days (closed Sundays), starting today. */
export function openDays(now: Date): Day[] {
  const days: Day[] = [];
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (days.length < 6) {
    if (d.getDay() !== 0) {
      const i = days.length;
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      days.push({
        index: i,
        date: new Date(d),
        short: i === 0 && sameDay(d, now) ? 'Today' : weekday,
        long: `${i === 0 && sameDay(d, now) ? 'Today' : weekday}, ${month} ${d.getDate()}`,
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Deterministic "random" so the same shop always shows the same week. */
function hash(a: number, b: number, c: number) {
  let h = (a * 374761393 + b * 668265263 + c * 2246822519) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export interface Booking { day: number; slot: number; client: string; serviceId: string; isNew?: boolean }

export function existingBookings(industry: Industry): Booking[] {
  const seed = industry === 'barber' ? 1 : industry === 'nails' ? 2 : 3;
  const services = shops[industry].services;
  const out: Booking[] = [];
  let n = 0;
  for (let day = 0; day < 6; day++) {
    for (let slot = 0; slot < slots.length; slot++) {
      if (hash(day, slot, seed) < 0.42) {
        out.push({ day, slot, client: clients[(n * 7 + seed) % clients.length]!, serviceId: services[(n + day) % services.length]!.id });
        n++;
      }
    }
  }
  return out;
}

/** A slot is unavailable if it's booked, or already in the past today. */
export function isTaken(bookings: Booking[], day: Day, slot: number, now: Date) {
  if (bookings.some((b) => b.day === day.index && b.slot === slot)) return true;
  if (day.short === 'Today') return slots[slot]!.min <= now.getHours() * 60 + now.getMinutes();
  return false;
}
