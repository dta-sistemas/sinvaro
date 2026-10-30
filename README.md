# Sin Varo Cancún

Guía local de planes gratis, comida barata y ofertas en Cancún. *Sin varo, pero con plan.*

**Estado:** Fase 1 (frontend público con contenido local). Sin backend ni panel admin todavía — ver [docs/ROADMAP.md](docs/ROADMAP.md).

Stack: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Zod · Leaflet + OpenStreetMap · Resend.

## Ejecutar localmente

Requisitos: Node.js 20 o superior.

```bash
npm install
cp .env.example .env.local     # opcional para empezar; ver "Variables de entorno"
npm run dev                    # http://localhost:3000
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Valida el contenido y compila para producción |
| `npm start` | Sirve la compilación (`npm run build` primero) |
| `npm run validate:content` | Valida los JSON de `content/` (`-- --warnings` muestra avisos) |
| `npm run content -- <cmd>` | Crea/publica/retira contenido (ver la guía editorial) |
| `npm run audit` | Audita la web en ejecución: enlaces, SEO, avisos de verificación |
| `npm run typecheck` | TypeScript sin emitir |
| `npm test` | Pruebas unitarias (Vitest) |

## Idiomas y rutas

Español en la raíz (`/gratis`), inglés bajo `/en/` (`/en/free`). Los textos de interfaz están en `src/i18n/dictionaries.ts`; los segmentos de URL en `src/i18n/routes.ts`. `src/middleware.ts` reescribe `/en/free` → carpeta interna `gratis` y redirige `/es/...` a `/...`. El selector de idioma conserva la página actual.

## Cómo editar el contenido (sin tocar componentes)

> Guía paso a paso: **[docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md)** · Antes de publicar: **[docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md)**

Todo el contenido vive en `content/*.json`. Cada texto visible es bilingüe: `{ "es": "...", "en": "..." }`.

| Archivo | Contenido |
|---|---|
| `places.json` | Lugares (gratis y secretos). `isSecret: true` los muestra en *Lugares secretos* |
| `restaurants.json` | Comer barato |
| `offers.json` / `coupons.json` | Ofertas y cupones (hoy vacíos a propósito) |
| `articles.json` | Blog |
| `categories.json`, `tags.json` | Categorías y etiquetas (`kind`: place, restaurant, offer, article) |
| `tips.json` | Tips del inicio |
| `legal.json` | Privacidad y términos (borrador pendiente de revisión legal) |
| `site.json` | Redes sociales (`socials`) e imagen del hero (`heroImage`) |

Procedimiento: edita el JSON → `npm run validate:content` (reporta el campo exacto con error, slugs/ids duplicados, categorías inexistentes, fechas inválidas) → `npm run dev` para revisar → commit.

**Agregar un lugar:** copia un objeto de `places.json`, cambia `id` y `slug` (únicos, en minúsculas con guiones), textos es/en, `categoryId` y `location`.

**Fotos:** guarda el archivo en `public/images/...` y agrégalo al item: `"photos": [{ "src": "/images/places/playa-delfines.jpg", "alt": { "es": "...", "en": "..." } }]`. Sin foto se muestra un recurso gráfico temporal. Usa solo fotos propias o con licencia. Para el hero: `"heroImage": { "src": "/images/hero.jpg", "alt": { "es": "...", "en": "..." } }` en `site.json`.

**Honestidad de datos:** `verification.status: "pending"` hace que la web muestre "Por verificar". Cuando confirmes un dato, cambia a `"verified"` y pon `lastVerified`. No agregues precios, horarios u ofertas sin comprobarlos; `hours` y `priceNote` son opcionales. Las coordenadas con `"precision": "approximate"` se muestran como ubicación aproximada.

**Ofertas:** `endsAt` (YYYY-MM-DD) vence al terminar ese día en hora de Cancún. Las vencidas salen de la lista principal, de la búsqueda y del inicio, y la ficha muestra "Vencida". La vigencia se recalcula cada hora (`revalidate = 3600`) en un servidor Node (Vercel o `npm start`).

**Contenido de ejemplo (solo desarrollo):** `SINVARO_SAMPLE_CONTENT=1 npm run dev` agrega dos ofertas marcadas `[EJEMPLO]` (una activa y una vencida) desde `content/samples/` para probar la vigencia. No se incluyen en el sitemap ni se indexan.

## Variables de entorno

Ver `.env.example`. Nunca subas `.env*` al repositorio.

- `NEXT_PUBLIC_SITE_URL`: URL pública (canonical, sitemap, Open Graph).
- **Newsletter** (`POST /api/newsletter`): requiere `RESEND_API_KEY`. Crea el contacto en Resend; `RESEND_SEGMENT_NEWSLETTER` es opcional.
- **Contacto** (`POST /api/contact`): requiere `RESEND_API_KEY`, `RESEND_FROM` (remitente con dominio verificado en Resend) y `CONTACT_TO_EMAIL`.

Sin esas variables los formularios responden "aún no disponible" y **no guardan ni envían nada**.

## Estructura

```
content/            Datos editables (JSON)
src/content/        Esquemas Zod de cada tipo de contenido
src/lib/repositories/  Capa de acceso a contenido (interfaces + implementación local)
src/lib/cards.ts    Convierte contenido → tarjetas localizadas (lo único que ven los componentes)
src/app/[locale]/   Páginas
src/components/     UI reutilizable
src/i18n/           Diccionarios y rutas
tests/              Vitest
docs/               Arquitectura, roadmap y modelo de contenido
```

## Despliegue

Pensado para Vercel o cualquier host compatible con Next.js (necesita Node para el middleware, las rutas `/api` y la búsqueda). `npm run build` valida el contenido antes de compilar. Configura las variables de entorno en el panel del proveedor. Detalle de despliegue completo: Fase 4+ (ver roadmap).
