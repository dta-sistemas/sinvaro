import "server-only";
import { NextResponse, type NextRequest } from "next/server";

const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX = 5;

/** Límite simple en memoria (por instancia). Suficiente para frenar abuso básico; no sustituye a un WAF. */
export function rateLimited(req: NextRequest, scope: string): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || cur.reset < now) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return false;
  }
  cur.count += 1;
  return cur.count > MAX;
}

export function crossSite(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  return !!origin && new URL(origin).host !== req.headers.get("host");
}

export const json = (code: string, status: number) => NextResponse.json({ ok: status < 300, code }, { status });
