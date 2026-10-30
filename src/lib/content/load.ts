import { z } from "zod";
import { bandForPrice } from "@/lib/price";
import {
  articleSchema, categorySchema, couponSchema, legalSchema, offerSchema, placeSchema,
  restaurantSchema, tagSchema, tipSchema,
  type Article, type Category, type Coupon, type Offer, type Place, type Restaurant, type Tag, type Tip,
} from "@/content/schemas";
import placesJson from "../../../content/places.json";
import restaurantsJson from "../../../content/restaurants.json";
import offersJson from "../../../content/offers.json";
import couponsJson from "../../../content/coupons.json";
import articlesJson from "../../../content/articles.json";
import categoriesJson from "../../../content/categories.json";
import tagsJson from "../../../content/tags.json";
import tipsJson from "../../../content/tips.json";
import legalJson from "../../../content/legal.json";
import sampleOffersJson from "../../../content/samples/offers.sample.json";

export interface AllContent {
  places: Place[];
  restaurants: Restaurant[];
  offers: Offer[];
  coupons: Coupon[];
  articles: Article[];
  categories: Category[];
  tags: Tag[];
  tips: Tip[];
  legal: z.infer<typeof legalSchema>;
}

function parse<T extends z.ZodType>(name: string, schema: T, data: unknown): z.infer<T>[] {
  const result = z.array(schema).safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  • ${name}[${i.path.join(".")}]: ${i.message}`).join("\n");
    throw new Error(`Contenido inválido en ${name}.json\n${issues}`);
  }
  return result.data;
}

function assertUnique(name: string, items: { id: string; slug?: string }[]) {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const it of items) {
    if (ids.has(it.id)) throw new Error(`${name}: id duplicado "${it.id}"`);
    ids.add(it.id);
    if (it.slug) {
      if (slugs.has(it.slug)) throw new Error(`${name}: slug duplicado "${it.slug}"`);
      slugs.add(it.slug);
    }
  }
}

let cache: AllContent | null = null;

export function loadAllContent(): AllContent {
  if (cache) return cache;
  const includeSamples = process.env.SINVARO_SAMPLE_CONTENT === "1";

  const categories = parse("categories", categorySchema, categoriesJson);
  const places = parse("places", placeSchema, placesJson);
  const restaurants = parse("restaurants", restaurantSchema, restaurantsJson);
  const offers = [
    ...parse("offers", offerSchema, offersJson),
    ...(includeSamples ? parse("offers.sample", offerSchema, sampleOffersJson) : []),
  ];
  const coupons = parse("coupons", couponSchema, couponsJson);
  const articles = parse("articles", articleSchema, articlesJson);
  const tags = parse("tags", tagSchema, tagsJson);
  const tips = parse("tips", tipSchema, tipsJson);
  const legal = legalSchema.parse(legalJson);

  assertUnique("categories", categories.map((c) => ({ id: c.id, slug: `${c.kind}:${c.slug}` })));
  assertUnique("places", places);
  assertUnique("restaurants", restaurants);
  assertUnique("offers", offers);
  assertUnique("articles", articles);
  assertUnique("coupons", coupons);

  const catById = new Map(categories.map((c) => [c.id, c]));
  const tagIds = new Set(tags.map((t) => t.id));
  const checkRefs = (
    kind: Category["kind"], name: string,
    items: { id: string; categoryId: string; tagIds: string[] }[],
  ) => {
    for (const it of items) {
      const cat = catById.get(it.categoryId);
      if (!cat || cat.kind !== kind) throw new Error(`${name} "${it.id}": categoría "${it.categoryId}" no existe para "${kind}"`);
      for (const t of it.tagIds) if (!tagIds.has(t)) throw new Error(`${name} "${it.id}": tag "${t}" no existe`);
    }
  };
  checkRefs("place", "places", places);
  checkRefs("restaurant", "restaurants", restaurants);
  checkRefs("offer", "offers", offers);
  checkRefs("article", "articles", articles);

  for (const o of offers) {
    if (o.startsAt && o.endsAt && o.endsAt < o.startsAt) throw new Error(`offers "${o.id}": endsAt anterior a startsAt`);
    if (o.status === "published") {
      if (!o.endsAt) throw new Error(`offers "${o.id}": una oferta publicada necesita fecha de vencimiento (endsAt)`);
      if (o.conditions.es.length === 0 || o.conditions.en.length === 0) throw new Error(`offers "${o.id}": una oferta publicada necesita condiciones (es y en)`);
      if (o.conditions.es.length !== o.conditions.en.length) throw new Error(`offers "${o.id}": conditions es/en deben tener el mismo número de elementos`);
    }
  }
  // Horarios y precios solo se publican si el dato está verificado.
  for (const [name, list] of [["places", places], ["restaurants", restaurants]] as const) {
    for (const it of list) {
      if (it.status === "published" && it.verification.status === "pending" && (it.hours || it.priceNote)) {
        throw new Error(`${name} "${it.id}": no publiques horarios ni precios sin verificar (cambia verification.status a "verified" con lastVerified, o quita hours/priceNote)`);
      }
      if (it.verification.status === "verified" && !it.verification.lastVerified) {
        throw new Error(`${name} "${it.id}": verification "verified" requiere lastVerified`);
      }
    }
  }
  for (const r of restaurants) {
    if (r.priceMxn !== null) {
      if (r.verification.status === "pending") throw new Error(`restaurants "${r.id}": no publiques priceMxn sin verificar (usa priceBand "unknown" hasta comprobarlo)`);
      const expected = bandForPrice(r.priceMxn);
      if (r.priceBand !== expected) throw new Error(`restaurants "${r.id}": priceMxn ${r.priceMxn} corresponde a priceBand "${expected}", no "${r.priceBand}"`);
    } else if (r.priceBand !== "unknown" && r.verification.status === "pending") {
      throw new Error(`restaurants "${r.id}": priceBand "${r.priceBand}" requiere verificación (o déjalo en "unknown")`);
    }
  }
  for (const a of articles) {
    if (a.body.es.length !== 0 && a.body.en.length === 0) throw new Error(`articles "${a.id}": falta el cuerpo en inglés`);
  }
  const offerIds = new Set(offers.map((o) => o.id));
  for (const c of coupons) if (!offerIds.has(c.offerId)) throw new Error(`coupons "${c.id}": offerId "${c.offerId}" no existe`);

  cache = { places, restaurants, offers, coupons, articles, categories, tags, tips, legal };
  return cache;
}
