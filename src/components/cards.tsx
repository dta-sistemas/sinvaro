"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import type { CardItem } from "@/lib/cards";
import type { Dict } from "@/i18n/dictionaries";
import { COLOR } from "@/lib/colors";
import { useFavorites } from "@/hooks/useFavorites";
import { Badge, Icon } from "./ui";

export function FavoriteButton({ item, labels, className = "" }: { item: Pick<CardItem, "key" | "title">; labels: Dict["labels"]; className?: string }) {
  const { has, toggle } = useFavorites();
  const saved = has(item.key);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`${saved ? labels.unsave : labels.save}: ${item.title}`}
      onClick={() => toggle(item.key)}
      className={`relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow ring-1 ring-black/10 transition hover:scale-105 ${className}`}
    >
      <Heart aria-hidden className={`h-5 w-5 ${saved ? "fill-sv-pink text-sv-pink" : "text-sv-black"}`} />
    </button>
  );
}

/** Foto real si existe; si no, un recurso visual de marca claramente temporal. */
export function CardImage({ item, labels, sizes, showLabel = false }: { item: CardItem; labels: Dict["labels"]; sizes: string; showLabel?: boolean }) {
  if (item.photo) {
    return <Image src={item.photo.src} alt={item.photo.alt} fill sizes={sizes} className="object-cover" />;
  }
  const c = COLOR[item.color];
  return (
    <div role="img" aria-label={item.title} className={`flex h-full w-full items-center justify-center ${c.soft} bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.8),transparent_60%)]`}>
      <Icon name={item.icon} className={`h-1/3 w-1/3 max-h-16 max-w-16 opacity-70 ${c.text}`} />
      {showLabel && <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[0.65rem] text-white">{labels.photoPlaceholder}</span>}
    </div>
  );
}

export function OfferStatusChip({ item, labels }: { item: CardItem; labels: Dict["labels"] }) {
  if (!item.offerStatus) return null;
  const map = {
    active: { t: labels.statusActive, c: "bg-emerald-100 text-emerald-900" },
    upcoming: { t: labels.statusUpcoming, c: "bg-sky-100 text-sky-900" },
    expired: { t: labels.statusExpired, c: "bg-neutral-200 text-neutral-700" },
  }[item.offerStatus];
  return <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${map.c}`}>{map.t}</span>;
}

/** Tarjeta reutilizable para lugares, comida, ofertas y artículos. El enlace cubre toda la tarjeta. */
export function ItemCard({ item, labels, variant = "grid" }: { item: CardItem; labels: Dict["labels"]; variant?: "grid" | "row" }) {
  const expired = item.offerStatus === "expired";
  const row = variant === "row";
  return (
    <article className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/10 transition hover:shadow-md ${row ? "flex" : "flex flex-col"} ${expired ? "opacity-70" : ""}`}>
      <div className={`relative shrink-0 overflow-hidden ${row ? "w-28 sm:w-40" : "aspect-[4/3] w-full"}`}>
        <CardImage item={item} labels={labels} sizes={row ? "160px" : "(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"} />
        {item.badge && !row && <Badge color={item.badge.color} className="absolute left-3 top-3">{item.badge.label}</Badge>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.badge && row && <Badge color={item.badge.color}>{item.badge.label}</Badge>}
          <OfferStatusChip item={item} labels={labels} />
          {item.pending && <span className="rounded-full bg-sv-gray px-2 py-0.5 text-[0.7rem] font-semibold text-neutral-700">{labels.pending}</span>}
        </div>
        <h3 className="pr-10 text-base font-extrabold leading-snug">
          <Link href={item.href} className="after:absolute after:inset-0 focus-visible:outline-none">{item.title}</Link>
        </h3>
        <p className="line-clamp-2 text-sm text-neutral-700">{item.summary}</p>
        {(item.area || item.type === "article") && (
          <p className="mt-auto flex items-center gap-1 pt-1 text-xs text-neutral-600">
            {item.area ? (<><MapPin aria-hidden className="h-3.5 w-3.5" />{item.area}</>) : item.date}
          </p>
        )}
      </div>
      {item.type !== "article" && <FavoriteButton item={item} labels={labels} className="absolute right-3 top-3" />}
    </article>
  );
}
