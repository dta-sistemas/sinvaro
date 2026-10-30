import { describe, expect, it } from "vitest";
import { loadAllContent } from "@/lib/content/load";
import { offerSchema, placeSchema } from "@/content/schemas";
import { applyFilters, presentGroups } from "@/lib/filters";
import type { CardItem } from "@/lib/cards";

describe("contenido real del repositorio", () => {
  it("es válido (esquemas, slugs únicos, categorías existentes)", () => {
    const c = loadAllContent();
    expect(c.places.length).toBeGreaterThan(0);
    expect(c.articles.length).toBeGreaterThan(0);
  });
  it("no incluye ofertas reales inventadas", () => {
    expect(loadAllContent().offers.filter((o) => !o.isSample)).toEqual([]);
  });
  it("todo lugar sin verificar declara lastVerified nulo", () => {
    for (const p of loadAllContent().places) if (p.verification.status === "pending") expect(p.verification.lastVerified).toBeNull();
  });
});

describe("esquemas", () => {
  it("rechaza slugs inválidos, fechas mal formadas y textos sin traducción", () => {
    const place = loadAllContent().places[0];
    expect(placeSchema.safeParse({ ...place, slug: "Slug Malo" }).success).toBe(false);
    expect(placeSchema.safeParse({ ...place, updatedAt: "ayer" }).success).toBe(false);
    expect(placeSchema.safeParse({ ...place, title: { es: "solo español", en: "" } }).success).toBe(false);
    expect(offerSchema.safeParse({}).success).toBe(false);
  });
});

describe("filtros", () => {
  const mk = (key: string, filters: Record<string, string[]>) => ({ key, filters }) as unknown as CardItem;
  const items = [mk("a", { category: ["playas"], price: ["under50"] }), mk("b", { category: ["tacos"], price: ["under100"] })];
  it("filtra por uno o varios grupos y sin selección devuelve todo", () => {
    expect(applyFilters(items, {}).length).toBe(2);
    expect(applyFilters(items, { category: "playas" }).map((i) => i.key)).toEqual(["a"]);
    expect(applyFilters(items, { category: "playas", price: "under100" })).toEqual([]);
  });
  it("oculta opciones sin contenido", () => {
    const groups = [{ key: "category", label: "c", options: [{ value: "playas", label: "P" }, { value: "tacos", label: "T" }] }, { key: "price", label: "p", options: [{ value: "under50", label: "x" }] }];
    const out = presentGroups([items[0]], groups);
    expect(out.map((g) => g.key)).toEqual(["category", "price"]);
    expect(out[0].options.map((o) => o.value)).toEqual(["playas"]);
    expect(presentGroups([mk("z", {})], groups)).toEqual([]);
  });
});
