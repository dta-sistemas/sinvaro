import type { Article, Category, Locale, Offer, Place, Restaurant } from "@/content/schemas";
import { fmt, getDictionary, type Dict } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import { getContent } from "@/lib/repositories";
import { getOfferStatus, type OfferStatus } from "@/lib/offers";

export type CardType = "place" | "restaurant" | "offer" | "article";
export type CardColor = Category["color"];

/**
 * Representación ya localizada y serializable de cualquier contenido.
 * Las tarjetas, filtros, mapa y favoritos trabajan SOLO con esto: no conocen JSON ni API.
 */
export interface CardItem {
  key: string; // `${type}:${id}` — clave estable para favoritos
  type: CardType;
  id: string;
  href: string;
  title: string;
  summary: string;
  categoryId: string;
  categoryName: string;
  color: CardColor;
  icon: string;
  badge: { label: string; color: CardColor } | null;
  area: string | null;
  photo: { src: string; alt: string } | null;
  pending: boolean;
  offerStatus: OfferStatus | null;
  endsAt: string | null;
  date: string | null;
  coords: { lat: number; lng: number; approx: boolean } | null;
  /** Filtros disponibles: nombre del grupo → valores */
  filters: Record<string, string[]>;
}

type Photo = { src: string; alt: { es: string; en: string } };
const firstPhoto = (photos: Photo[], l: Locale) => (photos[0] ? { src: photos[0].src, alt: photos[0].alt[l] } : null);
const coordsOf = (loc: Place["location"]) =>
  loc.coordinates ? { lat: loc.coordinates.lat, lng: loc.coordinates.lng, approx: loc.coordinates.precision === "approximate" } : null;

function accessBadge(access: Place["access"], d: Dict): CardItem["badge"] {
  switch (access) {
    case "free": return { label: d.labels.free, color: "pink" };
    case "paid": return { label: d.labels.paid, color: "yellow" };
    case "reservation": return { label: d.labels.reservation, color: "purple" };
    default: return { label: d.labels.unknownAccess, color: "teal" };
  }
}

export function placeToCard(p: Place, cat: Category, l: Locale, d: Dict): CardItem {
  return {
    key: `place:${p.id}`, type: "place", id: p.id, href: href(l, "lugares", p.slug),
    title: p.title[l], summary: p.summary[l], categoryId: cat.id, categoryName: cat.name[l], color: cat.color, icon: cat.icon,
    badge: accessBadge(p.access, d), area: p.location.area[l], photo: firstPhoto(p.photos, l),
    pending: p.verification.status === "pending", offerStatus: null, endsAt: null, date: null, coords: coordsOf(p.location),
    filters: { category: [cat.id], access: [p.access], area: [p.location.area[l]] },
  };
}

export function restaurantToCard(r: Restaurant, cat: Category, l: Locale, d: Dict): CardItem {
  return {
    key: `restaurant:${r.id}`, type: "restaurant", id: r.id, href: href(l, "restaurantes", r.slug),
    title: r.title[l], summary: r.summary[l], categoryId: cat.id, categoryName: cat.name[l], color: cat.color, icon: cat.icon,
    badge: r.priceBand !== "unknown" ? { label: d.filters[r.priceBand], color: "yellow" } : null,
    area: r.location.area[l], photo: firstPhoto(r.photos, l),
    pending: r.verification.status === "pending", offerStatus: null, endsAt: null, date: null, coords: coordsOf(r.location),
    filters: { category: [cat.id], price: [r.priceBand], meal: r.mealTypes, area: [r.location.area[l]] },
  };
}

export function offerToCard(o: Offer, cat: Category, l: Locale): CardItem {
  const status = getOfferStatus(o);
  return {
    key: `offer:${o.id}`, type: "offer", id: o.id, href: href(l, "ofertas", o.slug),
    title: o.title[l], summary: o.summary[l], categoryId: cat.id, categoryName: cat.name[l], color: cat.color, icon: cat.icon,
    badge: { label: cat.name[l], color: cat.color }, area: o.location.area[l], photo: firstPhoto(o.photos, l),
    pending: o.verification.status === "pending", offerStatus: status, endsAt: o.endsAt, date: null, coords: coordsOf(o.location),
    filters: { category: [cat.id], status: [status], area: [o.location.area[l]], featured: o.featured ? ["yes"] : [] },
  };
}

export function articleToCard(a: Article, cat: Category, l: Locale): CardItem {
  const ph = a.featuredImage ?? a.photos[0];
  return {
    key: `article:${a.id}`, type: "article", id: a.id, href: href(l, "blog", a.slug),
    title: a.title[l], summary: a.excerpt[l], categoryId: cat.id, categoryName: cat.name[l], color: cat.color, icon: cat.icon,
    badge: { label: cat.name[l], color: cat.color }, area: null, photo: ph ? { src: ph.src, alt: ph.alt[l] } : null,
    pending: false, offerStatus: null, endsAt: null, date: a.publishedAt, coords: null,
    filters: { category: [cat.id] },
  };
}

export interface AllCards {
  places: CardItem[];
  restaurants: CardItem[];
  offers: CardItem[];
  articles: CardItem[];
  categories: Category[];
}

/** Construye todas las tarjetas localizadas leyendo SOLO a través de la capa de repositorios. */
export async function getAllCards(locale: Locale): Promise<AllCards> {
  const repo = getContent();
  const d = getDictionary(locale);
  const [places, restaurants, offers, articles, categories] = await Promise.all([
    repo.places.list(), repo.restaurants.list(), repo.offers.list(), repo.articles.list(), repo.categories.list(),
  ]);
  const cat = (id: string) => categories.find((c) => c.id === id)!;
  return {
    places: places.map((p) => placeToCard(p, cat(p.categoryId), locale, d)),
    restaurants: restaurants.map((r) => restaurantToCard(r, cat(r.categoryId), locale, d)),
    offers: offers.map((o) => offerToCard(o, cat(o.categoryId), locale)),
    articles: articles.map((a) => articleToCard(a, cat(a.categoryId), locale)),
    categories,
  };
}

export { fmt };

/** Resultados de búsqueda agrupados por tipo (usa `search` de cada repositorio). */
export async function searchCards(locale: Locale, query: string): Promise<AllCards> {
  const repo = getContent();
  const d = getDictionary(locale);
  const [places, restaurants, offers, articles, categories] = await Promise.all([
    repo.places.search(query, locale), repo.restaurants.search(query, locale), repo.offers.search(query, locale),
    repo.articles.search(query, locale), repo.categories.list(),
  ]);
  const cat = (id: string) => categories.find((c) => c.id === id)!;
  return {
    places: places.map((p) => placeToCard(p, cat(p.categoryId), locale, d)),
    restaurants: restaurants.map((r) => restaurantToCard(r, cat(r.categoryId), locale, d)),
    offers: offers.map((o) => offerToCard(o, cat(o.categoryId), locale)),
    articles: articles.map((a) => articleToCard(a, cat(a.categoryId), locale)),
    categories,
  };
}
