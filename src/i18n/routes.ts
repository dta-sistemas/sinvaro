import { DEFAULT_LOCALE, type Locale } from "@/content/schemas";

/**
 * Rutas públicas. Las carpetas internas de /src/app/[locale] usan los segmentos en español.
 * El middleware reescribe los segmentos en inglés (/en/free → /en/gratis) y quita el prefijo
 * de español (/es/x → /x), de modo que el español vive en la raíz y el inglés bajo /en/.
 */
export const SEGMENTS = {
  gratis: { es: "gratis", en: "free" },
  "comer-barato": { es: "comer-barato", en: "cheap-eats" },
  ofertas: { es: "ofertas", en: "deals" },
  "lugares-secretos": { es: "lugares-secretos", en: "secret-spots" },
  mapa: { es: "mapa", en: "map" },
  buscar: { es: "buscar", en: "search" },
  favoritos: { es: "favoritos", en: "favorites" },
  contacto: { es: "contacto", en: "contact" },
  privacidad: { es: "privacidad", en: "privacy" },
  terminos: { es: "terminos", en: "terms" },
  lugares: { es: "lugares", en: "places" },
  restaurantes: { es: "restaurantes", en: "eats" },
  blog: { es: "blog", en: "blog" },
} as const;

export type SegmentKey = keyof typeof SEGMENTS;

export function href(locale: Locale, key: SegmentKey | null, slug?: string): string {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const parts = [key ? SEGMENTS[key][locale] : null, slug].filter(Boolean);
  const path = parts.length ? `/${parts.join("/")}` : "";
  return `${prefix}${path}` || "/";
}

const toInternal = (seg: string): string | undefined =>
  (Object.entries(SEGMENTS).find(([, v]) => v.en === seg || v.es === seg)?.[0]);

/** Convierte una ruta pública de un idioma a su equivalente en otro (para el selector de idioma). */
export function switchLocalePath(pathname: string, to: Locale): string {
  const clean = pathname.replace(/^\/(en|es)(?=\/|$)/, "") || "/";
  const [, first, ...rest] = clean.split("/");
  const key = first ? (toInternal(first) as SegmentKey | undefined) : undefined;
  const prefix = to === DEFAULT_LOCALE ? "" : `/${to}`;
  const segs = [key ? SEGMENTS[key][to] : first, ...rest].filter(Boolean);
  return `${prefix}/${segs.join("/")}`.replace(/\/$/, "") || "/";
}
