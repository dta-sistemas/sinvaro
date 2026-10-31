import type { Article } from "@/content/schemas";

/** Artículo más relacionado con un elemento: exige al menos una etiqueta en común (si no, no se muestra "Lee también"). */
export function pickRelatedArticle(item: { tagIds: string[] }, articles: Article[]): Article | null {
  const scored = articles
    .map((a) => ({ a, n: a.tagIds.filter((t) => item.tagIds.includes(t)).length }))
    .filter((x) => x.n > 0)
    .sort((x, y) => y.n - x.n || y.a.publishedAt.localeCompare(x.a.publishedAt));
  return scored[0]?.a ?? null;
}
