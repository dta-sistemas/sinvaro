/** Utilidades de texto puras (seguras para el cliente). */
export const normalizeText = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** Todas las palabras de la consulta deben aparecer (sin acentos ni mayúsculas). */
export function matchesQuery(haystack: string, query: string): boolean {
  const h = normalizeText(haystack);
  return normalizeText(query).split(/\s+/).filter(Boolean).every((w) => h.includes(w));
}
