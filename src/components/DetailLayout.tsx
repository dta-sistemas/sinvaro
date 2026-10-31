import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ExternalLink, Navigation } from "lucide-react";
import type { Category, Locale } from "@/content/schemas";
import type { CardItem } from "@/lib/cards";
import { fmt, type Dict } from "@/i18n/dictionaries";
import { COLOR } from "@/lib/colors";
import { Badge, Breadcrumbs, Icon, Notice } from "./ui";
import { CardImage, FavoriteButton, OfferStatusChip } from "./cards";
import { Gallery } from "./Gallery";
import { PlaceMap } from "./PlaceMap";
import { SectionTabs } from "./SectionTabs";

type Color = Category["color"];

export interface DetailProps {
  locale: Locale;
  dict: Dict;
  card: CardItem;
  crumbs: { label: string; href?: string }[];
  hero: { photo: { src: string; alt: string } | null; tagline?: string; chips: { label: string; color: Color; icon?: string }[] };
  description: string;
  tags?: string[];
  banner?: ReactNode;
  rows: { icon: string; label: string; value: ReactNode }[];
  verification: { status: "verified" | "pending"; lastVerified: string | null } | null;
  gallery?: { src: string; alt: string; credit?: string }[];
  activities?: { icon: string; title: string }[];
  location: { area: string; address?: string; howToGet?: string };
  /** Contenido extra bajo "Cómo llegar" (p. ej. rutas de autobús cercanas) */
  reach?: ReactNode;
  sections?: { title: string; text?: string; items?: string[] }[];
  extra?: ReactNode;
  tips?: string[];
  related: CardItem[];
  readAlso?: { title: string; excerpt: string; href: string } | null;
  showSuggest?: boolean;
}

const CHIP: Record<Color, string> = {
  pink: "text-sv-pink ring-sv-pink", teal: "text-[#0b7f7b] ring-sv-teal", purple: "text-sv-purple ring-sv-purple", yellow: "text-sv-black ring-sv-yellow",
};

const googleMapsUrl = (c: { lat: number; lng: number }) => `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`;
export const osmLinkFor = (c: CardItem["coords"]) => (c ? `https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=16/${c.lat}/${c.lng}` : null);

function Hero({ p }: { p: DetailProps }) {
  const { card, hero } = p;
  const hex = COLOR[card.color].hex;
  return (
    <section className="relative isolate overflow-hidden bg-sv-black text-white">
      {hero.photo ? (
        <Image src={hero.photo.src} alt={hero.photo.alt} fill priority sizes="100vw" className="-z-20 object-cover" />
      ) : (
        <div aria-hidden className="absolute inset-0 -z-20" style={{ background: `radial-gradient(circle at 85% 15%, ${hex}d9, transparent 55%), radial-gradient(circle at 8% 95%, ${hex}66, transparent 50%), #111`, backgroundImage: `radial-gradient(circle at 85% 15%, ${hex}d9, transparent 55%), radial-gradient(circle at 8% 95%, ${hex}66, transparent 50%), radial-gradient(rgba(255,255,255,.07) 1.5px, transparent 1.5px)`, backgroundSize: "auto, auto, 16px 16px", backgroundColor: "#111" }}>
          <Icon name={card.icon} className="absolute right-[7%] top-1/2 h-56 w-56 -translate-y-1/2 text-white opacity-15 sm:h-72 sm:w-72" />
        </div>
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/40 to-black/5" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="relative mx-auto flex min-h-[20rem] max-w-7xl flex-col justify-end px-4 pb-8 pt-12 sm:min-h-[27rem] sm:pb-12">
        {hero.tagline && (
          <p aria-hidden className="absolute right-4 top-8 hidden max-w-[16rem] -rotate-6 font-[family-name:var(--font-hand)] text-3xl leading-[1.05] text-white md:block lg:right-10">
            {hero.tagline}
            <svg viewBox="0 0 80 40" className="ml-auto mt-1 h-8 w-16 text-sv-yellow" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M4 30c20 6 50 0 62-22M66 8l-2 11M66 8l-11 2" /></svg>
          </p>
        )}
        <Badge color={card.color} className="mb-4 w-fit !px-4 !py-1.5 !text-xs">{card.categoryName}</Badge>
        <h1 className="max-w-3xl font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
          <span className="relative inline-block -rotate-1">
            {card.title}
            <span aria-hidden className="absolute -bottom-1 left-0 h-2.5 w-full -rotate-1 rounded-full bg-sv-yellow sm:-bottom-2 sm:h-3" style={{ zIndex: -1 }} />
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-white/95 sm:text-lg">{card.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-2 pr-16">
          {hero.chips.map((c) => (
            <li key={c.label} className={`inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-extrabold ring-2 ${CHIP[c.color]}`}>
              {c.icon && <Icon name={c.icon} className="h-3.5 w-3.5" />}{c.label}
            </li>
          ))}
          <li className="inline-flex"><OfferStatusChip item={card} labels={p.dict.labels} /></li>
        </ul>
        <div className="absolute bottom-6 right-4 sm:bottom-10 sm:right-8"><FavoriteButton item={card} labels={p.dict.labels} className="!h-14 !w-14" /></div>
      </div>
    </section>
  );
}

function InfoCard({ p }: { p: DetailProps }) {
  const t = p.dict.detail;
  const L = p.dict.labels;
  return (
    <section aria-labelledby="info-title" className="rounded-2xl bg-sv-yellow/25 p-5 ring-1 ring-sv-yellow/40">
      <h2 id="info-title" className="mb-3 font-display text-xl uppercase">{t.general}</h2>
      <dl className="grid divide-y divide-black/10">
        {p.rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[auto_6.5rem_1fr] items-start gap-3 py-3 text-sm">
            <Icon name={r.icon} className="mt-0.5 h-5 w-5 text-neutral-700" />
            <dt className="font-semibold text-neutral-700">{r.label}</dt>
            <dd className="font-bold">{r.value}</dd>
          </div>
        ))}
        {p.verification && (
          <div className="grid grid-cols-[auto_6.5rem_1fr] items-start gap-3 py-3 text-sm">
            <Icon name="Check" className="mt-0.5 h-5 w-5 text-neutral-700" />
            <dt className="font-semibold text-neutral-700">{L.lastVerified}</dt>
            <dd className="font-bold">{p.verification.lastVerified ?? L.neverVerified}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}

function TipsCard({ p }: { p: DetailProps }) {
  if (!p.tips?.length) return null;
  return (
    <section id="consejos" aria-labelledby="tips-title" className="scroll-mt-32 rounded-2xl bg-sv-pink/10 p-5 ring-1 ring-sv-pink/20">
      <h2 id="tips-title" className="mb-3 flex items-center gap-2 font-display text-xl uppercase"><Icon name="Lightbulb" className="h-6 w-6 text-sv-pink" />{p.dict.sections.tips}</h2>
      <ul className="grid gap-2.5 text-sm">
        {p.tips.map((tip) => (
          <li key={tip} className="flex gap-2.5"><span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sv-yellow"><Check className="h-3.5 w-3.5" /></span>{tip}</li>
        ))}
      </ul>
      <p aria-hidden className="mt-4 text-right font-[family-name:var(--font-hand)] text-2xl leading-none text-sv-pink">{p.dict.detail.enjoy}</p>
    </section>
  );
}

function RelatedCard({ p }: { p: DetailProps }) {
  if (p.related.length === 0) return null;
  return (
    <section id="relacionados" aria-labelledby="rel-title" className="scroll-mt-32 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10">
      <h2 id="rel-title" className="mb-3 font-display text-xl uppercase">{p.dict.detail.relatedPlaces}</h2>
      <ul className="grid gap-3">
        {p.related.map((r) => (
          <li key={r.key}>
            <Link href={r.href} className="group flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-sv-gray">
              <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg"><CardImage item={r} labels={p.dict.labels} sizes="80px" /></span>
              <span className="min-w-0 flex-1 text-sm"><span className="block font-extrabold">{r.title}</span><span className="line-clamp-2 text-xs text-neutral-600">{r.summary}</span></span>
              <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sv-pink text-white transition group-hover:translate-x-0.5"><ArrowRight className="h-4 w-4" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SuggestCard({ p }: { p: DetailProps }) {
  if (!p.showSuggest) return null;
  const t = p.dict.detail;
  const contact = `${p.locale === "es" ? "" : "/en"}/${p.locale === "es" ? "contacto" : "contact"}?topic=recommendation`;
  return (
    <section aria-labelledby="sug-title" className="rounded-2xl bg-sv-teal/20 p-5 ring-1 ring-sv-teal/40">
      <div className="flex gap-3">
        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sv-teal"><Icon name="Palmtree" className="h-6 w-6" /></span>
        <div>
          <h2 id="sug-title" className="font-display text-xl uppercase leading-tight">{t.secretTitle}</h2>
          <p className="mt-1 text-sm text-neutral-800">{t.secretText}</p>
          <Link href={contact} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-sv-yellow px-5 text-sm font-extrabold">
            <Icon name="Send" className="h-4 w-4" />{t.secretCta}
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Plantilla común de ficha (lugar, restaurante, oferta) con el diseño editorial de Sin Varo. */
export function DetailLayout(p: DetailProps) {
  const { dict, card } = p;
  const t = dict.detail;
  const L = dict.labels;
  const coords = card.coords;
  const hex = COLOR[card.color].hex;
  const tabs = [
    { id: "informacion", label: t.info },
    ...(p.gallery?.length ? [{ id: "galeria", label: t.gallery }] : []),
    { id: "como-llegar", label: t.reach },
    ...(p.tips?.length ? [{ id: "consejos", label: t.tips }] : []),
    ...(p.related.length ? [{ id: "relacionados", label: t.related }] : []),
  ];

  return (
    <>
      <Breadcrumbs items={p.crumbs} />
      <div className="mt-3"><Hero p={p} /></div>
      <SectionTabs tabs={tabs} label={t.tabs} />

      {/* En móvil: descripción → información general → resto → tips/relacionados. En escritorio: dos columnas. */}
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
        <div className="contents lg:block lg:space-y-10">
          <section id="informacion" aria-labelledby="desc-title" className="order-1 scroll-mt-32">
            <h2 id="desc-title" className="mb-3 font-display text-2xl uppercase">{L.description}</h2>
            <div className="mb-4 grid gap-3 empty:hidden">
              {p.banner}
              {p.verification?.status === "pending" && <Notice tone="warn">{L.pendingNotice}</Notice>}
            </div>
            <p className="max-w-3xl text-lg leading-relaxed text-neutral-800">{p.description}</p>
            {p.tags && p.tags.length > 0 && (
              <ul aria-label={t.tags} className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((tag) => (<li key={tag} className="rounded-full bg-sv-gray px-3 py-1 text-xs font-semibold text-neutral-700">#{tag}</li>))}
              </ul>
            )}
          </section>

          <div className="order-3 space-y-10 lg:order-none">
            {p.gallery && p.gallery.length > 0 && (
              <section id="galeria" aria-label={t.gallery} className="scroll-mt-32"><Gallery photos={p.gallery} labels={{ viewGallery: t.viewGallery, photoOf: t.photoOf, prev: t.prev, next: t.next, close: t.close }} /></section>
            )}

            {p.activities && p.activities.length > 0 && (
              <section aria-labelledby="act-title">
                <h2 id="act-title" className="mb-3 font-display text-2xl uppercase">{t.whatToDo}</h2>
                <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {p.activities.map((a, i) => {
                    const tone = (["yellow", "teal", "pink", "purple"] as const)[i % 4];
                    return (
                      <li key={a.title} className="flex flex-col items-center gap-3 rounded-2xl bg-white p-4 text-center text-sm font-semibold shadow-sm ring-1 ring-black/10">
                        <span className={`flex h-12 w-12 items-center justify-center rounded-full ${COLOR[tone].bg}`}><Icon name={a.icon} className="h-6 w-6" /></span>{a.title}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {p.sections?.map((s) => (
              <section key={s.title}>
                <h2 className="mb-2 font-display text-2xl uppercase">{s.title}</h2>
                {s.text && <p className="max-w-3xl leading-relaxed text-neutral-800">{s.text}</p>}
                {s.items && <ul className="list-disc space-y-1.5 pl-5 text-neutral-800">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>}
              </section>
            ))}
            {p.extra}

            <section id="como-llegar" aria-labelledby="loc-title" className="scroll-mt-32">
              <h2 id="loc-title" className="mb-3 font-display text-2xl uppercase">{coords ? t.map : t.locationTitle}</h2>
              <div className={`grid gap-4 ${coords ? "md:grid-cols-2" : ""}`}>
                {coords && <PlaceMap lat={coords.lat} lng={coords.lng} title={card.title} hex={hex} label={t.mapAria} loading={dict.pages.map.loading} error={dict.pages.map.error} />}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10">
                  <h3 className="text-sm font-extrabold">{t.locationTitle}</h3>
                  <p className="mt-2 flex gap-2 text-sm text-neutral-800"><Icon name="MapPin" className="mt-0.5 h-4 w-4 shrink-0 text-sv-pink" />{[p.location.area, p.location.address].filter(Boolean).join(" · ")}</p>
                  {coords && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={googleMapsUrl(coords)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sv-teal px-4 text-sm font-extrabold">{t.openGoogle}<ExternalLink aria-hidden className="h-4 w-4" /></a>
                      <a href={osmLinkFor(coords)!} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold ring-1 ring-black/15 hover:bg-sv-gray">{t.openOsm}</a>
                    </div>
                  )}
                  {coords?.approx && <p className="mt-2 text-xs text-neutral-600">{t.approxNote}</p>}
                  {p.location.howToGet && (<><h3 className="mt-4 flex items-center gap-2 text-sm font-extrabold"><Navigation aria-hidden className="h-4 w-4" />{t.howToGetTitle}</h3><p className="mt-1 text-sm text-neutral-800">{p.location.howToGet}</p></>)}
                </div>
              </div>
              {p.reach}
            </section>

            {p.readAlso && (
              <Link href={p.readAlso.href} className="group flex items-center gap-4 rounded-2xl bg-sv-teal/15 p-4 ring-1 ring-sv-teal/30 transition hover:bg-sv-teal/25">
                <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white"><Icon name="Lightbulb" className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1"><span className="block text-xs font-extrabold uppercase tracking-widest text-neutral-700">{t.readAlso}</span>
                  <span className="block font-extrabold">{p.readAlso.title}</span><span className="line-clamp-1 text-sm text-neutral-700">{p.readAlso.excerpt}</span></span>
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sv-teal transition group-hover:translate-x-0.5"><ArrowRight className="h-5 w-5" /></span>
              </Link>
            )}
          </div>
        </div>

        <div className="contents lg:block lg:space-y-6">
          <div className="order-2 lg:order-none"><InfoCard p={p} /></div>
          <div className="order-4 space-y-6 lg:order-none"><TipsCard p={p} /><RelatedCard p={p} /><SuggestCard p={p} /></div>
        </div>
      </div>
    </>
  );
}
export { fmt };
