import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Palmtree, Ticket, Utensils } from "lucide-react";
import { getDictionary } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import { getAllCards } from "@/lib/cards";
import { loadAllContent } from "@/lib/content/load";
import { getLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/site";
import { Icon, ButtonLink, EmptyState, SectionHeading } from "@/components/ui";
import { ItemCard } from "@/components/cards";
import { NewsletterForm } from "@/components/forms";
import { COLOR, readableOn } from "@/lib/colors";
import site from "../../../content/site.json";

export const revalidate = 3600; // refresca la vigencia de ofertas cada hora

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  return buildMetadata({ locale, path: "/", title: `${d.site.name} — ${d.site.tagline}`, description: d.site.description });
}

export default async function Home({ params }: P) {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  const cards = await getAllCards(locale);
  const tips = loadAllContent().tips;
  const recommended = cards.places.filter((c) => c.filters.access?.includes("free")).slice(0, 4);
  const offers = cards.offers.filter((o) => o.offerStatus === "active").sort((a, b) => b.filters.featured.length - a.filters.featured.length).slice(0, 3);
  const explore = [
    ...[...new Map(cards.places.filter((c) => c.filters.access.includes("free")).map((c) => [c.categoryId, c])).values()].map((c) => ({ to: `${href(locale, "gratis")}?category=${c.categoryId}`, label: c.categoryName, icon: c.icon, color: c.color })),
    ...[...new Map(cards.restaurants.map((c) => [c.categoryId, c])).values()].map((c) => ({ to: `${href(locale, "comer-barato")}?category=${c.categoryId}`, label: c.categoryName, icon: c.icon, color: c.color })),
  ];
  const hero = site.heroImage as { src: string; alt: { es: string; en: string } } | null;

  const tiles = [
    { to: href(locale, "gratis"), t: d.quick.free, color: "pink" as const, icon: "Palmtree" },
    { to: href(locale, "comer-barato"), t: d.quick.eats, color: "yellow" as const, icon: "Utensils" },
    { to: href(locale, "ofertas"), t: d.quick.offers, color: "teal" as const, icon: "Ticket" },
    { to: href(locale, "lugares-secretos"), t: d.quick.secret, color: "purple" as const, icon: "MapPin" },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-[#fffaf0]">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 pb-24 pt-8 md:grid-cols-2 md:pb-28 md:pt-12">
          <div className="relative z-10">
            <h1 className="font-display leading-[0.9]">
              <span className="sr-only">{d.hero.sr}</span>
              <span aria-hidden className="block text-3xl sm:text-5xl">{d.hero.line1}</span>
              <span aria-hidden className="block -rotate-2 text-[4.2rem] text-sv-pink sm:text-[7rem]">{d.hero.line2}</span>
              <span aria-hidden className="mt-2 inline-block -rotate-1 bg-sv-yellow px-3 font-accent text-2xl tracking-wide sm:text-3xl">{d.hero.tag}</span>
            </h1>
            <p className="mt-5 max-w-md text-base sm:text-lg">{d.hero.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={href(locale, "gratis")} variant="black">{d.hero.ctaExplore}</ButtonLink>
              <ButtonLink href={href(locale, "gratis")} variant="pink">{d.hero.ctaFree}</ButtonLink>
              <ButtonLink href={href(locale, "ofertas")} variant="light">{d.hero.ctaOffers}</ButtonLink>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl md:aspect-[5/4]">
            {hero ? (
              <Image src={hero.src} alt={hero.alt[locale]} fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
            ) : (
              <div aria-hidden className="h-full w-full bg-[linear-gradient(170deg,#ffe29a_0%,#ff9db9_35%,#16b8b3_70%,#0b7f7b_100%)]">
                <div className="absolute left-[18%] top-[16%] h-24 w-24 rounded-full bg-white/70 sm:h-32 sm:w-32" />
                <div className="absolute -bottom-6 -left-6 h-40 w-40 rounded-full bg-sv-yellow/60" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,.5),transparent_60%)]" />
              </div>
            )}
            <div aria-hidden className="pointer-events-none">
              <span className="absolute left-3 top-4 flex h-14 w-14 -rotate-12 items-center justify-center rounded-full bg-sv-pink text-white shadow-lg"><Palmtree className="h-7 w-7" /></span>
              <span className="absolute right-4 top-10 flex h-14 w-14 rotate-12 items-center justify-center rounded-full bg-sv-yellow shadow-lg"><Utensils className="h-7 w-7" /></span>
              <span className="absolute bottom-6 right-6 flex h-14 w-14 -rotate-6 items-center justify-center rounded-full bg-sv-purple text-white shadow-lg"><Ticket className="h-7 w-7" /></span>
              <span className="absolute bottom-8 left-8 flex h-12 w-12 rotate-6 items-center justify-center rounded-full bg-white text-sv-black shadow-lg"><MapPin className="h-6 w-6" /></span>
            </div>
          </div>
        </div>
        <svg aria-hidden viewBox="0 0 1440 40" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-8 w-full text-white"><path fill="currentColor" d="M0 40V18c140 18 280 22 420 10S700 0 860 6s300 24 580 8v26z" /></svg>
      </section>

      <section aria-label="Categorías" className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 md:-mt-20">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map(({ to, t, color, icon }) => (
            <li key={to}>
              <Link href={to} className="group flex h-full flex-col gap-2 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/10 transition hover:-translate-y-1 hover:shadow-xl">
                <span className={`flex h-12 w-12 items-center justify-center rounded-full transition group-hover:rotate-12 group-hover:scale-110 ${COLOR[color].bg}`}><Icon name={icon} className="h-6 w-6" /></span>
                <span className="font-display text-lg leading-none"><span className="block">{t.a}</span><span className={`block ${COLOR[color].text}`}>{t.b}</span></span>
                <span className="text-xs text-neutral-700">{t.desc}</span>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-extrabold uppercase">{t.cta}<ArrowRight aria-hidden className="h-3.5 w-3.5" /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {explore.length > 0 && (
        <nav aria-label={d.filters.explore} className="mx-auto mt-10 max-w-7xl px-4">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-neutral-600">{d.filters.explore}</p>
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {explore.map((e) => (
              <li key={e.to} className="shrink-0">
                <Link href={e.to} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold ring-1 ring-black/15 transition hover:-translate-y-0.5 hover:bg-sv-yellow">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${COLOR[e.color].bg}`}><Icon name={e.icon} className="h-4 w-4" /></span>{e.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mx-auto mt-12 grid max-w-7xl gap-12 px-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="rec">
          <div id="rec"><SectionHeading title={d.sections.recommended} href={href(locale, "gratis")} linkLabel={d.sections.viewAll} /></div>
          {recommended.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recommended.map((c) => (<li key={c.key}><ItemCard item={c} labels={d.labels} /></li>))}
            </ul>
          ) : (<EmptyState title={d.filters.emptyCollectionTitle} text={d.filters.emptyCollectionText} />)}
        </section>
        <section aria-labelledby="off">
          <div id="off"><SectionHeading title={d.sections.featuredOffers} href={href(locale, "ofertas")} linkLabel={d.sections.viewAllF} /></div>
          {offers.length ? (
            <ul className="grid gap-3">{offers.map((c) => (<li key={c.key}><ItemCard item={c} labels={d.labels} variant="row" /></li>))}</ul>
          ) : (<EmptyState title={d.pages.offers.emptyTitle} text={d.pages.offers.emptyText} />)}
        </section>
      </div>

      <div className="mx-auto mt-14 grid max-w-7xl gap-6 px-4 lg:grid-cols-2">
        <section aria-labelledby="tips" className="rounded-2xl bg-sv-gray p-6">
          <h2 id="tips" className="mb-4 font-display text-xl uppercase">{d.sections.tips}</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {tips.map((t) => (
              <li key={t.id} className="flex gap-3">
                <Icon name={t.icon} className="mt-0.5 h-8 w-8 shrink-0 text-sv-pink" />
                <div><h3 className="text-sm font-extrabold">{t.title[locale]}</h3><p className="text-xs text-neutral-700">{t.text[locale]}</p></div>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-sv-yellow p-6"><NewsletterForm locale={locale} dict={d} /></section>
      </div>

      {cards.routes.length > 0 && (
        <section aria-labelledby="getaround" className="mx-auto mt-14 max-w-7xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-sv-teal p-6 sm:p-10">
            <span aria-hidden className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/30" />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-xl">
                <h2 id="getaround" className="font-display text-3xl uppercase leading-none sm:text-4xl">{d.pages.routes.a} <span className="text-white">{d.pages.routes.b}</span></h2>
                <p className="mt-3 text-base">{d.pages.routes.intro}</p>
                <div className="mt-5"><ButtonLink href={href(locale, "como-llegar")} variant="black">{d.pages.routes.sectionNav}</ButtonLink></div>
              </div>
              <ul className="flex flex-wrap gap-2" aria-label={d.nav.getAround}>
                {cards.routes.slice(0, 6).map((r) => (
                  <li key={r.key}><Link href={r.href} className="inline-flex min-h-11 min-w-14 items-center justify-center rounded-xl px-3 font-display text-lg shadow ring-2 ring-white" style={{ background: r.route!.color, color: readableOn(r.route!.color) }}><span className="sr-only">{r.title}</span><span aria-hidden>{r.route!.code}</span></Link></li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {cards.articles.length > 0 && (
        <section className="mx-auto mt-14 max-w-7xl px-4">
          <SectionHeading title={d.sections.latest} href={href(locale, "blog")} linkLabel={d.sections.viewAll} />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.articles.slice(0, 3).map((c) => (<li key={c.key}><ItemCard item={c} labels={d.labels} /></li>))}
          </ul>
        </section>
      )}
    </>
  );
}

