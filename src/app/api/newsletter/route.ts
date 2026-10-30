import type { NextRequest } from "next/server";
import { z } from "zod";
import { crossSite, json, rateLimited } from "@/lib/api-guard";
import { checkConfig, createContact } from "@/lib/resend";

export const runtime = "nodejs";

const body = z.object({ email: z.string().trim().max(254).pipe(z.email()), website: z.string().optional() });

export async function POST(req: NextRequest) {
  if (crossSite(req)) return json("forbidden", 403);
  if (rateLimited(req, "newsletter")) return json("rate_limited", 429);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json("invalid", 400);
  if (parsed.data.website) return json("ok", 200); // honeypot: bots reciben "ok" sin que se guarde nada
  if (!checkConfig("newsletter").ok) return json("not_configured", 503);
  try {
    const ok = await createContact(parsed.data.email);
    return ok ? json("ok", 200) : json("provider_error", 502);
  } catch {
    return json("provider_error", 502);
  }
}
