import type { Category } from "@/content/schemas";

type Color = Category["color"];

/** Clases completas (Tailwind necesita verlas escritas) por color de categoría. */
export const COLOR: Record<Color, { bg: string; text: string; soft: string; ring: string; hex: string }> = {
  yellow: { bg: "bg-sv-yellow text-sv-black", text: "text-sv-black", soft: "bg-sv-yellow/20", ring: "ring-sv-yellow", hex: "#FFD600" },
  pink: { bg: "bg-sv-pink text-white", text: "text-sv-pink", soft: "bg-sv-pink/10", ring: "ring-sv-pink", hex: "#FF2D78" },
  teal: { bg: "bg-sv-teal text-sv-black", text: "text-[#0b7f7b]", soft: "bg-sv-teal/15", ring: "ring-sv-teal", hex: "#16B8B3" },
  purple: { bg: "bg-sv-purple text-white", text: "text-sv-purple", soft: "bg-sv-purple/10", ring: "ring-sv-purple", hex: "#8547E8" },
};

/** Texto blanco o negro según el fondo (#RRGGBB), para que el código de ruta sea legible. */
export function readableOn(hex: string): "#111111" | "#ffffff" {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#111111" : "#ffffff";
}
