/**
 * Importa un trazado hecho en geojson.io / uMap (GeoJSON) a content/routes.json.
 *   npm run routes:import -- ruta.geojson r-1 --code R-1 --zone cancun --name "Centro – Zona Hotelera"
 * - Líneas (LineString) → recorridos (ida, vuelta…). Puntos (Point) → paradas aproximadas, en orden.
 * - Si el slug ya existe, reemplaza recorridos y paradas y conserva el resto de los datos.
 * - Si es nuevo, crea un BORRADOR (status draft) para completar nombres, resumen y tarifa.
 */
import fs from "node:fs";
import path from "node:path";
import { routeSchema, type Route } from "../src/content/schemas";
import { geojsonToGeometry, stringifyCompact } from "../src/lib/geojson";
import { checkRoute } from "../src/lib/routes";

const fail = (m: string): never => { console.error("✘ " + m); process.exit(1); };
const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const [file, slug] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!file || !slug) fail('Uso: npm run routes:import -- <archivo.geojson> <slug> [--code R-1] [--zone cancun] [--name "Nombre"]');
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail("El slug debe ir en minúsculas con guiones, p. ej. r-1");
if (!fs.existsSync(file)) fail(`No existe el archivo ${file}`);

const dir = path.join(process.cwd(), "content");
const routesFile = path.join(dir, "routes.json");
const routes: Route[] = JSON.parse(fs.readFileSync(routesFile, "utf8"));
const categories: { id: string; kind: string }[] = JSON.parse(fs.readFileSync(path.join(dir, "categories.json"), "utf8"));
const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Cancun" });
const TODO = "POR COMPLETAR";

let geo;
try { geo = geojsonToGeometry(JSON.parse(fs.readFileSync(file, "utf8"))); } catch (e) { fail(e instanceof Error ? e.message : String(e)); }
const g = geo!;

const existing = routes.find((r) => r.slug === slug);
let route: Route;
if (existing) {
  route = { ...existing, paths: g.paths, stops: g.stops, updatedAt: today, color: opt("color") ?? (g.color || existing.color) };
} else {
  const zone = opt("zone") ?? categories.find((c) => c.kind === "route")!.id;
  if (!categories.some((c) => c.id === zone && c.kind === "route")) fail(`Zona inválida "${zone}". Opciones: ${categories.filter((c) => c.kind === "route").map((c) => c.id).join(", ")}`);
  const name = opt("name") ?? TODO;
  route = routeSchema.parse({
    id: `route-${slug}`, slug, status: "draft", createdAt: today, updatedAt: today,
    verification: { status: "pending", lastVerified: null }, categoryId: zone, tagIds: [],
    code: opt("code") ?? TODO.slice(0, 12), name: { es: name, en: name }, summary: { es: TODO, en: TODO },
    color: opt("color") ?? g.color ?? "#16B8B3", fare: { amountMxn: null }, paths: g.paths, stops: g.stops,
  });
}
route = routeSchema.parse(route);
const problem = checkRoute(route);
if (problem) fail(problem);

const next = existing ? routes.map((r) => (r.slug === slug ? route : r)) : [...routes, route];
fs.writeFileSync(routesFile, stringifyCompact(next));
const pts = route.paths.map((p) => `${p.name.es}: ${p.coordinates.length} puntos`).join(" · ");
console.log(`✔ ${existing ? "Actualizada" : "Creada (borrador)"} la ruta "${slug}" — ${pts} — ${route.stops.length} paradas`);
if (!existing) console.log(`  Siguiente: abre content/routes.json, completa code/name/summary (es y en) y tarifa si ya la verificaste; luego: npm run content -- publish route ${slug}`);
console.log("  Luego: npm run validate:content");
