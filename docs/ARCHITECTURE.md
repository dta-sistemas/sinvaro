# Arquitectura (Fase 1)

```
content/*.json ──► src/lib/content/load.ts (Zod + integridad referencial)
                       │
                       ▼
         src/lib/repositories/local.ts  ◄── implementa ──  src/lib/repositories/types.ts
                       │                                    (interfaces async)
                       ▼
         src/lib/repositories/index.ts  getContent()   ← único punto que elige la fuente
                       │
                       ▼
         src/lib/cards.ts  (CardItem: serializable y ya localizado)
                       │
                       ▼
         páginas (src/app/[locale]) y componentes
```

## Decisiones

- **Repositorios asíncronos.** Las páginas nunca importan JSON. Para la Fase 4 se agrega un `createHttpRepository()` que cumpla las mismas interfaces y `getContent()` lo elige por variable de entorno; páginas y componentes no cambian.
- **`CardItem` como contrato visual.** Tarjetas, filtros, mapa y favoritos solo conocen `CardItem` (no el esquema de BD). Los filtros viven en `CardItem.filters` y los grupos de filtro se declaran en cada página.
- **Reglas de negocio en un solo lugar.** Vigencia de ofertas: `src/lib/offers.ts`. Publicación: los repositorios solo devuelven `status: "published"`.
- **i18n por segmento `[locale]`** con middleware: español sin prefijo, inglés con `/en`. Segmentos de URL traducidos (`/en/free`). Hreflang y canonical por página en `src/lib/site.ts`.
- **Favoritos** detrás de `FavoritesStore` (hoy `localStorage`, clave `sinvaro:favorites:v1`, valores `tipo:id`). Migrar a cuentas = otra implementación de la interfaz.
- **Mapa** con Leaflet cargado solo en el cliente y teselas de OpenStreetMap (con atribución). Marcadores `divIcon` (sin imágenes por defecto).
- **Resend** desde rutas de servidor (`src/app/api/*`): validación Zod, honeypot, límite en memoria por IP, comprobación de origen. La clave nunca llega al navegador.
- **Fuentes** autoalojadas con `@fontsource` (Luckiest Guy, Bangers e Inter; licencia OFL): sin peticiones a Google en tiempo de ejecución.
- **Páginas estáticas** (SSG) salvo `/buscar` (usa el repositorio en el servidor por petición) y `/api/*`. Las páginas con ofertas revalidan cada hora.

## Límites conocidos de la Fase 1

- El límite de peticiones es en memoria (por instancia); en serverless es solo una barrera básica.
- Los diccionarios completos se envían al cliente en algunos componentes interactivos; es optimizable.
- Los textos legales son un borrador.
