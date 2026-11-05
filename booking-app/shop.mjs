/** The one test shop. In the real app this lives in the database, one row per client. */
export const shop = {
  name: 'Demo Barber Co.',
  timeZone: 'America/Chicago',
  slotMinutes: 30,
  // 0 = Sunday. Closed Sundays.
  hours: { 1: ['09:00', '17:00'], 2: ['09:00', '17:00'], 3: ['09:00', '17:00'], 4: ['09:00', '19:00'], 5: ['09:00', '19:00'], 6: ['08:00', '15:00'] },
  daysAhead: 14,
  services: [
    { id: 'cut', name: 'Haircut', minutes: 30, price: 30 },
    { id: 'fade', name: 'Skin fade', minutes: 45, price: 38 },
    { id: 'beard', name: 'Beard trim', minutes: 30, price: 18 },
    { id: 'combo', name: 'Fade + beard', minutes: 60, price: 52 },
  ],
};
