# Booking prototype

A working prototype of the booking system every client site will include: a public booking page and a live owner dashboard. One test shop, no outside services.

## Run it

Requires Node 22.13+. No install step: it uses only Node's built-in modules.

```bash
npm start
```

- Booking page: http://localhost:3000/
- Owner dashboard: http://localhost:3000/dashboard (PIN `4821`, set `OWNER_PIN` to change it)

Open the dashboard on one device and book from another. The booking appears on the dashboard within about a second, with no refresh.

```bash
npm test
```

## What it does

- **Booking page:** pick a service, a day (next 14 days, closed Sundays), and an open time. Past times today and taken times are greyed out.
- **No double bookings, ever:** each booking claims its 30-minute slots in the database, and a slot can only be claimed once. Tested with 20 people racing for the same time: exactly one wins, and the others are asked to pick another time.
- **Live dashboard:** the owner's screen keeps a live connection (server-sent events). New bookings and cancellations appear instantly. If the connection drops, it reconnects and catches up.
- **Alerts:** the tab title flashes, and with "Turn on alerts" the browser shows a notification when the dashboard is in the background.
- **Cancel:** frees the time for someone else right away.
- **Emails:** set `RESEND_API_KEY`, `FROM_EMAIL`, and `OWNER_EMAIL` to send real confirmations to customers and alerts to the owner. Without them, emails are skipped.
- **Basic protection:** input validation, per-IP rate limiting, HttpOnly owner session cookie.

## Settings

| Variable | Default | What |
|---|---|---|
| `PORT` | 3000 | Port |
| `OWNER_PIN` | 4821 | Dashboard PIN |
| `DB_FILE` | bookings.db | SQLite file |
| `RESEND_API_KEY`, `FROM_EMAIL`, `OWNER_EMAIL` | none | Real emails |

The shop (name, hours, services, time zone) is in `shop.mjs`.

## Not in the prototype yet

- Many shops in one system (each seeing only its own data), and Postgres instead of SQLite
- Email-link login instead of a PIN
- Reminder emails the day before, text messages
- Owner tools: block off time, edit hours and services, staff calendars
- Installable phone app for push notifications when the dashboard is closed

## Hosting note

The live dashboard needs a server that stays running (Render, Railway, or Fly.io, roughly $5–7/month to start). Netlify Functions don't hold long-lived connections, so on Netlify the dashboard would check for updates every few seconds instead.
