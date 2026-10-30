import type { Category } from "@/content/schemas";

type Color = Category["color"];

/** Clases completas (Tailwind necesita verlas escritas) por color de categoría. */
export const COLOR: Record<Color, { bg: string; text: string; soft: string; ring: string; hex: string }> = {
  yellow: { bg: "bg-sv-yellow text-sv-black", text: "text-sv-black", soft: "bg-sv-yellow/20", ring: "ring-sv-yellow", hex: "#FFD600" },
  pink: { bg: "bg-sv-pink text-white", text: "text-sv-pink", soft: "bg-sv-pink/10", ring: "ring-sv-pink", hex: "#FF2D78" },
  teal: { bg: "bg-sv-teal text-sv-black", text: "text-[#0b7f7b]", soft: "bg-sv-teal/15", ring: "ring-sv-teal", hex: "#16B8B3" },
  purple: { bg: "bg-sv-purple text-white", text: "text-sv-purple", soft: "bg-sv-purple/10", ring: "ring-sv-purple", hex: "#8547E8" },
};
