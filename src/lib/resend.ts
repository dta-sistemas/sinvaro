import "server-only";

const API = "https://api.resend.com";

export type ServiceCheck = { ok: true } | { ok: false; missing: string[] };

export function checkConfig(kind: "newsletter" | "contact"): ServiceCheck {
  const need = kind === "newsletter" ? ["RESEND_API_KEY"] : ["RESEND_API_KEY", "RESEND_FROM", "CONTACT_TO_EMAIL"];
  const missing = need.filter((k) => !process.env[k]);
  return missing.length ? { ok: false, missing } : { ok: true };
}

async function call(path: string, body: unknown) {
  return fetch(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
}

/** Crea el contacto en Resend (modelo de Contactos global; el segmento es opcional). */
export async function createContact(email: string): Promise<boolean> {
  const segment = process.env.RESEND_SEGMENT_NEWSLETTER;
  const res = await call("/contacts", { email, unsubscribed: false, ...(segment ? { segments: [segment] } : {}) });
  if (res.ok) return true;
  // Un contacto ya existente cuenta como suscrito.
  const text = await res.text().catch(() => "");
  return res.status === 409 || /already exist/i.test(text);
}

export async function sendEmail(opts: { subject: string; text: string; replyTo: string }): Promise<boolean> {
  const res = await call("/emails", {
    from: process.env.RESEND_FROM,
    to: [process.env.CONTACT_TO_EMAIL],
    reply_to: opts.replyTo,
    subject: opts.subject,
    text: opts.text,
  });
  return res.ok;
}
