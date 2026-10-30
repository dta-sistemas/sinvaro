import type { Route } from "@/content/schemas";
import { distanceToPathMeters } from "@/lib/geo";

// Límites aproximados de Quintana Roo: detectan latitud/longitud invertidas o mal escritas.
const LAT: [number, number] = [17.5, 21.9];
const LNG: [number, number] = [-89.5, -86.4];
const inQRoo = (lat: number, lng: number) => lat >= LAT[0] && lat <= LAT[1] && lng >= LNG[0] && lng <= LNG[1];
const MAX_STOP_OFF_PATH_M = 1000;

/** Reglas de integridad de una ruta. Devuelve el primer problema o null. */
export function checkRoute(r: Route): string | null {
  const id = `routes "${r.id}"`;
  for (const p of r.paths) for (const [lat, lng] of p.coordinates) {
    if (!inQRoo(lat, lng)) return `${id}: el recorrido "${p.id}" tiene un punto fuera de Quintana Roo (${lat}, ${lng}) — ¿lat/lng invertidos?`;
  }
  const pathIds = new Set(r.paths.map((p) => p.id));
  if (pathIds.size !== r.paths.length) return `${id}: ids de recorrido repetidos`;
  for (const s of r.stops) {
    if (!inQRoo(s.lat, s.lng)) return `${id}: la parada "${s.name}" está fuera de Quintana Roo (${s.lat}, ${s.lng}) — ¿lat/lng invertidos?`;
    if (s.pathId && !pathIds.has(s.pathId)) return `${id}: la parada "${s.name}" apunta al recorrido inexistente "${s.pathId}"`;
    const candidates = r.paths.filter((p) => !s.pathId || p.id === s.pathId);
    const d = Math.min(...candidates.map((p) => distanceToPathMeters([s.lat, s.lng], p.coordinates)));
    if (d > MAX_STOP_OFF_PATH_M) return `${id}: la parada "${s.name}" está a ${Math.round(d)} m del recorrido (máximo ${MAX_STOP_OFF_PATH_M} m)`;
  }
  if (r.status === "published") {
    if (r.verification.status === "pending" && r.fare.amountMxn !== null) return `${id}: no publiques la tarifa sin verificar la ruta (usa amountMxn: null)`;
    if (r.verification.status === "verified" && !r.verification.lastVerified) return `${id}: verification "verified" requiere lastVerified`;
  }
  return null;
}
