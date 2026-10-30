import type { LatLngTuple, Route } from "@/content/schemas";

type Props = Record<string, unknown> | null;
interface Feature { type: "Feature"; properties?: Props; geometry: { type: string; coordinates: any } | null }
interface Collection { type: "FeatureCollection"; features: Feature[] }

export interface ImportedGeometry {
  paths: Route["paths"];
  stops: Route["stops"];
  color: string | null;
}

const round = (n: number) => Math.round(n * 1e5) / 1e5; // ~1 m
const slugify = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const str = (p: Props, k: string) => (typeof p?.[k] === "string" ? (p![k] as string).trim() : "");

/**
 * Convierte un GeoJSON (geojson.io, uMap, Google My Maps vía KML→GeoJSON, etc.) en recorridos y paradas.
 *  - LineString / MultiLineString → recorridos (nombre = properties.name)
 *  - Point → paradas (nombre = properties.name), en el orden del archivo
 * GeoJSON usa [lng, lat]; aquí se guarda [lat, lng].
 */
export function geojsonToGeometry(input: unknown): ImportedGeometry {
  const fc = input as Collection;
  if (!fc || fc.type !== "FeatureCollection" || !Array.isArray(fc.features)) throw new Error("El archivo debe ser un GeoJSON de tipo FeatureCollection");
  const paths: Route["paths"] = [];
  const stops: Route["stops"] = [];
  let color: string | null = null;
  const used = new Set<string>();
  const uniqueId = (base: string) => { let id = base || "recorrido", n = 2; while (used.has(id)) id = `${base || "recorrido"}-${n++}`; used.add(id); return id; };

  for (const f of fc.features) {
    const g = f.geometry;
    if (!g) continue;
    const name = str(f.properties ?? null, "name") || str(f.properties ?? null, "title");
    if (g.type === "LineString" || g.type === "MultiLineString") {
      const lines: number[][][] = g.type === "LineString" ? [g.coordinates] : g.coordinates;
      lines.forEach((line, i) => {
        const label = name || `Recorrido ${paths.length + 1}`;
        const coords = line.map(([lng, lat]) => [round(lat), round(lng)] as LatLngTuple);
        if (coords.length < 2) return;
        const suffix = lines.length > 1 ? ` ${i + 1}` : "";
        paths.push({ id: uniqueId(slugify(label + suffix)), name: { es: label + suffix, en: label + suffix }, coordinates: coords });
      });
      const stroke = str(f.properties ?? null, "stroke");
      if (!color && /^#[0-9a-fA-F]{6}$/.test(stroke)) color = stroke;
    } else if (g.type === "Point") {
      const [lng, lat] = g.coordinates as number[];
      stops.push({ name: name || `Parada ${stops.length + 1}`, lat: round(lat), lng: round(lng), approximate: true });
    }
  }
  if (paths.length === 0) throw new Error("No se encontró ninguna línea (LineString) en el GeoJSON");
  return { paths, stops, color };
}

/** Serializa JSON con indentación pero dejando cada coordenada [lat, lng] en una sola línea. */
export function stringifyCompact(data: unknown): string {
  return JSON.stringify(data, null, 2).replace(/\[\s+(-?\d+\.?\d*),\s+(-?\d+\.?\d*)\s+\]/g, "[$1, $2]") + "\n";
}
