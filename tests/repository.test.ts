import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AllContent } from "@/lib/content/load";

const v = { status: "pending" as const, lastVerified: null };
const loc = { area: { es: "Zona", en: "Area" }, coordinates: null };
const base = { createdAt: "2026-01-01", updatedAt: "2026-01-01", verification: v, photos: [], tagIds: [] as string[] };
const place = (id: string, slug: string, over: object) => ({
  ...base, id, slug, status: "published", categoryId: "playas", title: { es: slug, en: slug }, summary: { es: "x", en: "x" },
  description: { es: "x", en: "x" }, location: loc, access: "free", isSecret: false, tips: { es: [], en: [] }, ...over,
});
const offer = (id: string, over: object) => ({
  ...base, id, slug: id, status: "published", categoryId: "2x1", title: { es: id, en: id }, business: "B",
  benefit: { es: "b", en: "b" }, summary: { es: "s", en: "s" }, conditions: { es: ["c"], en: ["c"] },
  startsAt: null, endsAt: null, location: loc, couponCode: null, redeemUrl: null, featured: false, isSample: false, ...over,
});

const content = {
  places: [
    place("p1", "playa-uno", { title: { es: "Playa Única", en: "Unique Beach" } }),
    place("p2", "borrador", { status: "draft" }),
    place("p3", "secreto", { categoryId: "naturaleza", access: "paid", isSecret: true }),
  ],
  restaurants: [],
  offers: [
    offer("activa", { endsAt: "2026-12-31" }),
    offer("vencida", { endsAt: "2026-01-31" }),
    offer("proxima", { startsAt: "2026-11-01" }),
    offer("oculta", { status: "draft" }),
  ],
  coupons: [{ id: "c1", offerId: "activa", code: "AHORRA", status: "active" }, { id: "c2", offerId: "vencida", code: "OFF", status: "disabled" }],
  articles: [], categories: [], tags: [], tips: [], legal: {},
} as unknown as AllContent;

vi.mock("@/lib/content/load", () => ({ loadAllContent: () => content }));

import { createLocalRepository, matchesQuery } from "@/lib/repositories/local";

describe("repositorio local", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-06-15T17:00:00Z")); });
  afterEach(() => vi.useRealTimers());

  it("no devuelve borradores y filtra por acceso/secreto", async () => {
    const r = createLocalRepository();
    expect((await r.places.list()).map((p) => p.slug)).toEqual(["playa-uno", "secreto"]);
    expect((await r.places.list({ isSecret: true })).map((p) => p.slug)).toEqual(["secreto"]);
    expect((await r.places.list({ access: "free" })).map((p) => p.slug)).toEqual(["playa-uno"]);
    expect(await r.places.getBySlug("borrador")).toBeNull();
    expect((await r.places.getById("p1"))?.slug).toBe("playa-uno");
  });

  it("busca sin distinguir acentos ni mayúsculas, en el idioma pedido", async () => {
    const r = createLocalRepository();
    expect((await r.places.search("unica", "es")).length).toBe(1);
    expect((await r.places.search("UNIQUE", "en")).length).toBe(1);
    expect((await r.places.search("unique", "es")).length).toBe(0);
    expect(matchesQuery("Cancún Playa", "cancun playa")).toBe(true);
  });

  it("separa ofertas activas, próximas y vencidas y oculta borradores", async () => {
    const r = createLocalRepository();
    expect((await r.offers.list({ status: "active" })).map((o) => o.id)).toEqual(["activa"]);
    expect((await r.offers.list({ status: "expired" })).map((o) => o.id)).toEqual(["vencida"]);
    expect((await r.offers.list({ status: "upcoming" })).map((o) => o.id)).toEqual(["proxima"]);
    expect(await r.offers.getBySlug("oculta")).toBeNull();
  });

  it("la búsqueda no incluye ofertas vencidas", async () => {
    const r = createLocalRepository();
    expect((await r.offers.search("activa", "es")).map((o) => o.id)).toContain("activa");
    expect((await r.offers.search("vencida", "es")).length).toBe(0);
  });

  it("cupones: solo los activos", async () => {
    const r = createLocalRepository();
    expect((await r.offers.getCouponForOffer("activa"))?.code).toBe("AHORRA");
    expect(await r.offers.getCouponForOffer("vencida")).toBeNull();
  });
});
