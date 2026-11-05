import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { dictionaries } from "@/i18n/dictionary";
import { looksLikeBot, validateDemoRequest, type DemoRequestInput } from "@/lib/validation";

/**
 * POST /api/demo-request
 * Server-side gate for the demo form: size limit → rate limit → bot check →
 * validation/sanitization → forward to LEAD_WEBHOOK_URL (env var, never exposed to the browser).
 * Sets no cookies.
 */

const MAX_BODY_BYTES = 8_000;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
// Best-effort, per-instance limiter. For multi-region production traffic, back this with Upstash/Redis.
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > RATE_MAX;
}

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "unsupported_media_type" }, 415);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

  let input: Partial<DemoRequestInput>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json({ ok: false, error: "too_large" }, 413);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("bad shape");
    input = parsed as Partial<DemoRequestInput>;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Silently accept bot submissions so scripts can't learn what tripped the filter.
  if (looksLikeBot(input)) return json({ ok: true }, 200);

  const result = validateDemoRequest(input);
  if (!result.ok) return json({ ok: false, error: "validation", fields: result.errors }, 422);

  const lead = result.data;
  const t = dictionaries[lead.language];
  const payload = {
    type: "demo_request",
    submittedAt: new Date().toISOString(),
    lead,
    // Proof-of-consent record (TCPA / A2P 10DLC): exact wording shown, version, and timestamp.
    consent: {
      version: siteConfig.consentVersion,
      language: lead.language,
      policyAccepted: true,
      sms: lead.smsConsent
        ? {
            granted: true,
            phone: lead.phone,
            text: `${t.demo.smsConsent} ${t.demo.smsConsentDetail
              .replace("{privacy}", t.demo.privacyLink)
              .replace("{terms}", t.demo.termsLink)}`,
          }
        : { granted: false },
    },
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    if (process.env.NODE_ENV === "production") {
      console.error("[demo-request] LEAD_WEBHOOK_URL is not set — lead could not be delivered.");
      return json({ ok: false, error: "not_configured" }, 503);
    }
    // Development only: log a redacted summary (never full PII) so the flow can be tested locally.
    console.info("[demo-request] dev mode — webhook not configured. Received:", {
      industry: lead.industry,
      language: lead.language,
      hasPhone: Boolean(lead.phone),
      smsConsent: lead.smsConsent,
    });
    return json({ ok: true }, 200);
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LEAD_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.LEAD_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[demo-request] webhook responded ${res.status}`);
      return json({ ok: false, error: "upstream" }, 502);
    }
  } catch (error) {
    console.error("[demo-request] webhook delivery failed:", error instanceof Error ? error.message : error);
    return json({ ok: false, error: "upstream" }, 502);
  }

  return json({ ok: true }, 200);
}
