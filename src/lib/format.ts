import type { Locale } from "@/content/schemas";

/** Formatea una fecha ISO (YYYY-MM-DD) sin desfases de zona horaria. */
export function formatDate(iso: string, locale: Locale): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "long", timeZone: "UTC",
  });
}
