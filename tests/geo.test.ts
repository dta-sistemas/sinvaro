import { describe, expect, it } from "vitest";
import { distanceMeters, distanceToPathMeters, nearbyItems, routesNearPoint } from "@/lib/geo";
import { checkRoute } from "@/lib/routes";
import { geojsonToGeometry, stringifyCompact } from "@/lib/geojson";
import { routeSchema, type LatLngTuple, type Route } from "@/content/schemas";

// ~111 m por 0.001° de latitud
const path: LatLngTuple[] = [[21.16, -86.83], [21.17, -86.83]];

describe("geo", () => {
  it("distancia entre puntos (haversine)", () => {
    const d = distanceMeters([21.0, -86.8], [21.01, -86.8]);
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1115);
  });
  it("distancia a la polilínea: perpendicular y a los extremos", () => {
    // 0.0045° de longitud a esa latitud ≈ 467 m
    expect(distanceToPathMeters([21.165, -86.8255], path)).toBeGreaterThan(450);
    expect(distanceToPathMeters([21.165, -86.8255], path)).toBeLessThan(480);
    expect(distanceToPathMeters([21.165, -86.83], path)).toBeLessThan(1);
    // más allá del extremo norte: mide al extremo, no a la línea infinita
    const beyond = distanceToPathMeters([21.18, -86.83], path);
    expect(beyond).toBeGreaterThan(1090);
    expect(beyond).toBeLessThan(1130);
  });
  it("nearbyItems respeta el radio de 500 m, ordena por cercanía e ignora lo que no tiene coordenadas", () => {
    const items = [
      { id: "lejos", coords: { lat: 21.165, lng: -86.8240 } },   // ~ 600 m
      { id: "cerca", coords: { lat: 21.165, lng: -86.8255 } },   // ~ 467 m
      { id: "encima", coords: { lat: 21.165, lng: -86.8301 } },  // ~ 11 m
      { id: "sin", coords: null },
    ];
    const out = nearbyItems([path], items, 500);
    expect(out.map((i) => i.id)).toEqual(["encima", "cerca"]);
    expect(out[0].distance).toBeLessThan(30);
  });
  it("routesNearPoint encuentra rutas cercanas a un punto", () => {
    const routes = [{ id: "a", paths: [{ coordinates: path }] }, { id: "b", paths: [{ coordinates: [[20.6, -87.07], [20.62, -87.07]] as LatLngTuple[] }] }];
    expect(routesNearPoint(routes, [21.165, -86.8255], 500).map((r) => r.id)).toEqual(["a"]);
  });
});

const base: Route = routeSchema.parse({
  id: "r1", slug: "r-1", status: "published", createdAt: "2026-01-01", updatedAt: "2026-01-01",
  verification: { status: "pending", lastVerified: null }, categoryId: "cancun", code: "R-1", color: "#16B8B3",
  name: { es: "R-1", en: "R-1" }, summary: { es: "x", en: "x" },
  paths: [{ id: "ida", name: { es: "Ida", en: "Outbound" }, coordinates: path }],
  stops: [{ name: "Parada A", lat: 21.162, lng: -86.8301 }],
});

describe("validación de rutas", () => {
  it("acepta una ruta correcta", () => expect(checkRoute(base)).toBeNull());
  it("detecta lat/lng invertidos", () => {
    const bad = { ...base, paths: [{ ...base.paths[0], coordinates: [[-86.83, 21.16], [-86.83, 21.17]] as LatLngTuple[] }] };
    expect(checkRoute(bad as Route)).toMatch(/fuera de Quintana Roo/);
  });
  it("detecta paradas lejos del recorrido o con recorrido inexistente", () => {
    expect(checkRoute({ ...base, stops: [{ name: "Lejos", lat: 21.3, lng: -86.83, approximate: true }] })).toMatch(/del recorrido/);
    expect(checkRoute({ ...base, stops: [{ name: "X", lat: 21.162, lng: -86.8301, approximate: true, pathId: "vuelta" }] })).toMatch(/inexistente/);
  });
  it("no permite tarifa en una ruta sin verificar", () => {
    expect(checkRoute({ ...base, fare: { amountMxn: 12 } })).toMatch(/tarifa sin verificar/);
    expect(checkRoute({ ...base, fare: { amountMxn: 12 }, verification: { status: "verified", lastVerified: "2026-10-30" } })).toBeNull();
  });
});

describe("importador GeoJSON", () => {
  const gj = {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: { name: "Ida", stroke: "#ff0000" }, geometry: { type: "LineString", coordinates: [[-86.83, 21.16], [-86.83, 21.17]] } },
      { type: "Feature", properties: { name: "Vuelta" }, geometry: { type: "LineString", coordinates: [[-86.83, 21.17], [-86.83, 21.16]] } },
      { type: "Feature", properties: { name: "Plaza" }, geometry: { type: "Point", coordinates: [-86.83, 21.165] } },
      { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [-86.83, 21.168] } },
    ],
  };
  it("convierte [lng,lat] a [lat,lng], separa recorridos y paradas y toma el color", () => {
    const g = geojsonToGeometry(gj);
    expect(g.paths.map((p) => p.id)).toEqual(["ida", "vuelta"]);
    expect(g.paths[0].coordinates[0]).toEqual([21.16, -86.83]);
    expect(g.stops.map((s) => s.name)).toEqual(["Plaza", "Parada 2"]);
    expect(g.stops[0]).toMatchObject({ lat: 21.165, lng: -86.83, approximate: true });
    expect(g.color).toBe("#ff0000");
  });
  it("falla con archivos sin líneas o que no son GeoJSON", () => {
    expect(() => geojsonToGeometry({ type: "FeatureCollection", features: [gj.features[2]] })).toThrow(/ninguna línea/);
    expect(() => geojsonToGeometry({ foo: 1 })).toThrow(/FeatureCollection/);
  });
  it("stringifyCompact deja cada coordenada en una línea", () => {
    expect(stringifyCompact({ c: [[21.1, -86.8], [21.2, -86.9]] })).toContain("[21.1, -86.8]");
  });
});
