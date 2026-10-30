import type { ReactNode } from "react";
import { Info, MapPin } from "lucide-react";
import type { Locale } from "@/content/schemas";
import type { CardItem } from "@/lib/cards";
import type { Dict } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import { Badge, Breadcrumbs, ButtonLink, Notice, SectionHeading } from "./ui";
import { CardImage, FavoriteButton, ItemCard, OfferStatusChip } from "./cards";

export interface DetailProps {
  locale: Locale;
  dict: Dict;
  card: CardItem;
  crumbs: { label: string; href?: string }[];
  description: string;
  rows: { label: string; value: ReactNode }[];
  sections?: { title: string; text?: string; items?: string[] }[];
  banner?: ReactNode;
  extra?: ReactNode;
  related: CardItem[];
  verification: { status: "verified" | "pending"; lastVerified: string | null } | null;
  osmLink: string | null;
}

/** Plantilla común de ficha (lugar, restaurante, oferta). */
export function DetailLayout(p: DetailProps) {
  const { dict, card, locale } = p;
  const L = dict.labels;
  return (
    <>
      <Breadcrumbs items={p.crumbs} />
      <article className="mx-auto grid max-w-6xl gap-8 px-4 py-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-black/10">
            <CardImage item={card} labels={L} sizes="(min-width:1024px) 60vw, 100vw" showLabel />
            {card.badge && <Badge color={card.badge.color} className="absolute left-4 top-4">{card.badge.label}</Badge>}
          </div>
          <div className="mt-5 flex items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2"><OfferStatusChip item={card} labels={L} /><span className="text-sm font-semibold text-neutral-600">{card.categoryName}</span></div>
              <h1 className="font-display text-4xl leading-tight sm:text-5xl">{card.title}</h1>
            </div>
            <FavoriteButton item={card} labels={L} className="shrink-0" />
          </div>
          <div className="mt-4 grid gap-3">
            {p.banner}
            {p.verification?.status === "pending" && <Notice tone="warn">{L.pendingNotice}</Notice>}
          </div>
          <p className="mt-5 text-lg leading-relaxed text-neutral-800">{p.description}</p>
          {p.sections?.map((s) => (
            <section key={s.title} className="mt-8">
              <h2 className="mb-2 font-display text-2xl">{s.title}</h2>
              {s.text && <p className="leading-relaxed text-neutral-800">{s.text}</p>}
              {s.items && (<ul className="list-disc space-y-1.5 pl-5 text-neutral-800">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>)}
            </section>
          ))}
          {p.extra}
        </div>
        <aside className="h-fit rounded-2xl bg-sv-gray p-5 lg:sticky lg:top-24">
          <h2 className="sr-only">{L.details}</h2>
          <dl className="grid gap-4 text-sm">
            {p.rows.map((r) => (
              <div key={r.label}><dt className="text-xs font-extrabold uppercase tracking-widest text-neutral-600">{r.label}</dt><dd className="mt-0.5 font-medium">{r.value}</dd></div>
            ))}
            {p.verification && (
              <div><dt className="text-xs font-extrabold uppercase tracking-widest text-neutral-600">{L.lastVerified}</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 font-medium"><Info aria-hidden className="h-4 w-4" />{p.verification.lastVerified ?? L.neverVerified}</dd></div>
            )}
          </dl>
          <div className="mt-5 grid gap-2">
            {card.coords && <ButtonLink href={href(locale, "mapa")} variant="yellow"><MapPin aria-hidden className="h-4 w-4" />{L.seeOnMap}</ButtonLink>}
            {p.osmLink && (
              <a href={p.osmLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-extrabold uppercase ring-1 ring-black/10 hover:bg-sv-gray">{L.openOsm}</a>
            )}
          </div>
          {card.coords?.approx && <p className="mt-3 text-xs text-neutral-600">{L.approx}</p>}
        </aside>
      </article>
      {p.related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-6">
          <SectionHeading title={L.related} />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.related.map((r) => (<li key={r.key}><ItemCard item={r} labels={L} /></li>))}
          </ul>
        </section>
      )}
    </>
  );
}

export const osmLinkFor = (c: CardItem["coords"]) =>
  c ? `https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=16/${c.lat}/${c.lng}` : null;

