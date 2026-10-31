import Link from "next/link";
import {
  Waves, Trees, Landmark, Leaf, Sparkles, Eye, Store, Utensils, Sandwich, Soup, Egg, Coffee, Ticket, Percent, Wine, Ship, Lightbulb, PiggyBank, Bus, Clock, Wallet, MapPin, Heart, Home, Search, Info, Tag, CircleDollarSign, Accessibility, CalendarCheck, Building2, Gift, Send, Images, Check, Navigation, ExternalLink, Camera, Sunrise, Sun, Umbrella, Binoculars, Music, Fish, Bike, Footprints, ShieldCheck, ArrowRight, Map as MapIcon, TreePalm,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/content/schemas";
import { COLOR } from "@/lib/colors";

export const ICONS: Record<string, LucideIcon> = {
  Waves, Trees, Landmark, Leaf, Sparkles, Eye, Store, Utensils, Sandwich, Soup, Egg, Coffee, Ticket, Percent, Wine, Ship, Lightbulb, PiggyBank, Bus, Clock, Wallet, MapPin, Heart, Home, Search, Info, Tag, CircleDollarSign, Accessibility, CalendarCheck, Building2, Gift, Send, Images, Check, Navigation, ExternalLink, Camera, Sunrise, Sun, Umbrella, Binoculars, Music, Fish, Bike, Footprints, ShieldCheck, ArrowRight, Map: MapIcon, Palmtree: TreePalm,
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

const HERO: Record<Category["color"], { bg: string; blob: string; bar: string; accent: string }> = {
  pink: { bg: "from-[#ffe1ec] via-[#fff0f5]", blob: "bg-sv-pink", bar: "bg-sv-pink", accent: "bg-sv-yellow" },
  yellow: { bg: "from-[#fff3b8] via-[#fffbe6]", blob: "bg-sv-yellow", bar: "bg-sv-yellow", accent: "bg-sv-pink" },
  teal: { bg: "from-[#c9f3f1] via-[#eafaf9]", blob: "bg-sv-teal", bar: "bg-sv-teal", accent: "bg-sv-yellow" },
  purple: { bg: "from-[#e6dafc] via-[#f5f0ff]", blob: "bg-sv-purple", bar: "bg-sv-purple", accent: "bg-sv-yellow" },
};

/** Título de página en dos líneas (negro + color de marca) con ilustración decorativa hecha en CSS. */
export function PageHero({ a, b, intro, color = "pink", icon, children }: { a: string; b: string; intro: string; color?: Category["color"]; icon?: string; children?: React.ReactNode }) {
  const h = HERO[color];
  return (
    <header className={`relative overflow-hidden bg-gradient-to-b ${h.bg} to-white`}>
      <span aria-hidden className={`absolute -right-16 -top-20 h-72 w-72 rounded-full opacity-20 ${h.blob}`} />
      <span aria-hidden className={`absolute -bottom-10 left-[38%] h-24 w-24 rounded-full opacity-30 ${h.accent}`} />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 pb-10 pt-8 sm:pt-12">
        <div className="min-w-0">
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
            <span className="block text-sv-black">{a}</span>
            <span className={`block -rotate-1 ${COLOR[color].text}`}>{b}</span>
          </h1>
          <span aria-hidden className={`mt-3 block h-1.5 w-28 -rotate-1 rounded-full ${h.bar}`} />
          <p className="mt-4 max-w-xl text-base text-neutral-800 sm:text-lg">{intro}</p>
          {children}
        </div>
        {icon && (
          <div aria-hidden className="relative hidden h-44 w-44 shrink-0 sm:block md:h-52 md:w-52">
            <span className={`absolute inset-4 -rotate-12 rounded-[2.5rem] ${h.accent}`} />
            <span className={`absolute inset-0 flex rotate-6 items-center justify-center rounded-[2.5rem] shadow-xl ${COLOR[color].bg}`}>
              <Icon name={icon} className="h-20 w-20 md:h-24 md:w-24" />
            </span>
            <span className="absolute -left-3 top-6 h-5 w-5 rounded-full bg-sv-black" />
            <span className={`absolute -right-2 bottom-8 h-4 w-4 rounded-full ${h.blob}`} />
          </div>
        )}
      </div>
      <svg aria-hidden viewBox="0 0 1440 30" preserveAspectRatio="none" className="block h-5 w-full text-white"><path fill="currentColor" d="M0 30V12c120 14 240 18 360 8s240-18 360-12 240 16 360 14 240-10 360-16v24z" /></svg>
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
