// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItemCard } from "@/components/cards";
import { getDictionary } from "@/i18n/dictionaries";
import type { CardItem } from "@/lib/cards";

const labels = getDictionary("es").labels;
const item: CardItem = {
  key: "place:p1", type: "place", id: "p1", href: "/lugares/p1", title: "Playa Uno", summary: "Resumen", categoryId: "playas", categoryName: "Playas",
  color: "teal", icon: "Waves", badge: { label: "Gratis", color: "pink" }, area: "Zona Hotelera", photo: null, pending: true, offerStatus: null,
  endsAt: null, date: null, coords: null, filters: {}, route: null,
};

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe("ItemCard", () => {
  it("enlaza a la ficha, muestra 'Por verificar' y el corazón guarda/quita en localStorage", async () => {
    const user = userEvent.setup();
    render(<ItemCard item={item} labels={labels} />);
    expect(screen.getByRole("link", { name: "Playa Uno" }).getAttribute("href")).toBe("/lugares/p1");
    expect(screen.getByText("Por verificar")).toBeTruthy();
    const heart = screen.getByRole("button", { name: /Guardar en favoritos/ });
    expect(heart.getAttribute("aria-pressed")).toBe("false");
    await user.click(heart);
    expect(screen.getByRole("button", { name: /Quitar de favoritos/ }).getAttribute("aria-pressed")).toBe("true");
    expect(JSON.parse(window.localStorage.getItem("sinvaro:favorites:v1")!)).toEqual(["place:p1"]);
    await user.click(screen.getByRole("button", { name: /Quitar de favoritos/ }));
    expect(JSON.parse(window.localStorage.getItem("sinvaro:favorites:v1")!)).toEqual([]);
  });

  it("el corazón está en una esquina superior (contenedor absoluto), no en el flujo de la tarjeta", () => {
    render(<ItemCard item={item} labels={labels} />);
    const wrapper = screen.getByRole("button", { name: /favoritos/ }).parentElement!;
    expect(wrapper.className).toContain("absolute");
    expect(wrapper.className).toContain("top-3");
  });
});

describe("ItemCard de ruta", () => {
  const route: CardItem = { ...item, key: "route:r1", type: "route", href: "/como-llegar/r-1", title: "Centro – Zona Hotelera", badge: null, categoryName: "Cancún",
    route: { code: "R-1", color: "#8547E8", fare: null, stops: 1, nearby: 3 } };
  it("muestra código, tarifa por confirmar, conteos con plural correcto y enlaza a la ruta", () => {
    const t = getDictionary("es").pages.routes;
    render(<ItemCard item={route} labels={labels} routeLabels={t} />);
    expect(screen.getByRole("link", { name: /Centro – Zona Hotelera/ }).getAttribute("href")).toBe("/como-llegar/r-1");
    expect(screen.getByText("R-1")).toBeTruthy();
    expect(screen.getByText("Tarifa por confirmar")).toBeTruthy();
    expect(screen.getByText("1 parada · 3 lugares gratis cerca")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Guardar en favoritos/ })).toBeTruthy();
  });
});
