import { describe, expect, it } from "vitest";
import { href, switchLocalePath } from "@/i18n/routes";

describe("rutas i18n", () => {
  it("español en la raíz, inglés bajo /en", () => {
    expect(href("es", null)).toBe("/");
    expect(href("en", null)).toBe("/en");
    expect(href("es", "gratis")).toBe("/gratis");
    expect(href("en", "gratis")).toBe("/en/free");
    expect(href("en", "lugares", "playa-delfines")).toBe("/en/places/playa-delfines");
  });
  it("cambia de idioma conservando la página", () => {
    expect(switchLocalePath("/gratis", "en")).toBe("/en/free");
    expect(switchLocalePath("/en/free", "es")).toBe("/gratis");
    expect(switchLocalePath("/en", "es")).toBe("/");
    expect(switchLocalePath("/", "en")).toBe("/en");
    expect(switchLocalePath("/en/places/x", "es")).toBe("/lugares/x");
    expect(switchLocalePath("/blog/a", "en")).toBe("/en/blog/a");
  });
});
