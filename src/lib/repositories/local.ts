import type { Locale } from "@/content/schemas";
import { loadAllContent } from "@/lib/content/load";
import { getOfferStatus } from "@/lib/offers";
import type { ContentRepository } from "./types";

import { matchesQuery } from "@/lib/text";

export { matchesQuery };

const published = <T extends { status: string }>(items: T[]) => items.filter((i) => i.status === "published");

export function createLocalRepository(): ContentRepository {
  const data = loadAllContent();
  const catName = (id: string, l: Locale) => data.categories.find((c) => c.id === id)?.name[l] ?? "";
  const tagNames = (ids: string[], l: Locale) => ids.map((t) => data.tags.find((x) => x.id === t)?.name[l] ?? "").join(" ");

  return {
    tags: { async list() { return data.tags; } },
    places: {
      async list(f = {}) {
        return published(data.places).filter(
          (p) =>
            (!f.categoryId || p.categoryId === f.categoryId) &&
            (!f.access || p.access === f.access) &&
            (f.isSecret === undefined || p.isSecret === f.isSecret),
        );
      },
      async getBySlug(slug) { return published(data.places).find((p) => p.slug === slug) ?? null; },
      async getById(id) { return published(data.places).find((p) => p.id === id) ?? null; },
      async search(q, l) {
        return published(data.places).filter((p) =>
          matchesQuery([p.title[l], p.summary[l], p.description[l], p.location.area[l], catName(p.categoryId, l), tagNames(p.tagIds, l)].join(" "), q));
      },
    },
    restaurants: {
      async list(f = {}) {
        return published(data.restaurants).filter(
          (r) => (!f.categoryId || r.categoryId === f.categoryId) && (!f.priceBand || r.priceBand === f.priceBand),
        );
      },
      async getBySlug(slug) { return published(data.restaurants).find((r) => r.slug === slug) ?? null; },
      async getById(id) { return published(data.restaurants).find((r) => r.id === id) ?? null; },
      async search(q, l) {
        return published(data.restaurants).filter((r) =>
          matchesQuery([r.title[l], r.summary[l], r.description[l], r.location.area[l], catName(r.categoryId, l), tagNames(r.tagIds, l)].join(" "), q));
      },
    },
    offers: {
      async list(f = {}) {
        return published(data.offers).filter(
          (o) =>
            (!f.categoryId || o.categoryId === f.categoryId) &&
            (!f.status || getOfferStatus(o) === f.status) &&
            (f.featured === undefined || o.featured === f.featured),
        );
      },
      async getBySlug(slug) { return published(data.offers).find((o) => o.slug === slug) ?? null; },
      async getById(id) { return published(data.offers).find((o) => o.id === id) ?? null; },
      async search(q, l) {
        // Las ofertas vencidas no aparecen en la búsqueda.
        return published(data.offers).filter(
          (o) => getOfferStatus(o) !== "expired" &&
            matchesQuery([o.title[l], o.business, o.benefit[l], o.summary[l], o.location.area[l], catName(o.categoryId, l)].join(" "), q));
      },
      async getCouponForOffer(offerId) {
        return data.coupons.find((c) => c.offerId === offerId && c.status === "active") ?? null;
      },
    },
    articles: {
      async list(f = {}) {
        return published(data.articles)
          .filter((a) => !f.categoryId || a.categoryId === f.categoryId)
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      },
      async getBySlug(slug) { return published(data.articles).find((a) => a.slug === slug) ?? null; },
      async getById(id) { return published(data.articles).find((a) => a.id === id) ?? null; },
      async search(q, l) {
        return published(data.articles).filter((a) =>
          matchesQuery([a.title[l], a.excerpt[l], a.body[l].join(" "), catName(a.categoryId, l)].join(" "), q));
      },
      async related(article, limit = 3) {
        const others = published(data.articles).filter((a) => a.id !== article.id);
        const score = (a: (typeof others)[number]) =>
          (a.categoryId === article.categoryId ? 2 : 0) + a.tagIds.filter((t) => article.tagIds.includes(t)).length;
        return others.sort((a, b) => score(b) - score(a) || b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit);
      },
    },
    categories: {
      async list(kind) { return data.categories.filter((c) => c.active && (!kind || c.kind === kind)); },
      async getById(id) { return data.categories.find((c) => c.id === id) ?? null; },
    },
  };
}
