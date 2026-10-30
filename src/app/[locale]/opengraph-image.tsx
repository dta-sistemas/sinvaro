import { ImageResponse } from "next/og";
import { LOCALES } from "@/content/schemas";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/lib/locale";

export const alt = "Sin Varo Cancún";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

/** Imagen Open Graph por defecto generada con código (sin archivos). Se sustituye añadiendo un opengraph-image.png. */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const d = getDictionary(await getLocale(params));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#FFD600", color: "#111" }}>
        <div style={{ display: "flex", fontSize: 150, fontWeight: 900, lineHeight: 1, letterSpacing: -4 }}>SIN VARO</div>
        <div style={{ display: "flex", marginTop: 8, fontSize: 64, fontWeight: 800, color: "#FF2D78" }}>CANCÚN</div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 40, fontWeight: 600 }}>{d.site.tagline}</div>
      </div>
    ),
    size,
  );
}
