import type { Category, Locale } from "@/content/schemas";
import type { CardItem } from "@/lib/cards";

export const categoryGroup = (cats: Category[], label: string, locale: Locale): FilterGroup => ({
  key: "category", label, options: cats.map((c) => ({ value: c.id, label: c.name[locale] })),
});

export const areaGroup = (items: CardItem[], label: string): FilterGroup => ({
  key: "area", label,
  options: [...new Set(items.map((i) => i.area).filter((a): a is string => !!a))].sort().map((a) => ({ value: a, label: a })),
});

export const valueGroup = (key: string, label: string, options: [string, string][]): FilterGroup => ({
  key, label, options: options.map(([value, l]) => ({ value, label: l })),
});

export interface FilterGroup {
  key: string; // clave en CardItem.filters
  label: string;
  options: { value: string; label: string }[];
}

/** Aplica los filtros seleccionados (un valor por grupo; ausente = todos). */
export function applyFilters(items: CardItem[], selected: Record<string, string | undefined>): CardItem[] {
  return items.filter((it) => Object.entries(selected).every(([k, v]) => !v || (it.filters[k] ?? []).includes(v)));
}
