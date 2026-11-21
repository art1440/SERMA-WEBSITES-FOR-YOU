import { MOCKUP } from "@/data/mockup";
import type { Tone } from "./ui";

/** Mirrors netlify/functions/crm.ts. */
export const STATUSES = ["new", "contacted", "mockup", "won", "lost"] as const;
export type Status = (typeof STATUSES)[number];

export type Lead = {
  id: string;
  receivedAt: string;
  name: string;
  business: string;
  phone: string;
  package: string;
  industry: string;
  need: string;
  status: Status;
  note: string;
  updatedAt: string | null;
};

export const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  contacted: "Contacted",
  mockup: "Preview sent",
  won: "Won",
  lost: "Lost",
};

/** Same tones as the dashboard showcase chips: a word + a dot, never colour alone. */
export const STATUS_TONE: Record<Status, Tone> = {
  new: "aqua",
  contacted: "neutral",
  mockup: "neutral",
  won: "live",
  lost: "neutral",
};

/** Pipeline bar fill per stage (decorative; every stage is also labelled with a word). */
export const STATUS_FILL: Record<Status, string> = {
  new: "bg-aqua",
  contacted: "bg-aqua/55",
  mockup: "bg-aqua-glow/70",
  won: "bg-live",
  lost: "bg-bone/20",
};

/** Which form sent it: the free-preview pop-up writes a fixed sentence into "need" (older leads carry an earlier wording). */
export const sourceOf = (l: Pick<Lead, "need">) =>
  l.need === MOCKUP.needNote || MOCKUP.legacyNeedNotes.includes(l.need) ? "Preview pop-up" : "Pricing form";

/* ------------------------------ API ------------------------------ */

export class SignedOut extends Error {}
/** The function is not deployed here (plain `next dev`): fall back to the local preview. */
export class NoBackend extends Error {}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/crm${path}`, {
      credentials: "same-origin",
      cache: "no-store",
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    });
  } catch {
    throw new Error("You look offline. Check your connection and try again.");
  }
  if (res.status === 401 && path !== "/login") throw new SignedOut();
  const isJson = (res.headers.get("content-type") ?? "").includes("application/json");
  if (!isJson) throw new NoBackend();
  const body = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

export const api = {
  session: () => call<{ ok: true }>("/session"),
  login: (password: string) => call<{ ok: true }>("/login", { method: "POST", body: JSON.stringify({ password }) }),
  logout: () => call<{ ok: true }>("/logout", { method: "POST", body: "{}" }),
  leads: () => call<{ leads: Lead[] }>("/leads").then((r) => r.leads),
  update: (id: string, patch: Partial<Pick<Lead, "status" | "note">>) =>
    call<Pick<Lead, "status" | "note" | "updatedAt">>(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
};

export const isLocalPreview = () =>
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

/* ------------------------------ helpers ------------------------------ */

export function relativeTime(iso: string, now = Date.now()) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.round(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const fullDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** Digits only, for tel: and sms: links. */
export const dialable = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 ? `+1${d}` : d.length === 11 ? `+${d}` : d;
};

export function toCsv(leads: Lead[]) {
  const cols: (keyof Lead)[] = ["receivedAt", "name", "business", "phone", "package", "industry", "need", "status", "note"];
  // Quote every cell; a leading = + - @ would run as a formula in spreadsheets, so prefix it.
  const cell = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [cols.join(","), ...leads.map((l) => cols.map((c) => cell(c === "status" ? STATUS_LABEL[l.status] : l[c])).join(","))].join("\r\n");
}

/* ------------------------------ local preview ------------------------------ */

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

/** Fictional people, only ever shown on localhost when the Netlify function is not running. */
export const SAMPLE_LEADS: Lead[] = [
  { id: "s1", receivedAt: ago(0.4), name: "Marcus Bell", business: "Bell's Fade Studio", phone: "(512) 555-0182", package: "", industry: "", need: MOCKUP.needNote, status: "new", note: "", updatedAt: null },
  { id: "s2", receivedAt: ago(3), name: "Lucía Ortega", business: "Casa Ortega Cocina", phone: "(737) 555-0140", package: "Business", industry: "Restaurant", need: "We need online reservations and a menu people can read on a phone. Our current site is from 2014.", status: "new", note: "", updatedAt: null },
  { id: "s3", receivedAt: ago(20), name: "Dana Whitfield", business: "Whitfield Remodeling", phone: "(512) 555-0117", package: "Growth", industry: "Contractor", need: "Want a site that shows our kitchen and bath projects and gets quote requests.", status: "contacted", note: "Called Tue. Wants before/after photos up front. Send examples.", updatedAt: ago(18) },
  { id: "s4", receivedAt: ago(46), name: "Priya Nair", business: "Glow Brow Bar", phone: "(512) 555-0193", package: "Starter", industry: "Beauty", need: "Booking link + Instagram feed.", status: "mockup", note: "Preview sent Thursday, follow up Monday.", updatedAt: ago(30) },
  { id: "s5", receivedAt: ago(96), name: "Tom Reyes", business: "Reyes Lawn & Pressure Wash", phone: "(830) 555-0166", package: "Business", industry: "Home services", need: "Show up on Google when people search pressure washing near me.", status: "won", note: "Signed. Launch Dec 2.", updatedAt: ago(70) },
  { id: "s6", receivedAt: ago(150), name: "Alyssa Kim", business: "Studio Lumen Salon", phone: "(512) 555-0109", package: "", industry: "Hair salon", need: MOCKUP.needNote, status: "lost", note: "Went with a friend's nephew.", updatedAt: ago(120) },
  { id: "s7", receivedAt: ago(200), name: "Jorge Medina", business: "Medina Barber Co.", phone: "(210) 555-0158", package: "Starter", industry: "Barbershop", need: "Simple site with prices and a book button.", status: "contacted", note: "", updatedAt: ago(190) },
];
