import Link from "next/link";
import {
  ArrowRight, Bus, Clock, Coffee, Egg, Eye, Heart, Home, Info, Landmark, Leaf, Lightbulb, MapPin, Map as MapIcon,
  PiggyBank, Percent, Search, Ship, Sandwich, Soup, Sparkles, Store, Ticket, Trees, Utensils, Wallet, Waves, Wine,
  TreePalm, type LucideIcon,
} from "lucide-react";
import type { Category } from "@/content/schemas";
import { COLOR } from "@/lib/colors";

const ICONS: Record<string, LucideIcon> = {
  Waves, Trees, Landmark, Leaf, Sparkles, Eye, Store, Utensils, Sandwich, Soup, Egg, Coffee, Ticket, Percent, Wine, Ship,
  Lightbulb, Map: MapIcon, PiggyBank, Bus, Clock, Wallet, Palmtree: TreePalm, MapPin, Heart, Home, Search, Info,
};

export function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const C = ICONS[name] ?? Sparkles;
  return <C aria-hidden className={className} />;
}

export function Badge({ color, children, className = "" }: { color: Category["color"]; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide ${COLOR[color].bg} ${className}`}>
      {children}
    </span>
  );
}

/** Título de página en dos líneas: negro + color (estilo marca). */
export function PageHero({ a, b, intro, color = "pink", children }: { a: string; b: string; intro: string; color?: Category["color"]; children?: React.ReactNode }) {
  return (
    <header className="bg-[linear-gradient(180deg,#fff5f8_0%,#fff_100%)]">
      <div className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:pt-12">
        <h1 className="font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
          <span className="block text-sv-black">{a}</span>
          <span className={`block -rotate-1 ${COLOR[color].text}`}>{b}</span>
        </h1>
        <span aria-hidden className={`mt-3 block h-1.5 w-28 rounded-full ${color === "yellow" ? "bg-sv-yellow" : color === "teal" ? "bg-sv-teal" : color === "purple" ? "bg-sv-purple" : "bg-sv-pink"}`} />
        <p className="mt-4 max-w-xl text-base text-neutral-700 sm:text-lg">{intro}</p>
        {children}
      </div>
    </header>
  );
}

export function SectionHeading({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">
        <span className="bg-[linear-gradient(transparent_62%,#FFD600_62%)] px-0.5">{title}</span>
      </h2>
      {href && linkLabel && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold uppercase hover:underline">
          {linkLabel} <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function ButtonLink({ href, children, variant = "yellow", className = "" }: {
  href: string; children: React.ReactNode; variant?: "yellow" | "black" | "pink" | "light"; className?: string;
}) {
  const styles = {
    yellow: "bg-sv-yellow text-sv-black hover:brightness-95",
    black: "bg-sv-black text-white hover:bg-neutral-800",
    pink: "bg-sv-pink text-white hover:brightness-95",
    light: "bg-white text-sv-black ring-1 ring-black/10 hover:bg-sv-gray",
  }[variant];
  return (
    <Link href={href} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold uppercase tracking-wide transition ${styles} ${className}`}>
      {children}
    </Link>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div role="status" className="rounded-2xl border-2 border-dashed border-black/15 bg-sv-gray px-6 py-12 text-center">
      <p className="font-display text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-neutral-700">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 pt-4 text-sm text-neutral-600">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {it.href ? <Link href={it.href} className="underline-offset-2 hover:underline">{it.label}</Link> : <span aria-current="page" className="font-semibold text-sv-black">{it.label}</span>}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn"; children: React.ReactNode }) {
  return (
    <p role="note" className={`flex gap-2 rounded-xl px-4 py-3 text-sm ${tone === "warn" ? "bg-sv-yellow/30" : "bg-sv-gray"}`}>
      <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
