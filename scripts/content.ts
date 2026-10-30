/**
 * Utilidad editorial para los datos locales.
 *   npm run content -- list
 *   npm run content -- new <place|restaurant|offer|article> <slug>
 *   npm run content -- publish <tipo> <slug>
 *   npm run content -- retire <tipo> <slug>
 */
import fs from "node:fs";
import path from "node:path";

const FILES = {
  place: { file: "places.json", prefix: "place", kind: "place" },
  restaurant: { file: "restaurants.json", prefix: "rest", kind: "restaurant" },
  offer: { file: "offers.json", prefix: "offer", kind: "offer" },
  article: { file: "articles.json", prefix: "art", kind: "article" },
} as const;
type Type = keyof typeof FILES;

const dir = path.join(process.cwd(), "content");
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Record<string, any>[];
const write = (f: string, data: unknown) => fs.writeFileSync(path.join(dir, f), JSON.stringify(data, null, 2) + "\n");
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Cancun" });
const TODO = "POR COMPLETAR";
const t = (s = TODO) => ({ es: s, en: s });
const fail = (m: string): never => { console.error("✘ " + m); process.exit(1); };

function template(type: Type, slug: string, categoryId: string) {
  const base = {
    id: `${FILES[type].prefix}-${slug}`, slug, status: "draft", createdAt: today(), updatedAt: today(),
    verification: { status: "pending", lastVerified: null }, photos: [], categoryId, tagIds: [],
  };
  const location = { area: t(), coordinates: null };
  switch (type) {
    case "place":
      return { ...base, title: t(), summary: t(), description: t(), location, access: "unknown", isSecret: false, tips: { es: [], en: [] } };
    case "restaurant":
      return { ...base, title: t(), summary: t(), description: t(), location, mealTypes: [], priceBand: "unknown", tips: { es: [], en: [] } };
    case "offer":
      return { ...base, title: t(), business: TODO, benefit: t(), summary: t(), conditions: { es: [TODO], en: [TODO] }, startsAt: null, endsAt: null, location, couponCode: null, redeemUrl: null, featured: false, isSample: false };
    case "article":
      return { ...base, title: t(), excerpt: t(), body: { es: [TODO], en: [TODO] }, author: "Equipo Sin Varo", publishedAt: today() };
  }
}

const [cmd, typeArg, slug] = process.argv.slice(2);
const needType = (): Type => (typeArg && typeArg in FILES ? (typeArg as Type) : fail(`Tipo inválido. Usa: ${Object.keys(FILES).join(", ")}`));

if (cmd === "list") {
  for (const type of Object.keys(FILES) as Type[]) {
    console.log(`\n${type.toUpperCase()}`);
    for (const it of read(FILES[type].file)) {
      const extra = type === "offer" ? ` vence:${it.endsAt ?? "-"}` : "";
      console.log(`  ${it.status.padEnd(9)} ${it.verification.status.padEnd(8)} ${it.slug}${extra}`);
    }
  }
} else if (cmd === "new") {
  const type = needType();
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail("Indica un slug en minúsculas con guiones, p. ej. playa-las-perlas");
  const { file, kind } = FILES[type];
  const list = read(file);
  if (list.some((i) => i.slug === slug)) fail(`Ya existe "${slug}" en ${file}`);
  const cat = read("categories.json").find((c) => c.kind === kind);
  list.push(template(type, slug, cat!.id));
  write(file, list);
  console.log(`✔ Creado borrador en content/${file} (status: draft, no se publica). Completa los textos "${TODO}" y luego: npm run content -- publish ${type} ${slug}`);
} else if (cmd === "publish" || cmd === "retire") {
  const type = needType();
  const { file } = FILES[type];
  const list = read(file);
  const item = list.find((i) => i.slug === slug) ?? fail(`No existe "${slug}" en ${file}`);
  if (cmd === "publish" && JSON.stringify(item).includes(TODO)) fail(`"${slug}" aún tiene textos "${TODO}". Complétalos antes de publicar.`);
  item.status = cmd === "publish" ? "published" : "archived";
  item.updatedAt = today();
  write(file, list);
  console.log(`✔ ${slug}: ${item.status}. Ejecuta npm run validate:content`);
} else {
  fail("Comandos: list | new <tipo> <slug> | publish <tipo> <slug> | retire <tipo> <slug>");
}
