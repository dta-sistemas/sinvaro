import type { Restaurant } from "@/content/schemas";

export type PriceBand = Restaurant["priceBand"];

/** Rango orientativo según un precio de referencia en MXN. "Menos de $50" es estrictamente menor que 50. */
export function bandForPrice(mxn: number): PriceBand {
  if (mxn === 0) return "free";
  if (mxn < 50) return "under50";
  if (mxn < 100) return "under100";
  if (mxn < 150) return "under150";
  return "over150";
}

/** Los filtros son acumulativos: algo de $30 aparece en "menos de $50", "$100" y "$150"; algo gratis aparece también en todos. */
export function filterBands(band: PriceBand): string[] {
  switch (band) {
    case "free": return ["free", "under50", "under100", "under150"];
    case "under50": return ["under50", "under100", "under150"];
    case "under100": return ["under100", "under150"];
    case "under150": return ["under150"];
    case "over150": return ["over150"];
    default: return [];
  }
}

export function formatPrice(mxn: number, labels: { free: string; from: string }): string {
  return mxn === 0 ? labels.free : `${labels.from} $${Number.isInteger(mxn) ? mxn : mxn.toFixed(2)} MXN`;
}
