# Guía: rutas de autobús (sección «Cómo llegar»)

Alcance inicial: **Cancún, Zona Hotelera y Playa del Carmen**, solo **autobuses**. Cada ruta muestra recorrido en el mapa, paradas aproximadas, tarifa (cuando esté verificada) y los lugares de Sin Varo que quedan a **500 m o menos** del recorrido. La sección aparece en el menú, el pie de página y el inicio **solo cuando hay al menos una ruta publicada**.

## 1. Trazar la ruta (herramienta gratuita)

1. Abre [geojson.io](https://geojson.io) (o uMap) y busca la ruta en el mapa.
2. **Recorrido:** dibuja una línea (Draw a polyline) siguiendo las calles por donde pasa el autobús, con puntos suficientes en cada curva. Si la ruta tiene ida y vuelta distintas, dibuja **una línea por sentido** y ponle nombre en la propiedad `name` (por ejemplo `Ida` y `Vuelta`).
3. **Paradas:** agrega un marcador (punto) por parada y ponle `name` (por ejemplo `Plaza Las Américas`). Van en el orden en que las recorre el autobús. Son **aproximadas**: no hace falta precisión de metros.
4. (Opcional) En la línea, la propiedad `stroke` con un color `#RRGGBB` se usa como color de la ruta.
5. Exporta: **Save → GeoJSON**.

## 2. Importar

```bash
npm run routes:import -- ruta.geojson r-1 --code R-1 --zone cancun --name "Centro – Zona Hotelera"
```
- `r-1` es el slug (parte de la URL, no lo cambies después de publicar).
- `--zone`: `cancun`, `zona-hotelera` o `playa-del-carmen` (son categorías en `content/categories.json`).
- Crea un **borrador** en `content/routes.json`. Si el slug ya existe, reemplaza solo recorridos y paradas (así puedes corregir el trazado y volver a importar).
- Detecta errores: coordenadas fuera de Quintana Roo (latitud/longitud invertidas), paradas a más de 1 km del recorrido, recorridos sin al menos 2 puntos.

## 3. Completar y publicar

En `content/routes.json` completa (español **e** inglés): `code`, `name`, `summary`; opcional `operator`. Luego:

```bash
npm run content -- publish route r-1
npm run validate:content
npm run dev        # revisa /como-llegar y /en/getting-around
```

### Tarifa
`"fare": { "amountMxn": 12, "note": { "es": "...", "en": "..." } }` (número en MXN; `0` = gratis; `note` opcional, por ejemplo «pago en efectivo»).
**Solo se permite una tarifa si la ruta está verificada** (`verification.status: "verified"` y `lastVerified: "AAAA-MM-DD"`). Con `"amountMxn": null` la web muestra «Tarifa por confirmar». No pongas una tarifa que no hayas comprobado.

### Verificación
Mientras `verification.status` sea `pending`, la web muestra «Por verificar». Verifica recorrido y paradas (subiéndote a la ruta o con el operador) antes de marcarla `verified`.

## Lugares cercanos
Se calculan solos: todo lugar, restaurante u oferta vigente **con coordenadas** a 500 m o menos del recorrido aparece en el mapa de la ruta (con su pin y distancia) y en la lista inferior. Al revés, la ficha de cada lugar muestra «Cómo llegar en autobús» con las rutas que pasan cerca. El radio se cambia en `content/site.json` (`nearbyRadiusMeters`).
Las coordenadas de varios lugares son **aproximadas** (se indica en el mapa); mejorar esas coordenadas mejora estos resultados.

## Retirar / modificar
- Retirar: `npm run content -- retire route r-1` (desaparece de todo).
- Modificar datos: edita el JSON y cambia `updatedAt`. Corregir el trazado: vuelve a importar el GeoJSON con el mismo slug.
- Ver el estado de todas: `npm run content -- list`.

## Contenido de ejemplo
`SINVARO_SAMPLE_CONTENT=1 npm run dev` agrega una ruta ficticia `[EJEMPLO]` (EJ-1) para ver la sección sin tener datos. No entra al sitemap ni se indexa. **Nunca** se publica sin esa variable.
