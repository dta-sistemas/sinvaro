import fs from "node:fs";
import path from "node:path";
import { loadAllContent } from "../src/lib/content/load";
import { getOfferStatus } from "../src/lib/offers";

const warnings: string[] = [];
const errors: string[] = [];

try {
  const c = loadAllContent();
  const counts = Object.entries(c).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.length : Object.keys(v).length}`);

  // Imágenes: el archivo debe existir en /public
  const all = [...c.places, ...c.restaurants, ...c.offers, ...c.articles];
  for (const it of all) {
    const photos = [...it.photos, ...("featuredImage" in it && it.featuredImage ? [it.featuredImage] : [])];
    for (const ph of photos) {
      if (!fs.existsSync(path.join(process.cwd(), "public", ph.src))) errors.push(`${it.id}: la imagen "${ph.src}" no existe en /public`);
    }
    if (it.photos.length === 0 && !("featuredImage" in it && it.featuredImage)) warnings.push(`${it.id}: sin foto (se mostrará un recurso gráfico temporal)`);
  }

  for (const [name, list] of [["lugares", c.places], ["restaurantes", c.restaurants], ["ofertas", c.offers], ["artículos", c.articles]] as const) {
    const pending = list.filter((i) => i.status === "published" && i.verification.status === "pending").length;
    if (pending) warnings.push(`${pending} ${name} publicados siguen "por verificar" (la web los marca así al público)`);
  }
  for (const o of c.offers) {
    if (o.status === "published" && getOfferStatus(o) === "expired") warnings.push(`oferta ${o.id}: vencida (se muestra como vencida, no como activa; considera retirarla)`);
    if (o.isSample) warnings.push(`oferta ${o.id}: es contenido de ejemplo`);
  }
  const usedCats = new Set(all.map((i) => i.categoryId));
  for (const cat of c.categories) if (!usedCats.has(cat.id)) warnings.push(`categoría "${cat.id}" sin contenido (su filtro mostrará "sin resultados")`);
  const usedTags = new Set(all.flatMap((i) => i.tagIds));
  for (const t of c.tags) if (!usedTags.has(t.id)) warnings.push(`etiqueta "${t.id}" sin uso`);

  console.log("✔ Contenido válido —", counts.join(", "));
} catch (e) {
  errors.push(e instanceof Error ? e.message : String(e));
}

if (warnings.length && process.argv.includes("--warnings")) {
  console.log(`\nAvisos (${warnings.length}):`);
  for (const w of warnings) console.log("  • " + w);
} else if (warnings.length) {
  console.log(`  ${warnings.length} avisos (ejecuta: npm run validate:content -- --warnings)`);
}
if (errors.length) {
  console.error("\n✘ Errores:");
  for (const e of errors) console.error("  • " + e);
  process.exit(1);
}
