import { z } from "zod";

/** Idiomas soportados. Español es el principal (raíz "/"), inglés vive bajo "/en/". */
export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export const localizedText = z.object({ es: z.string().min(1), en: z.string().min(1) });
export const localizedList = z.object({ es: z.array(z.string().min(1)), en: z.array(z.string().min(1)) });
export type LocalizedText = z.infer<typeof localizedText>;
export type LocalizedList = z.infer<typeof localizedList>;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/, "Fecha ISO (YYYY-MM-DD)");
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug en minúsculas con guiones");

export const publishStatus = z.enum(["published", "draft", "archived"]);

/** Un dato "pending" se muestra al público con aviso de "por verificar". */
export const verification = z.object({
  status: z.enum(["verified", "pending"]),
  lastVerified: isoDate.nullable(),
});

export const photo = z.object({
  /** Ruta bajo /public (p. ej. "/images/places/playa-delfines.jpg") */
  src: z.string().startsWith("/"),
  alt: localizedText,
  credit: z.string().optional(),
});

export const seo = z
  .object({ title: localizedText.optional(), description: localizedText.optional() })
  .optional();

export const coordinates = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  /** "approximate" se muestra como "ubicación aproximada" en el mapa */
  precision: z.enum(["exact", "approximate"]),
});

export const location = z.object({
  area: localizedText,
  address: z.string().optional(),
  coordinates: coordinates.nullable(),
});

const base = {
  id: z.string().min(1),
  slug,
  status: publishStatus,
  createdAt: isoDate,
  updatedAt: isoDate,
  verification,
  seo,
  photos: z.array(photo),
  categoryId: z.string().min(1),
  tagIds: z.array(z.string()).default([]),
};

export const accessType = z.enum(["free", "paid", "reservation", "unknown"]);
export type AccessType = z.infer<typeof accessType>;

export const placeSchema = z.object({
  ...base,
  title: localizedText,
  summary: localizedText,
  description: localizedText,
  location,
  access: accessType,
  isSecret: z.boolean().default(false),
  /** Solo si está verificado. No inventar precios. */
  priceNote: localizedText.optional(),
  hours: localizedText.optional(),
  howToGet: localizedText.optional(),
  tips: localizedList.default({ es: [], en: [] }),
});
export type Place = z.infer<typeof placeSchema>;

export const priceBand = z.enum(["under50", "under100", "under150", "unknown"]);
export const mealType = z.enum(["breakfast", "lunch", "dinner"]);

export const restaurantSchema = z.object({
  ...base,
  title: localizedText,
  summary: localizedText,
  description: localizedText,
  location,
  mealTypes: z.array(mealType),
  /** Rango orientativo para filtrar; "unknown" hasta verificar */
  priceBand,
  priceNote: localizedText.optional(),
  hours: localizedText.optional(),
  externalUrl: z.string().url().optional(),
  tips: localizedList.default({ es: [], en: [] }),
});
export type Restaurant = z.infer<typeof restaurantSchema>;

export const offerSchema = z.object({
  ...base,
  title: localizedText,
  business: z.string().min(1),
  benefit: localizedText,
  summary: localizedText,
  conditions: localizedList,
  /** null = sin fecha de inicio */
  startsAt: isoDate.nullable(),
  /** null = sin vencimiento declarado (se trata como vigente) */
  endsAt: isoDate.nullable(),
  location,
  couponCode: z.string().nullable().default(null),
  redeemUrl: z.string().url().nullable().default(null),
  featured: z.boolean().default(false),
  /** Contenido de ejemplo para desarrollo; nunca se presenta como real */
  isSample: z.boolean().default(false),
});
export type Offer = z.infer<typeof offerSchema>;

export const couponSchema = z.object({
  id: z.string().min(1),
  offerId: z.string().min(1),
  code: z.string().min(1),
  status: z.enum(["active", "disabled"]),
});
export type Coupon = z.infer<typeof couponSchema>;

export const articleSchema = z.object({
  ...base,
  title: localizedText,
  excerpt: localizedText,
  /** Párrafos. Las líneas que empiezan con "## " son subtítulos. */
  body: localizedList,
  author: z.string().min(1),
  publishedAt: isoDate,
  featuredImage: photo.optional(),
});
export type Article = z.infer<typeof articleSchema>;

export const categoryKind = z.enum(["place", "restaurant", "offer", "article"]);
export const categorySchema = z.object({
  id: z.string().min(1),
  kind: categoryKind,
  slug,
  name: localizedText,
  description: localizedText,
  color: z.enum(["pink", "yellow", "teal", "purple"]),
  icon: z.string(),
  active: z.boolean().default(true),
});
export type Category = z.infer<typeof categorySchema>;

export const tagSchema = z.object({ id: z.string().min(1), name: localizedText });
export type Tag = z.infer<typeof tagSchema>;

export const tipSchema = z.object({ id: z.string(), icon: z.string(), title: localizedText, text: localizedText });
export type Tip = z.infer<typeof tipSchema>;

export const legalSchema = z.record(
  z.string(),
  z.object({
    title: localizedText,
    sections: z.array(z.object({ heading: localizedText, body: localizedText })),
  }),
);
