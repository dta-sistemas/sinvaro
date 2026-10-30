import { describe, expect, it } from "vitest";
import { bandForPrice, filterBands, formatPrice } from "@/lib/price";
import { restaurantSchema } from "@/content/schemas";
import { loadAllContent } from "@/lib/content/load";

describe("precios", () => {
  it("clasifica número o gratis en un rango", () => {
    expect(bandForPrice(0)).toBe("free");
    expect(bandForPrice(30)).toBe("under50");
    expect(bandForPrice(50)).toBe("under100"); // "menos de $50" es estricto
    expect(bandForPrice(99.5)).toBe("under100");
    expect(bandForPrice(120)).toBe("under150");
    expect(bandForPrice(150)).toBe("over150");
  });
  it("los filtros son acumulativos (gratis y baratos también entran en los rangos mayores)", () => {
    expect(filterBands("free")).toEqual(["free", "under50", "under100", "under150"]);
    expect(filterBands("under100")).toEqual(["under100", "under150"]);
    expect(filterBands("over150")).toEqual(["over150"]);
    expect(filterBands("unknown")).toEqual([]);
  });
  it("formatea número o 'gratis'", () => {
    const l = { free: "Gratis", from: "Desde" };
    expect(formatPrice(0, l)).toBe("Gratis");
    expect(formatPrice(70, l)).toBe("Desde $70 MXN");
    expect(formatPrice(45.5, l)).toBe("Desde $45.50 MXN");
  });
  it("el esquema acepta priceMxn numérico o 0 y rechaza negativos", () => {
    const r = loadAllContent().restaurants[0];
    expect(restaurantSchema.safeParse({ ...r, priceMxn: 70 }).success).toBe(true);
    expect(restaurantSchema.safeParse({ ...r, priceMxn: 0 }).success).toBe(true);
    expect(restaurantSchema.safeParse({ ...r, priceMxn: -1 }).success).toBe(false);
  });
});
