import type { LatLngTuple } from "@/content/schemas";

const R = 6371008.8; // radio medio de la Tierra (m)
const rad = (d: number) => (d * Math.PI) / 180;

/** Distancia en metros entre dos puntos [lat, lng] (haversine). */
export function distanceMeters(a: LatLngTuple, b: LatLngTuple): number {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Distancia mínima (m) de un punto a una polilínea. Proyección local plana: suficiente para distancias urbanas. */
export function distanceToPathMeters(p: LatLngTuple, path: LatLngTuple[]): number {
  if (path.length === 0) return Infinity;
  if (path.length === 1) return distanceMeters(p, path[0]);
  const kx = Math.cos(rad(p[0])) * (Math.PI / 180) * R;
  const ky = (Math.PI / 180) * R;
  const xy = (q: LatLngTuple) => [(q[1] - p[1]) * kx, (q[0] - p[0]) * ky] as const;
  let best = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, ay] = xy(path[i]);
    const [bx, by] = xy(path[i + 1]);
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, (-ax * dx - ay * dy) / len2));
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return best;
}

export interface WithCoords { coords: { lat: number; lng: number } | null }

/** Elementos a `radius` metros o menos de cualquiera de los trazados, del más cercano al más lejano. */
export function nearbyItems<T extends WithCoords>(paths: LatLngTuple[][], items: T[], radius: number): (T & { distance: number })[] {
  return items
    .flatMap((it) => {
      if (!it.coords) return [];
      const p: LatLngTuple = [it.coords.lat, it.coords.lng];
      const distance = Math.min(...paths.map((path) => distanceToPathMeters(p, path)));
      return distance <= radius ? [{ ...it, distance: Math.round(distance) }] : [];
    })
    .sort((a, b) => a.distance - b.distance);
}

/** Rutas que pasan a `radius` metros o menos de un punto, con su distancia. */
export function routesNearPoint<R extends { paths: { coordinates: LatLngTuple[] }[] }>(routes: R[], point: LatLngTuple, radius: number): (R & { distance: number })[] {
  return routes
    .map((r) => ({ ...r, distance: Math.round(Math.min(...r.paths.map((p) => distanceToPathMeters(point, p.coordinates)))) }))
    .filter((r) => r.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}
