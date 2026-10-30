import { createLocalRepository } from "./local";
import type { ContentRepository } from "./types";

export type * from "./types";

let repo: ContentRepository | null = null;

/**
 * Único punto donde se decide la fuente de datos.
 * Fase 1: JSON local. Fase 4: devolver un cliente HTTP de la API (por ejemplo según
 * `process.env.CONTENT_SOURCE === "api"`) sin tocar páginas ni componentes.
 */
export function getContent(): ContentRepository {
  return (repo ??= createLocalRepository());
}

export { getOfferStatus } from "@/lib/offers";
