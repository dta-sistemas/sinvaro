import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/content/schemas";
import { switchLocalePath } from "@/i18n/routes";
import { getDictionary } from "@/i18n/dictionaries";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Ruta pública (sin dominio) en español o inglés para un `path` expresado en el idioma `locale`. */
export function alternatesFor(path: string, locale: Locale) {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = `${SITE_URL}${switchLocalePath(path, l)}`.replace(/\/$/, "") || SITE_URL;
  languages["x-default"] = languages[DEFAULT_LOCALE];
  return { canonical: languages[locale], languages };
}

export function buildMetadata(opts: {
  locale: Locale; path: string; title: string; description: string; image?: string | null; noindex?: boolean; type?: "website" | "article";
}): Metadata {
  const d = getDictionary(opts.locale);
  const alternates = alternatesFor(opts.path, opts.locale);
  return {
    title: opts.title,
    description: opts.description,
    alternates,
    robots: opts.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: opts.title, description: opts.description, url: alternates.canonical, siteName: d.site.name,
      locale: opts.locale === "es" ? "es_MX" : "en_US", type: opts.type ?? "website",
      images: opts.image ? [{ url: opts.image }] : undefined,
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  };
}
