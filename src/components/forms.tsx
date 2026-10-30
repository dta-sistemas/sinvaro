"use client";
import { useId, useState } from "react";
import type { Locale } from "@/content/schemas";
import type { Dict } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import Link from "next/link";

type Status = "idle" | "sending" | "ok" | "invalid" | "not_configured" | "rate_limited" | "error";

async function post(url: string, payload: unknown): Promise<Status> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) return "ok";
    if (res.status === 400) return "invalid";
    if (res.status === 503) return "not_configured";
    if (res.status === 429) return "rate_limited";
    return "error";
  } catch {
    return "error";
  }
}

function StatusMessage({ status, messages }: { status: Status; messages: Partial<Record<Status, string>> }) {
  const text = messages[status];
  if (!text) return null;
  const good = status === "ok";
  return <p role={good ? "status" : "alert"} className={`mt-2 text-sm font-semibold ${good ? "text-emerald-800" : "text-red-800"}`}>{text}</p>;
}

export function NewsletterForm({ locale, dict, compact = false }: { locale: Locale; dict: Dict; compact?: boolean }) {
  const f = dict.forms.newsletter;
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const messages = { ok: f.success, invalid: f.invalid, error: f.error, not_configured: f.notConfigured, rate_limited: f.rate };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus("sending");
    const s = await post("/api/newsletter", { email: String(data.get("email") ?? ""), website: String(data.get("website") ?? "") });
    setStatus(s);
    if (s === "ok") e.currentTarget.reset();
  }

  return (
    <div className={compact ? "text-white" : ""}>
      <h2 className={`font-display uppercase leading-tight ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>
        {f.a} <span className={compact ? "text-sv-yellow" : "text-sv-pink"}>{f.b}</span>
      </h2>
      <p className={`mt-2 text-sm ${compact ? "text-neutral-300" : "text-sv-black"}`}>{f.text}</p>
      <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor={id} className="sr-only">{f.label}</label>
        <input id={id} name="email" type="email" required autoComplete="email" placeholder={f.placeholder}
          className="min-h-12 flex-1 rounded-xl border border-black/15 bg-white px-4 text-sm text-sv-black placeholder:text-neutral-500" />
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <button type="submit" disabled={status === "sending"}
          className={`min-h-12 rounded-xl px-5 text-sm font-extrabold uppercase disabled:opacity-60 ${compact ? "bg-sv-pink text-white" : "bg-sv-black text-white"}`}>
          {status === "sending" ? f.sending : f.button}
        </button>
      </form>
      <StatusMessage status={status} messages={compact ? { ...messages, ok: f.success } : messages} />
      <p className={`mt-2 text-xs ${compact ? "text-neutral-400" : "text-neutral-800"}`}>
        <Link href={href(locale, "privacidad")} className="underline">{f.privacy}</Link>
      </p>
    </div>
  );
}

export function ContactForm({ dict }: { dict: Dict }) {
  const f = dict.forms.contact;
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const messages = { ok: f.success, invalid: f.invalid, error: f.error, not_configured: f.notConfigured, rate_limited: f.rate };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    const payload = {
      name: String(d.get("name") ?? "").trim(), email: String(d.get("email") ?? "").trim(),
      topic: String(d.get("topic") ?? "general"), message: String(d.get("message") ?? "").trim(), website: String(d.get("website") ?? ""),
    };
    const errs: typeof errors = {};
    if (!payload.name) errs.name = f.nameReq;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errs.email = f.emailReq;
    if (payload.message.length < 10) errs.message = f.messageReq;
    setErrors(errs);
    if (Object.keys(errs).length) { setStatus("invalid"); return; }
    setStatus("sending");
    const s = await post("/api/contact", payload);
    setStatus(s);
    if (s === "ok") form.reset();
  }

  const field = "mt-1 w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm";
  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-xl gap-4">
      {([["name", f.name, "text", "name"], ["email", f.email, "email", "email"]] as const).map(([n, label, type, ac]) => (
        <div key={n}>
          <label htmlFor={`${uid}-${n}`} className="text-sm font-bold">{label}</label>
          <input id={`${uid}-${n}`} name={n} type={type} autoComplete={ac} required aria-invalid={!!errors[n]} aria-describedby={errors[n] ? `${uid}-${n}-err` : undefined} className={field} />
          {errors[n] && <p id={`${uid}-${n}-err`} className="mt-1 text-sm font-semibold text-red-800">{errors[n]}</p>}
        </div>
      ))}
      <div>
        <label htmlFor={`${uid}-topic`} className="text-sm font-bold">{f.topic}</label>
        <select id={`${uid}-topic`} name="topic" className={field} defaultValue="general">
          <option value="general">{f.topicGeneral}</option>
          <option value="collaboration">{f.topicCollab}</option>
        </select>
      </div>
      <div>
        <label htmlFor={`${uid}-message`} className="text-sm font-bold">{f.message}</label>
        <textarea id={`${uid}-message`} name="message" rows={6} required aria-invalid={!!errors.message} aria-describedby={errors.message ? `${uid}-message-err` : undefined} className={field} />
        {errors.message && <p id={`${uid}-message-err`} className="mt-1 text-sm font-semibold text-red-800">{errors.message}</p>}
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div>
        <button type="submit" disabled={status === "sending"} className="min-h-12 rounded-xl bg-sv-yellow px-6 text-sm font-extrabold uppercase disabled:opacity-60">
          {status === "sending" ? f.sending : f.send}
        </button>
        <StatusMessage status={status === "invalid" && Object.keys(errors).length ? "idle" : status} messages={messages} />
      </div>
    </form>
  );
}
