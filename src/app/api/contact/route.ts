import type { NextRequest } from "next/server";
import { z } from "zod";
import { crossSite, json, rateLimited } from "@/lib/api-guard";
import { checkConfig, sendEmail } from "@/lib/resend";

export const runtime = "nodejs";

const body = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().max(254).pipe(z.email()),
  topic: z.enum(["general", "collaboration", "recommendation"]),
  message: z.string().trim().min(10).max(4000),
  website: z.string().optional(),
});

export async function POST(req: NextRequest) {
  if (crossSite(req)) return json("forbidden", 403);
  if (rateLimited(req, "contact")) return json("rate_limited", 429);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json("invalid", 400);
  const { name, email, topic, message, website } = parsed.data;
  if (website) return json("ok", 200);
  if (!checkConfig("contact").ok) return json("not_configured", 503);
  const subject = `[Sin Varo] ${topic === "collaboration" ? "Colaboración comercial" : topic === "recommendation" ? "Recomendación de lugar" : "Contacto"} — ${name.replace(/[\r\n]+/g, " ")}`;
  try {
    const ok = await sendEmail({ subject, replyTo: email, text: `De: ${name} <${email}>\nTema: ${topic}\n\n${message}` });
    return ok ? json("ok", 200) : json("provider_error", 502);
  } catch {
    return json("provider_error", 502);
  }
}
