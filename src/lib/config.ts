import site from "../../content/site.json";

/** Radio (m) para "lugares cerca de la ruta" y "rutas cerca del lugar". Editable en content/site.json. */
export const NEARBY_RADIUS_M: number = (site as { nearbyRadiusMeters?: number }).nearbyRadiusMeters ?? 500;
