import type { Article, Category, Coupon, Locale, Offer, Place, Restaurant } from "@/content/schemas";
import type { OfferStatus } from "@/lib/offers";

/**
 * Contratos de acceso a contenido. La interfaz web solo conoce estas interfaces;
 * hoy las implementa `local.ts` (JSON), mañana puede hacerlo un cliente HTTP de la API Laravel.
 * Todas las operaciones son asíncronas a propósito, para que cambiar la fuente no cambie las páginas.
 * Solo devuelven contenido publicado.
 */
export interface PlacesRepository {
  list(filter?: { categoryId?: string; access?: Place["access"]; isSecret?: boolean }): Promise<Place[]>;
  getBySlug(slug: string): Promise<Place | null>;
  getById(id: string): Promise<Place | null>;
  search(query: string, locale: Locale): Promise<Place[]>;
}

export interface RestaurantsRepository {
  list(filter?: { categoryId?: string; priceBand?: Restaurant["priceBand"] }): Promise<Restaurant[]>;
  getBySlug(slug: string): Promise<Restaurant | null>;
  getById(id: string): Promise<Restaurant | null>;
  search(query: string, locale: Locale): Promise<Restaurant[]>;
}

export interface OffersRepository {
  list(filter?: { categoryId?: string; status?: OfferStatus; featured?: boolean }): Promise<Offer[]>;
  getBySlug(slug: string): Promise<Offer | null>;
  getById(id: string): Promise<Offer | null>;
  search(query: string, locale: Locale): Promise<Offer[]>;
  getCouponForOffer(offerId: string): Promise<Coupon | null>;
}

export interface ArticlesRepository {
  list(filter?: { categoryId?: string }): Promise<Article[]>;
  getBySlug(slug: string): Promise<Article | null>;
  getById(id: string): Promise<Article | null>;
  search(query: string, locale: Locale): Promise<Article[]>;
  related(article: Article, limit?: number): Promise<Article[]>;
}

export interface CategoriesRepository {
  list(kind?: Category["kind"]): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
}

export interface ContentRepository {
  places: PlacesRepository;
  restaurants: RestaurantsRepository;
  offers: OffersRepository;
  articles: ArticlesRepository;
  categories: CategoriesRepository;
}
