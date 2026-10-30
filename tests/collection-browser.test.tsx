// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CollectionBrowser } from "@/components/CollectionBrowser";
import { getDictionary } from "@/i18n/dictionaries";
import type { CardItem } from "@/lib/cards";

const dict = getDictionary("es");
const mk = (id: string, title: string, cat: string, area: string): CardItem => ({
  key: `place:${id}`, type: "place", id, href: `/lugares/${id}`, title, summary: `Resumen de ${title}`, categoryId: cat, categoryName: cat,
  color: "teal", icon: "Waves", badge: null, area, photo: null, pending: true, offerStatus: null, endsAt: null, date: null, coords: null,
  filters: { category: [cat], area: [area] },
});
const items = [mk("a", "Playa Uno", "playas", "Zona Hotelera"), mk("b", "Parque Dos", "parques", "Centro"), mk("c", "Playa Tres", "playas", "Centro")];
const groups = [
  { key: "category", label: "Categoría", options: [{ value: "playas", label: "Playas" }, { value: "parques", label: "Parques" }, { value: "cenotes", label: "Cenotes" }] },
  { key: "area", label: "Zona", options: [{ value: "Centro", label: "Centro" }, { value: "Zona Hotelera", label: "Zona Hotelera" }] },
];
const desktop = () => within(screen.getByRole("complementary"));
const titles = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

beforeEach(() => window.history.replaceState(null, "", "/gratis"));
afterEach(cleanup);

describe("CollectionBrowser (barra lateral + lista)", () => {
  it("muestra la lista completa y solo opciones con contenido, con conteos", () => {
    render(<CollectionBrowser items={items} groups={groups} dict={dict} />);
    expect(titles()).toEqual(["Playa Uno", "Parque Dos", "Playa Tres"]);
    expect(screen.getAllByText("3 resultados").length).toBeGreaterThan(0);
    expect(desktop().queryByLabelText(/Cenotes/)).toBeNull(); // sin contenido → oculta
    expect(desktop().getByRole("radio", { name: /Playas/ })).toBeTruthy();
  });

  it("filtra por categoría y por zona combinadas, y actualiza la URL", async () => {
    const user = userEvent.setup();
    render(<CollectionBrowser items={items} groups={groups} dict={dict} />);
    await user.click(desktop().getByRole("radio", { name: /Playas/ }));
    expect(titles()).toEqual(["Playa Uno", "Playa Tres"]);
    expect(window.location.search).toBe("?category=playas");
    await user.click(desktop().getByRole("radio", { name: /^Centro/ }));
    expect(titles()).toEqual(["Playa Tres"]);
    expect(window.location.search).toContain("area=Centro");
    // el conteo de la otra opción de zona refleja la categoría elegida
    expect(desktop().getByRole("radio", { name: /Zona Hotelera/ })).toBeTruthy();
  });

  it("busca dentro de la lista sin acentos y permite limpiar", async () => {
    const user = userEvent.setup();
    render(<CollectionBrowser items={items} groups={groups} dict={dict} />);
    await user.type(screen.getByRole("searchbox"), "PARQUE");
    expect(titles()).toEqual(["Parque Dos"]);
    expect(window.location.search).toBe("?q=PARQUE");
    await user.click(screen.getAllByRole("button", { name: "Limpiar filtros" })[0]);
    expect(titles().length).toBe(3);
  });

  it("muestra estado sin resultados y se recupera al limpiar", async () => {
    const user = userEvent.setup();
    render(<CollectionBrowser items={items} groups={groups} dict={dict} />);
    await user.type(screen.getByRole("searchbox"), "zzzz");
    expect(screen.getByText("No encontramos resultados")).toBeTruthy();
    await user.click(screen.getAllByRole("button", { name: "Limpiar filtros" }).at(-1)!);
    expect(titles().length).toBe(3);
  });

  it("aplica filtros desde la URL al cargar (?category=parques)", () => {
    window.history.replaceState(null, "", "/gratis?category=parques");
    render(<CollectionBrowser items={items} groups={groups} dict={dict} />);
    expect(titles()).toEqual(["Parque Dos"]);
    expect(window.location.search).toBe("?category=parques");
  });

  it("ignora valores de URL inválidos", () => {
    window.history.replaceState(null, "", "/gratis?category=inventada");
    render(<CollectionBrowser items={items} groups={groups} dict={dict} />);
    expect(titles().length).toBe(3);
  });

  it("carga progresiva con 'Ver más'", async () => {
    const many = Array.from({ length: 30 }, (_, i) => mk(`x${i}`, `Lugar ${i}`, "playas", "Centro"));
    const user = userEvent.setup();
    render(<CollectionBrowser items={many} groups={groups} dict={dict} pageSize={12} />);
    expect(titles().length).toBe(12);
    await user.click(screen.getByRole("button", { name: "Ver más" }));
    expect(titles().length).toBe(24);
  });

  it("colección vacía muestra el estado vacío", () => {
    render(<CollectionBrowser items={[]} groups={groups} dict={dict} />);
    expect(screen.getByText(dict.filters.emptyCollectionTitle)).toBeTruthy();
  });
});
