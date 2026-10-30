import type { MetadataRoute } from "next";
import { LOCALES } from "@/content/schemas";
import { href, type SegmentKey } from "@/i18n/routes";
import { getContent } from "@/lib/repositories";
import { SITE_URL } from "@/lib/site";

const abs = (l: (typeof LOCALES)[number], key: SegmentKey | null, slug?: string) =>
  `${SITE_URL}${href(l, key, slug)}`.replace(/\/$/, "") || SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = getContent();
  const [places, restaurants, offers, articles, routes] = await Promise.all([repo.places.list(), repo.restaurants.list(), repo.offers.list(), repo.articles.list(), repo.routes.list()]);
  const statics: (SegmentKey | null)[] = [null, "gratis", "comer-barato", "ofertas", "lugares-secretos", ...(routes.some((r) => !r.isSample) ? (["como-llegar"] as const) : []), "mapa", "blog", "contacto"];
  const entries: { key: SegmentKey | null; slug?: string; updated?: string }[] = [
    ...statics.map((key) => ({ key })),
    ...places.map((p) => ({ key: "lugares" as const, slug: p.slug, updated: p.updatedAt })),
    ...restaurants.map((r) => ({ key: "restaurantes" as const, slug: r.slug, updated: r.updatedAt })),
    ...offers.filter((o) => !o.isSample).map((o) => ({ key: "ofertas" as const, slug: o.slug, updated: o.updatedAt })),
    ...routes.filter((r) => !r.isSample).map((r) => ({ key: "como-llegar" as const, slug: r.slug, updated: r.updatedAt })),
    ...articles.map((a) => ({ key: "blog" as const, slug: a.slug, updated: a.updatedAt })),
  ];
  return entries.flatMap((e) =>
    LOCALES.map((l) => ({
      url: abs(l, e.key, e.slug),
      lastModified: e.updated,
      alternates: { languages: Object.fromEntries(LOCALES.map((x) => [x, abs(x, e.key, e.slug)])) },
    })),
  );
}
