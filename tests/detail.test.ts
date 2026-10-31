import { describe, expect, it } from "vitest";
import { ICON_NAMES } from "@/content/icons";
import { ICONS } from "@/components/ui";
import { pickRelatedArticle } from "@/lib/related";
import { loadAllContent } from "@/lib/content/load";
import { readableOn } from "@/lib/colors";

describe("iconos", () => {
  it("la lista de nombres válidos coincide con los iconos registrados en la UI", () => {
    expect(Object.keys(ICONS).sort()).toEqual([...ICON_NAMES].sort());
  });
  it("todos los iconos usados en el contenido existen", () => {
    const c = loadAllContent();
    const used = [...c.categories.map((x) => x.icon), ...c.tips.map((x) => x.icon), ...c.places.flatMap((p) => p.activities.map((a) => a.icon))];
    for (const name of used) expect(ICON_NAMES).toContain(name);
  });
});

describe("artículo relacionado ('Lee también')", () => {
  const { articles, places } = loadAllContent();
  it("elige el artículo con más etiquetas en común", () => {
    const delfines = places.find((p) => p.slug === "playa-delfines")!;
    expect(pickRelatedArticle(delfines, articles)?.slug).toBe("guia-para-encontrar-playas-publicas-en-cancun");
  });
  it("no muestra nada si no hay etiquetas en común", () => {
    expect(pickRelatedArticle({ tagIds: ["no-existe"] }, articles)).toBeNull();
    expect(pickRelatedArticle({ tagIds: [] }, articles)).toBeNull();
  });
});

describe("contraste", () => {
  it("texto oscuro sobre fondos claros y claro sobre oscuros", () => {
    expect(readableOn("#FFD600")).toBe("#111111");
    expect(readableOn("#8547E8")).toBe("#ffffff");
    expect(readableOn("#111111")).toBe("#ffffff");
  });
});
