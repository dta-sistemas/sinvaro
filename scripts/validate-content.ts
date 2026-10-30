import { loadAllContent } from "../src/lib/content/load";

try {
  const c = loadAllContent();
  const counts = Object.entries(c).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.length : Object.keys(v).length}`);
  console.log("✔ Contenido válido —", counts.join(", "));
} catch (e) {
  console.error("✘ Contenido inválido:\n", e instanceof Error ? e.message : e);
  process.exit(1);
}
