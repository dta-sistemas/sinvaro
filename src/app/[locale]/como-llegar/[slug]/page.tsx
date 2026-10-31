import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES } from "@/content/schemas";
import { Breadcrumbs, Notice, SectionHeading } from "@/components/ui";
import { FavoriteButton } from "@/components/cards";
import { RouteMap, type RouteMapData } from "@/components/RouteMap";
import { fmt, getDictionary } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import { getAllCards, routeToCard } from "@/lib/cards";
import { readableOn } from "@/lib/colors";
import { NEARBY_RADIUS_M } from "@/lib/config";
import { formatDate } from "@/lib/format";
import { nearbyItems } from "@/lib/geo";
import { getLocale } from "@/lib/locale";
import { getContent } from "@/lib/repositories";
import { buildMetadata } from "@/lib/site";
import { COLOR } from "@/lib/colors";
import { Icon } from "@/components/ui";

export const dynamicParams = false;
export async function generateStaticParams() {
  const items = await getContent().routes.list();
  return LOCALES.flatMap((locale) => items.map((r) => ({ locale, slug: r.slug })));
}

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const r = await getContent().routes.getBySlug((await params).slug);
  if (!r) return {};
  return buildMetadata({
    locale, path: `/como-llegar/${r.slug}`, noindex: r.isSample,
    title: r.seo?.title?.[locale] ?? `${r.code} · ${r.name[locale]}`, description: r.seo?.description?.[locale] ?? r.summary[locale],
  });
}

export default async function RoutePage({ params }: P) {
  const locale = await getLocale(params);
  const repo = getContent();
  const route = await repo.routes.getBySlug((await params).slug);
  if (!route) notFound();
  const d = getDictionary(locale);
  const t = d.pages.routes;
  const L = d.labels;
  const cat = (await repo.categories.getById(route.categoryId))!;
  const all = await getAllCards(locale);
  const card = routeToCard(route, cat, locale, d);

  // Lugares con ubicación a NEARBY_RADIUS_M o menos del recorrido (todos los sentidos)
  const candidates = [...all.places, ...all.restaurants, ...all.offers.filter((o) => o.offerStatus !== "expired")];
  const nearby = nearbyItems(route.paths.map((p) => p.coordinates), candidates, NEARBY_RADIUS_M);
  const hexByColor = (c: string) => COLOR[c as keyof typeof COLOR].hex;

  const mapData: RouteMapData = {
    color: route.color,
    paths: route.paths.map((p) => ({ id: p.id, name: p.name[locale], coordinates: p.coordinates })),
    stops: route.stops.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng, pathId: s.pathId })),
    nearby: nearby.map((n) => ({ key: n.key, title: n.title, href: n.href, hex: hexByColor(n.color), distance: n.distance, lat: n.coords!.lat, lng: n.coords!.lng, approx: n.coords!.approx })),
  };
  const fare = route.fare.amountMxn === null ? t.fareUnknown : route.fare.amountMxn === 0 ? L.free : `$${route.fare.amountMxn} MXN`;

  return (
    <>
      <Breadcrumbs items={[{ label: L.home, href: href(locale, null) }, { label: d.nav.getAround, href: href(locale, "como-llegar") }, { label: route.code }]} />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-16 min-w-20 items-center justify-center rounded-2xl px-3 font-display text-3xl shadow" style={{ background: route.color, color: readableOn(route.color) }}>{route.code}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-600">{cat.name[locale]}</p>
              <h1 className="font-display text-3xl leading-tight sm:text-4xl">{route.name[locale]}</h1>
            </div>
          </div>
          <FavoriteButton item={card} labels={L} className="shrink-0" />
        </div>
        <p className="mt-4 max-w-3xl text-lg text-neutral-800">{route.summary[locale]}</p>
        <div className="mt-4 grid max-w-3xl gap-3">
          {route.isSample && <Notice tone="warn">{t.sampleNotice}</Notice>}
          {route.verification.status === "pending" && <Notice tone="warn">{L.pendingNotice}</Notice>}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0 lg:sticky lg:top-24">
            <RouteMap data={mapData} labels={{
              map: t.mapLabel, direction: t.direction, showNearby: t.showNearby, legendRoute: t.legendRoute, legendStop: t.legendStop, legendPlace: t.legendPlace,
              start: t.start, end: t.end, away: t.away, approx: L.approx, loading: d.pages.map.loading, error: d.pages.map.error, details: L.details,
            }} />
            <p className="mt-3 text-xs text-neutral-600">{d.pages.map.attribution}</p>
          </div>

          <aside className="grid gap-6">
            <section className="rounded-2xl bg-sv-gray p-5">
              <dl className="grid gap-4 text-sm">
                <div><dt className="text-xs font-extrabold uppercase tracking-widest text-neutral-600">{t.fare}</dt><dd className="mt-0.5 text-lg font-bold">{fare}{route.fare.note && <span className="block text-sm font-normal text-neutral-700">{route.fare.note[locale]}</span>}</dd></div>
                {route.operator && <div><dt className="text-xs font-extrabold uppercase tracking-widest text-neutral-600">{t.operator}</dt><dd className="mt-0.5 font-medium">{route.operator}</dd></div>}
                <div><dt className="text-xs font-extrabold uppercase tracking-widest text-neutral-600">{L.lastVerified}</dt><dd className="mt-0.5 font-medium">{route.verification.lastVerified ? formatDate(route.verification.lastVerified, locale) : L.neverVerified}</dd></div>
              </dl>
              <p className="mt-4 text-xs text-neutral-600">{t.disclaimer}</p>
            </section>

            <section aria-labelledby="stops">
              <h2 id="stops" className="mb-1 font-display text-2xl">{t.stops}</h2>
              {route.stops.length ? (
                <>
                  <p className="mb-3 text-xs text-neutral-600">{t.stopsNote}</p>
                  <ol className="relative grid gap-0 border-l-4 pl-5" style={{ borderColor: route.color }}>
                    {route.stops.map((s, i) => (
                      <li key={`${s.name}-${i}`} className="relative pb-3 text-sm font-medium">
                        <span aria-hidden className="absolute -left-[1.85rem] top-1 h-3.5 w-3.5 rounded-full border-[3px] bg-white" style={{ borderColor: route.color }} />
                        {s.name}{s.pathId && <span className="ml-2 text-xs text-neutral-600">({route.paths.find((p) => p.id === s.pathId)?.name[locale]})</span>}
                      </li>
                    ))}
                  </ol>
                </>
              ) : <p className="text-sm text-neutral-700">{t.noStops}</p>}
            </section>
          </aside>
        </div>

        <section className="mt-10" aria-labelledby="near">
          <div id="near"><SectionHeading title={t.nearby} /></div>
          {nearby.length ? (
            <>
              <p className="mb-3 text-sm text-neutral-700">{fmt(t.nearbyNote, { m: NEARBY_RADIUS_M })}</p>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {nearby.map((n) => (
                  <li key={n.key}>
                    <Link href={n.href} className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-md">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${COLOR[n.color].bg}`}><Icon name={n.icon} className="h-5 w-5" /></span>
                      <span className="min-w-0 text-sm"><span className="block truncate font-bold">{n.title}</span>
                        <span className="block truncate text-xs text-neutral-600">{fmt(t.away, { m: n.distance })}{n.badge ? ` · ${n.badge.label}` : ""}{n.pending ? ` · ${L.pending}` : ""}</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : <p className="text-sm text-neutral-700">{t.nearbyEmpty}</p>}
        </section>
      </div>
    </>
  );
}
