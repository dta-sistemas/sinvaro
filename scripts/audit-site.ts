/**
 * Auditoría de la web ya compilada y en ejecución.
 *   npm run build && npm start        (en otra terminal)
 *   npm run audit                     (BASE=http://localhost:3000 por defecto)
 * Revisa: páginas del sitemap (HTTP 200), enlaces internos, SEO (title, description, canonical,
 * hreflang, h1, lang, Open Graph, alt de imágenes), noindex donde corresponde y avisos de "por verificar".
 */
const BASE = (process.env.BASE ?? "http://localhost:3000").replace(/\/$/, "");
const problems: string[] = [];
const notes: string[] = [];
const bad = (url: string, msg: string) => problems.push(`${url}: ${msg}`);

const get = async (p: string) => {
  const res = await fetch(p.startsWith("http") ? p : BASE + p, { redirect: "manual" });
  return { status: res.status, text: await res.text() };
};
const attr = (html: string, re: RegExp) => html.match(re)?.[1];
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');

async function main() {
  const sm = await get("/sitemap.xml");
  if (sm.status !== 200) throw new Error(`sitemap.xml respondió ${sm.status}. ¿Está corriendo el servidor en ${BASE}?`);
  const sitemapUrls = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const extra = ["/buscar", "/buscar?q=playa", "/favoritos", "/privacidad", "/terminos", "/en/search", "/en/favorites", "/en/privacy", "/en/terms", "/robots.txt"];
  const pages = [...new Set([...sitemapUrls, ...extra])];

  const titles = new Map<string, string>();
  const descs = new Map<string, string>();
  const links = new Map<string, string>(); // enlace → página origen

  for (const p of pages) {
    const { status, text: html } = await get(p);
    if (status !== 200) { bad(p, `HTTP ${status}`); continue; }
    if (p === "/robots.txt") continue;
    const en = p === "/en" || p.startsWith("/en/");
    const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
    const title = attr(html, /<title>([^<]*)<\/title>/);
    const desc = attr(html, /<meta name="description" content="([^"]*)"/);
    const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
    const lang = attr(html, /<html lang="([^"]*)"/);

    if (!title) bad(p, "sin <title>");
    else if (title.length > 70) notes.push(`${p}: title largo (${title.length})`);
    if (!desc) bad(p, "sin meta description");
    else if (desc.length > 170) notes.push(`${p}: description larga (${desc.length})`);
    if (!canonical) bad(p, "sin canonical");
    if (!/<meta property="og:title"/.test(html)) bad(p, "sin Open Graph");
    if (!/<meta property="og:image"/.test(html)) bad(p, "sin og:image");
    if (lang !== (en ? "en" : "es-MX")) bad(p, `lang="${lang}" inesperado`);
    const h1s = (html.match(/<h1[ >]/g) ?? []).length;
    if (h1s !== 1) bad(p, `tiene ${h1s} <h1> (debe ser 1)`);
    if (!noindex) {
      if (!/<link rel="alternate" hrefLang="es"/i.test(html) || !/<link rel="alternate" hrefLang="en"/i.test(html)) bad(p, "faltan hreflang es/en");
      if (title) { const k = `${en ? "en" : "es"}|${title}`; const prev = titles.get(k); if (prev) bad(p, `title duplicado con ${prev}`); else titles.set(k, p); }
      if (desc) { const k = `${en ? "en" : "es"}|${desc}`; const prev = descs.get(k); if (prev) notes.push(`${p}: description repetida con ${prev}`); else descs.set(k, p); }
    }
    for (const img of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="[^"]+"/.test(img[0])) bad(p, "imagen sin alt");

    // Datos pendientes: la ficha debe avisar
    if (/^\/(en\/)?(lugares|places|restaurantes|eats)\//.test(p) && !/pendiente de verificación|pending verification/.test(html)) {
      bad(p, "ficha sin aviso de dato por verificar (¿ya está verificada en los datos?)");
    }
    for (const m of html.matchAll(/<a [^>]*href="(\/[^"#]*)[^"]*"/g)) {
      const href = decode(m[1]);
      if (!href.startsWith("//") && !href.startsWith("/_next") && !href.startsWith("/api")) links.set(href, p);
    }
  }

  const checked = new Set(pages.map((p) => p.split("?")[0]));
  for (const [href, from] of links) {
    if (checked.has(href)) continue;
    const { status } = await get(href);
    checked.add(href);
    if (status >= 400 || (status >= 300 && status < 400)) bad(`${href} (enlazado desde ${from})`, `HTTP ${status}`);
  }

  // Páginas que NO deben existir / deben redirigir
  const expect: [string, number][] = [["/es/gratis", 308], ["/en/gratis", 308], ["/no-existe", 404], ["/en/no-existe", 404], ["/lugares/no-existe", 404], ["/ofertas/no-existe", 404]];
  for (const [p, code] of expect) { const { status } = await get(p); if (status !== code) bad(p, `esperaba ${code} y respondió ${status}`); }

  console.log(`Páginas auditadas: ${pages.length} · enlaces internos únicos revisados: ${links.size}`);
  if (notes.length) { console.log(`\nNotas (${notes.length}):`); notes.forEach((n) => console.log("  • " + n)); }
  if (problems.length) { console.error(`\n✘ Problemas (${problems.length}):`); problems.forEach((n) => console.error("  • " + n)); process.exit(1); }
  console.log("\n✔ Sin problemas");
}

main().catch((e) => { console.error("✘", e instanceof Error ? e.message : e); process.exit(1); });
