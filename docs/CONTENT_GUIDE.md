# Guía editorial: agregar, modificar y retirar contenido

Todo el contenido está en `content/*.json`. **No hace falta tocar componentes, páginas ni CSS.** Cada texto visible lleva español e inglés: `{ "es": "...", "en": "..." }` (ambos son obligatorios).

## Flujo de trabajo (siempre igual)

1. Crea o edita el contenido (con el comando o a mano).
2. `npm run validate:content` — te dice el archivo, el elemento y el campo con error.
3. `npm run dev` y revisa la página en español y en `/en/`.
4. Commit y push (en Vercel se despliega solo).

Antes de lanzar o de un cambio grande: `npm run build && npm start` y, en otra terminal, `npm run audit` (ver [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)).

## Comandos rápidos

```bash
npm run content -- list                      # qué hay publicado, verificado y cuándo vencen las ofertas
npm run content -- new place playa-las-perlas   # crea un BORRADOR listo para completar
npm run content -- publish place playa-las-perlas
npm run content -- retire place playa-las-perlas
```

Tipos: `place` (lugares), `restaurant` (comer barato), `offer` (ofertas), `article` (blog). `new` crea el elemento con `status: "draft"` y textos `POR COMPLETAR`; un borrador **nunca** se muestra al público. `publish` se niega si quedan textos `POR COMPLETAR`.

## Agregar

1. `npm run content -- new <tipo> <slug>` (el slug va en minúsculas con guiones y será parte de la URL; no lo cambies después de publicar).
2. Abre el JSON indicado y completa los campos. Referencia completa en [CONTENT_MODEL.md](CONTENT_MODEL.md).
3. `npm run content -- publish <tipo> <slug>`.
4. `npm run validate:content`.

### Lugares (`places.json`)
- `categoryId`: una categoría con `kind: "place"` de `categories.json`.
- `access`: `free`, `paid`, `reservation` o `unknown`. Aparece en **Cosas gratis** si es `free`; en **Lugares secretos** si `isSecret: true`.
- `location.coordinates`: `{ "lat": 21.1, "lng": -86.8, "precision": "exact" | "approximate" }` o `null`. Con `null` el lugar no sale en el mapa. No publiques coordenadas privadas ni de propiedades sin acceso público.
- `hours` y `priceNote` son opcionales y **solo** se permiten si el lugar está verificado (ver más abajo).

### Restaurantes (`restaurants.json`)
- `categoryId` con `kind: "restaurant"`; `mealTypes`: `breakfast`, `lunch`, `dinner`.
- `priceBand`: `under50`, `under100`, `under150` o `unknown`. Es un filtro orientativo; usa `unknown` mientras no hayas comprobado precios. Los filtros de precio y de comida del día solo aparecen cuando al menos un restaurante los tiene.

### Ofertas (`offers.json`)
Una oferta **publicada** debe tener: `endsAt` (fecha de vencimiento, `AAAA-MM-DD`), `conditions` (al menos una, en es y en, mismo número), `business`, `benefit`. Opcionales: `startsAt`, `couponCode`, `redeemUrl` (sin URL no se muestra botón), `featured: true` (la destaca en el inicio).
- Vence al terminar el día de `endsAt` (hora de Cancún).
- Una oferta vencida **no** aparece como activa: sale de la lista principal (pasa a "Ofertas vencidas"), del inicio, de la búsqueda y del mapa, y su ficha muestra "Vencida" sin código de cupón. Se recalcula cada hora; no necesitas retirarla a mano, aunque conviene limpiar las viejas con `retire`.
- No inventes descuentos, códigos ni condiciones. Si no puedes comprobar una oferta, déjala en borrador.

### Artículos (`articles.json`)
`body` es una lista de párrafos; una línea que empieza con `## ` es un subtítulo. `publishedAt` ordena el blog. Los artículos relacionados se calculan solos (misma categoría o etiquetas).

## Modificar
Edita el JSON y cambia `updatedAt`. No cambies `id` ni `slug` de algo ya publicado (rompería enlaces guardados y favoritos de los visitantes). Si debes cambiar un slug, deja el elemento viejo en `archived` y crea el nuevo.

## Retirar
`npm run content -- retire <tipo> <slug>` pone `status: "archived"`: desaparece de listas, fichas, búsqueda, mapa y sitemap, pero queda en el archivo por si lo necesitas. Para borrarlo del todo, elimina el objeto del JSON.

## Verificación de datos (importante)
Cada elemento tiene `verification: { "status": "pending" | "verified", "lastVerified": "AAAA-MM-DD" | null }`.
- `pending`: la web lo muestra como **"Por verificar"** (etiqueta en la tarjeta y aviso en la ficha). Es lo correcto mientras no lo hayas comprobado tú.
- Cuando confirmes precio, acceso, horario y ubicación: cambia a `"verified"` y pon la fecha en `lastVerified`. Entonces el aviso desaparece y la ficha muestra la fecha de última verificación.
- La validación te impide publicar `hours` o `priceNote` en un elemento `pending`, y marcar `verified` sin fecha.

## Imágenes
1. Usa solo fotos propias o con licencia. Formato JPG/WebP, ~1600 px de ancho; se optimizan solas.
2. Guárdalas en `public/images/<tipo>/<slug>.jpg` (por ejemplo `public/images/places/playa-delfines.jpg`).
3. En el JSON: `"photos": [{ "src": "/images/places/playa-delfines.jpg", "alt": { "es": "Vista de ...", "en": "View of ..." }, "credit": "Foto: Nombre" }]`. La primera foto es la principal. El `alt` describe la imagen (obligatorio en es y en).
4. Para sustituir una foto, reemplaza el archivo o cambia `src`. Sin foto, la web muestra un recurso gráfico temporal.
5. Artículos: `featuredImage` (misma estructura). Inicio: `heroImage` en `content/site.json`. Logotipo: ver `src/components/Logo.tsx` (un solo archivo).
`npm run validate:content` falla si el archivo referenciado no existe.

## Categorías y etiquetas
- `categories.json`: `kind` indica dónde se usa (`place`, `restaurant`, `offer`, `article`); `color` (`pink|yellow|teal|purple`) e `icon` (nombre de un icono ya registrado en `src/components/ui.tsx`, p. ej. `Waves`, `Store`).
- Para agregar una categoría: nuevo objeto con `id` y `slug` únicos y nombre/descripcion en es y en; luego úsala en `categoryId`.
- Los filtros de cada página muestran **solo las categorías y opciones que tienen contenido**; una categoría vacía no aparece (los avisos de `--warnings` te la señalan).
- `tags.json`: etiquetas libres; se muestran en las fichas y se buscan en el buscador. Referéncialas por `id` en `tagIds`.

## SEO por elemento
Por defecto el título y la descripción salen de `title` y `summary`/`excerpt`. Para personalizarlos: `"seo": { "title": {es,en}, "description": {es,en} }` (título ≲ 60 caracteres, descripción ≲ 155). La imagen para compartir sale de la primera foto; si no hay, se usa una imagen genérica de marca.

## Errores frecuentes
| Mensaje | Causa |
|---|---|
| `slug duplicado` / `id duplicado` | Dos elementos del mismo archivo comparten identificador |
| `categoría "x" no existe para "place"` | `categoryId` mal escrito o de otro tipo |
| `una oferta publicada necesita fecha de vencimiento` | Falta `endsAt` |
| `no publiques horarios ni precios sin verificar` | `hours`/`priceNote` en un elemento `pending` |
| `la imagen "..." no existe en /public` | Ruta mal escrita o archivo sin subir |
| `Contenido inválido en places.json … [3.title.en]` | Texto vacío o faltante en inglés en el 4.º lugar |
