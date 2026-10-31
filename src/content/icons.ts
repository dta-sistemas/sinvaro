/** Iconos disponibles para categorías, tips y actividades (nombre exacto de lucide-react registrado en components/ui.tsx). */
export const ICON_NAMES = [
  "Waves", "Trees", "Landmark", "Leaf", "Sparkles", "Eye", "Store", "Utensils", "Sandwich", "Soup", "Egg", "Coffee", "Ticket",
  "Percent", "Wine", "Ship", "Lightbulb", "Map", "PiggyBank", "Bus", "Clock", "Wallet", "Palmtree", "MapPin", "Heart", "Home", "Search", "Info",
  "Tag", "CircleDollarSign", "Accessibility", "CalendarCheck", "Building2", "Gift", "Send", "Images", "Check", "Navigation", "ExternalLink",
  "Camera", "Sunrise", "Sun", "Umbrella", "Binoculars", "Music", "Fish", "Bike", "Footprints", "ShieldCheck", "ArrowRight",
] as const;
export type IconName = (typeof ICON_NAMES)[number];
