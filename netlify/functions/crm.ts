/**
 * CRM API for /admin — reads the Netlify form "enquiries" and keeps each lead's
 * pipeline status and notes in Netlify Blobs (store "crm"). Same origin as the site,
 * so the strict CSP (connect-src 'self') still holds and no third party sees leads.
 *
 *   GET    /api/crm/session        200 when signed in, else 401
 *   POST   /api/crm/login          { password } → sets the session cookie
 *   POST   /api/crm/logout         clears it
 *   GET    /api/crm/leads          every submission + its CRM record
 *   PATCH  /api/crm/leads/:id      { status?, note? }
 *
 * Environment (Netlify → Site configuration → Environment variables, scope "Functions"):
 *   CRM_PASSWORD        the password you type on /admin
 *   CRM_SESSION_SECRET  32+ random characters; signs the session cookie
 *   NETLIFY_API_TOKEN   a Netlify personal access token (User settings → Applications)
 *
 * Security: the session is an HttpOnly, Secure, SameSite=Strict cookie scoped to /api/crm,
 * signed with HMAC-SHA256 and valid for 12 hours. Every write must come from this origin
 * with a JSON body. Failed logins are throttled per IP (10 per 15 minutes).
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";

type Ctx = { site?: { id?: string }; ip?: string };

export const STATUSES = ["new", "contacted", "mockup", "won", "lost"] as const;
type Status = (typeof STATUSES)[number];
type CrmRecord = { status: Status; note: string; updatedAt: string };

const COOKIE = "serma_crm";
const SESSION_HOURS = 12;
const MAX_NOTE = 4000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILS = 10;

const env = (k: string) => process.env[k] ?? "";

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

/* ------------------------------ session ------------------------------ */

const sign = (payload: string) => createHmac("sha256", env("CRM_SESSION_SECRET")).update(payload).digest("base64url");

function sameText(a: string, b: string) {
  // Hash first so lengths always match and nothing leaks through timing.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function readCookie(req: Request, name: string) {
  const raw = req.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return "";
}

function signedIn(req: Request) {
  // No (or a weak) secret means no sessions at all: an empty HMAC key could be forged by anyone.
  if (env("CRM_SESSION_SECRET").length < 32) return false;
  const value = readCookie(req, COOKIE);
  const [exp, mac] = value.split(".");
  if (!exp || !mac || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;
  return sameText(mac, sign(exp));
}

function sessionCookie(maxAge: number, value: string) {
  return `${COOKIE}=${value}; Path=/api/crm; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

/** Writes must come from this site: same Origin and a JSON body (a plain HTML form cannot send one). */
function trustedWrite(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) return false;
  return (req.headers.get("content-type") ?? "").startsWith("application/json");
}

/* ------------------------------ Netlify API ------------------------------ */

const API = "https://api.netlify.com/api/v1";

async function netlify<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${env("NETLIFY_API_TOKEN")}` } });
  if (!res.ok) throw new Error(`Netlify API ${res.status} on ${path.split("?")[0]}`);
  return res.json() as Promise<T>;
}

type Submission = { id: string; created_at: string; data: Record<string, string | undefined> };

async function enquiries(siteId: string) {
  const forms = await netlify<{ id: string; name: string }[]>(`/sites/${siteId}/forms`);
  const form = forms.find((f) => f.name === "enquiries");
  if (!form) return [];
  const all: Submission[] = [];
  // 100 per page; stop at 20 pages (2,000 leads) so one request can never run away.
  for (let page = 1; page <= 20; page++) {
    const batch = await netlify<Submission[]>(`/forms/${form.id}/submissions?per_page=100&page=${page}`);
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

/* ------------------------------ handlers ------------------------------ */

async function login(req: Request, ctx: Ctx) {
  if (!trustedWrite(req)) return json({ error: "Bad request" }, 400);
  if (!env("CRM_PASSWORD") || env("CRM_SESSION_SECRET").length < 32) {
    return json({ error: "The CRM is not set up yet: add CRM_PASSWORD and CRM_SESSION_SECRET in Netlify." }, 503);
  }
  const guard = getStore("crm-guard");
  const who = createHash("sha256").update(ctx.ip ?? "unknown").digest("hex").slice(0, 24);
  const fails = ((await guard.get(who, { type: "json" })) as { n: number; since: number } | null) ?? { n: 0, since: Date.now() };
  const fresh = Date.now() - fails.since > LOGIN_WINDOW_MS ? { n: 0, since: Date.now() } : fails;
  if (fresh.n >= LOGIN_MAX_FAILS) return json({ error: "Too many tries. Wait 15 minutes and try again." }, 429);

  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
  if (!sameText(password, env("CRM_PASSWORD"))) {
    await guard.setJSON(who, { n: fresh.n + 1, since: fresh.since });
    await new Promise((r) => setTimeout(r, 600));
    return json({ error: "That password is not right." }, 401);
  }
  await guard.delete(who);
  const exp = String(Date.now() + SESSION_HOURS * 3600 * 1000);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(SESSION_HOURS * 3600, `${exp}.${sign(exp)}`) });
}

async function leads(ctx: Ctx) {
  const siteId = ctx.site?.id ?? env("SITE_ID");
  if (!env("NETLIFY_API_TOKEN") || !siteId) {
    return json({ error: "Add NETLIFY_API_TOKEN in Netlify so the CRM can read your form submissions." }, 503);
  }
  const store = getStore({ name: "crm", consistency: "strong" });
  const subs = await enquiries(siteId);
  const records = await Promise.all(subs.map((s) => store.get(s.id, { type: "json" }) as Promise<CrmRecord | null>));
  return json({
    leads: subs.map((s, i) => {
      const d = s.data ?? {};
      return {
        id: s.id,
        receivedAt: d.submitted_on || s.created_at,
        name: d.name ?? "",
        business: d.business ?? "",
        phone: d.phone ?? "",
        package: d.package ?? "",
        industry: d.industry ?? "",
        need: d.need ?? "",
        status: records[i]?.status ?? "new",
        note: records[i]?.note ?? "",
        updatedAt: records[i]?.updatedAt ?? null,
      };
    }),
  });
}

async function update(req: Request, id: string) {
  if (!trustedWrite(req)) return json({ error: "Bad request" }, 400);
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(id)) return json({ error: "Unknown lead" }, 404);
  const body = (await req.json().catch(() => ({}))) as { status?: unknown; note?: unknown };
  const store = getStore({ name: "crm", consistency: "strong" });
  const prev = ((await store.get(id, { type: "json" })) as CrmRecord | null) ?? { status: "new", note: "", updatedAt: "" };
  const next: CrmRecord = { ...prev, updatedAt: new Date().toISOString() };
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status as Status)) return json({ error: "Unknown status" }, 400);
    next.status = body.status as Status;
  }
  if (body.note !== undefined) {
    if (typeof body.note !== "string") return json({ error: "Note must be text" }, 400);
    next.note = body.note.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").slice(0, MAX_NOTE);
  }
  await store.setJSON(id, next);
  return json(next);
}

export default async (req: Request, ctx: Ctx) => {
  const path = new URL(req.url).pathname.replace(/\/+$/, "");
  const route = path.replace(/^\/api\/crm/, "") || "/";
  try {
    if (route === "/login" && req.method === "POST") return await login(req, ctx);
    if (route === "/logout" && req.method === "POST") {
      return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(0, "") });
    }
    if (!signedIn(req)) return json({ error: "Signed out" }, 401);
    if (route === "/session" && req.method === "GET") return json({ ok: true });
    if (route === "/leads" && req.method === "GET") return await leads(ctx);
    const m = route.match(/^\/leads\/([^/]+)$/);
    if (m && req.method === "PATCH") return await update(req, m[1]);
    return json({ error: "Not found" }, 404);
  } catch (err) {
    console.error("[crm]", err instanceof Error ? err.message : err);
    return json({ error: "Something went wrong reading your leads. Try again in a minute." }, 502);
  }
};

export const config = { path: ["/api/crm/*"] };
