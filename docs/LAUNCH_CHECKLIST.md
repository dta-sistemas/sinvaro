# Lista de comprobación para publicar

Marca cada punto. Los marcados 🤖 los comprueba `npm run audit` / `npm test` / `npm run build`; los demás son decisiones o verificaciones tuyas.

## 1. Contenido (lo que debes hacer tú)
- [ ] Verificar cada lugar y restaurante (precio/acceso, ubicación, horario) y marcarlos `verified` con `lastVerified`. Lo no verificado se publica con la etiqueta "Por verificar".
- [ ] Revisar las coordenadas del mapa (hoy son **aproximadas**, puestas sin verificar en terreno).
- [ ] Decidir qué hacer con lo que sigue sin verificar: lanzar con la etiqueta o dejarlo en borrador.
- [ ] Rutas de autobús: trazar con geojson.io, importar (`docs/ROUTES_GUIDE.md`), verificar recorrido, paradas y tarifa en campo. La sección «Cómo llegar» se oculta sola si no hay rutas publicadas.
- [ ] Cargar ofertas reales (con vigencia y condiciones) o lanzar con la sección vacía ("No hay ofertas vigentes por ahora").
- [ ] Fotos con licencia para lugares, restaurantes y artículos; imagen del hero (`site.json`); logotipo definitivo (`Logo.tsx`).
- [ ] Revisar y ajustar los 3 artículos y las traducciones al inglés.
- [ ] Revisión legal de Privacidad y Términos (hoy son un borrador marcado como tal; quitar el aviso al aprobarlos en `content/legal.json` y `LegalPage`).
- [ ] Redes sociales reales en `content/site.json` (`socials`); si no hay, no se muestran.

## 2. Configuración
- [ ] `NEXT_PUBLIC_SITE_URL` con el dominio final (canonical, sitemap, Open Graph).
- [ ] Resend: dominio verificado, `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO_EMAIL` (y opcional `RESEND_SEGMENT_NEWSLETTER`) en el hosting.
- [ ] Probar en producción: suscribirse al newsletter (aparece el contacto en Resend) y enviar el formulario de contacto (llega el correo). **No se han probado con claves reales.**
- [ ] `SINVARO_SAMPLE_CONTENT` ausente o en `0` en producción.
- [ ] Ninguna clave en el repositorio (`.env*` está ignorado).

## 3. Comprobaciones automáticas
- [ ] 🤖 `npm run validate:content` sin errores (revisa los avisos con `-- --warnings`).
- [ ] 🤖 `npm run typecheck` y `npm test` en verde.
- [ ] 🤖 `npm run build` sin errores.
- [ ] 🤖 `npm start` + `npm run audit`: todas las páginas 200, sin enlaces internos rotos, un solo `h1`, `title`/`description`/canonical/hreflang/Open Graph en cada página, imágenes con `alt`, fichas pendientes con su aviso, 404 correctos, redirecciones `/es/...` → `/...`.

## 4. Revisión manual en navegador (no automatizada)
- [ ] Móvil, tableta y escritorio: inicio, categorías, fichas, blog, mapa, favoritos, contacto.
- [ ] Menú móvil y barra inferior; navegación con teclado (Tab, foco visible, enlace "Saltar al contenido").
- [ ] Filtros en cada categoría: barra lateral fija en escritorio, botón "Filtros" (hoja inferior) en móvil, búsqueda dentro de la lista, "Ver más", "Limpiar filtros" y enlaces con `?category=`. (La lógica está cubierta por pruebas automáticas; falta verla en navegador real.)
- [ ] Favoritos: guardar un lugar y una oferta, recargar, verlos en Guardados, quitarlos.
- [ ] Cómo llegar: abrir una ruta, cambiar de sentido (ida/vuelta), activar/desactivar «lugares cerca», abrir un pin y su ficha; y desde la ficha de un lugar, abrir una ruta cercana.
- [ ] Mapa: cargan las teselas de OpenStreetMap, los marcadores abren su ficha y el filtro por tipo funciona.
- [ ] Selector de idioma ES ⇄ EN en varias páginas (conserva la página).
- [ ] Búsqueda: con y sin resultados, con acentos ("cancun" encuentra "Cancún").
- [ ] Compartir un enlace (WhatsApp/Facebook) y revisar la vista previa.

## 4b. Ya verificado en un navegador (Chromium) durante el desarrollo
- Fichas de lugar, restaurante y oferta en escritorio y móvil; galería y visor (flechas y Esc); pestañas y resaltado al hacer scroll; ruta con mapa, sentidos y lugares cercanos.
- Sin desbordes horizontales en 14 páginas y anchos de 360 a 1440 px. Lo que **no** se pudo ver: las teselas reales del mapa (el entorno bloquea OpenStreetMap) ni fotos reales.

## 5. SEO tras publicar
- [ ] `/sitemap.xml` y `/robots.txt` accesibles en el dominio final.
- [ ] Dar de alta el sitio y el sitemap en Google Search Console.
- [ ] Lighthouse móvil (rendimiento, accesibilidad, SEO) en inicio y una ficha; con fotos reales se ajustan tamaños si hace falta.
- [ ] Confirmar que `/buscar`, `/favoritos`, `/privacidad` y `/terminos` tienen `noindex` (así está configurado).

## 6. Operación
- [ ] Saber cómo agregar/retirar contenido ([CONTENT_GUIDE.md](CONTENT_GUIDE.md)).
- [ ] Definir quién retira las ofertas vencidas y con qué frecuencia (la web ya no las muestra como activas, pero conviene limpiar).
- [ ] Copia del repositorio (GitHub) y del dominio/DNS anotados.
