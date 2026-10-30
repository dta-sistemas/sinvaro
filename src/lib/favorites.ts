/**
 * Favoritos. Fase 1: localStorage del navegador, sin cuenta.
 * Las tarjetas solo usan `FavoritesStore`; para migrar a usuarios autenticados basta con
 * otra implementación (p. ej. una que sincronice con la API) sin cambiar ningún componente visual.
 */
export interface FavoritesStore {
  getSnapshot(): readonly string[];
  getServerSnapshot(): readonly string[];
  subscribe(listener: () => void): () => void;
  toggle(key: string): void;
  remove(key: string): void;
}

const STORAGE_KEY = "sinvaro:favorites:v1";
const EMPTY: readonly string[] = [];

function createLocalStorageStore(): FavoritesStore {
  let cache: readonly string[] = EMPTY;
  let raw: string | null | undefined;
  const listeners = new Set<() => void>();

  const read = (): readonly string[] => {
    try {
      const current = window.localStorage.getItem(STORAGE_KEY);
      if (current === raw) return cache;
      raw = current;
      const parsed: unknown = current ? JSON.parse(current) : [];
      cache = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : EMPTY;
    } catch {
      cache = EMPTY; // almacenamiento bloqueado o JSON dañado
    }
    return cache;
  };
  const write = (next: string[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* sin almacenamiento disponible: el cambio no persiste */
    }
    raw = undefined; // fuerza relectura
    listeners.forEach((l) => l());
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) { raw = undefined; listeners.forEach((l) => l()); }
    });
  }

  return {
    getSnapshot: read,
    getServerSnapshot: () => EMPTY,
    subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
    toggle(key) { const cur = read(); write(cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]); },
    remove(key) { write(read().filter((k) => k !== key)); },
  };
}

export const favoritesStore: FavoritesStore = createLocalStorageStore();
