import type { Offer } from "@/content/schemas";

export type OfferStatus = "active" | "upcoming" | "expired";

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria de Cancún. */
export function todayInCancun(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "America/Cancun" });
}

/** Una oferta vence al terminar el día de `endsAt` (hora de Cancún). */
export function getOfferStatus(offer: Pick<Offer, "startsAt" | "endsAt">, now: Date = new Date()): OfferStatus {
  const today = todayInCancun(now);
  if (offer.endsAt && today > offer.endsAt.slice(0, 10)) return "expired";
  if (offer.startsAt && today < offer.startsAt.slice(0, 10)) return "upcoming";
  return "active";
}
