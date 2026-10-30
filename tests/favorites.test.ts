import { beforeEach, describe, expect, it, vi } from "vitest";

function stubBrowser(initial?: string, blocked = false) {
  const data = new Map<string, string>(initial ? [["sinvaro:favorites:v1", initial]] : []);
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => { if (blocked) throw new Error("blocked"); return data.get(k) ?? null; },
      setItem: (k: string, v: string) => { if (blocked) throw new Error("blocked"); data.set(k, v); },
    },
    addEventListener: () => {},
  });
  return data;
}

describe("favoritos (localStorage)", () => {
  beforeEach(() => { vi.resetModules(); vi.unstubAllGlobals(); });

  it("guarda, quita y notifica a los suscriptores", async () => {
    const data = stubBrowser();
    const { favoritesStore: s } = await import("@/lib/favorites");
    const listener = vi.fn();
    s.subscribe(listener);
    s.toggle("place:p1");
    s.toggle("offer:o1");
    expect(s.getSnapshot()).toEqual(["place:p1", "offer:o1"]);
    expect(JSON.parse(data.get("sinvaro:favorites:v1")!)).toEqual(["place:p1", "offer:o1"]);
    s.toggle("place:p1");
    expect(s.getSnapshot()).toEqual(["offer:o1"]);
    s.remove("offer:o1");
    expect(s.getSnapshot()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it("recupera favoritos guardados y es estable entre lecturas", async () => {
    stubBrowser('["place:p9"]');
    const { favoritesStore: s } = await import("@/lib/favorites");
    expect(s.getSnapshot()).toEqual(["place:p9"]);
    expect(s.getSnapshot()).toBe(s.getSnapshot());
  });

  it("tolera JSON dañado y almacenamiento bloqueado", async () => {
    stubBrowser("{no es json");
    expect((await import("@/lib/favorites")).favoritesStore.getSnapshot()).toEqual([]);
    vi.resetModules();
    stubBrowser(undefined, true);
    const { favoritesStore: s } = await import("@/lib/favorites");
    expect(() => s.toggle("place:p1")).not.toThrow();
    expect(s.getServerSnapshot()).toEqual([]);
  });
});
