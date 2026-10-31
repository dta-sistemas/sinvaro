import { notFound } from "next/navigation";
import { LOCALES } from "@/content/schemas";
import { DetailLayout } from "@/components/DetailLayout";
import { RoutesNearby } from "@/components/RoutesNearby";
import { getDictionary } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import { getAllCards, placeToCard } from "@/lib/cards";
import { NEARBY_RADIUS_M } from "@/lib/config";
import { routesNearPoint } from "@/lib/geo";
import { getLocale } from "@/lib/locale";
import { pickRelatedArticle } from "@/lib/related";
import { getContent } from "@/lib/repositories";
import { buildMetadata } from "@/lib/site";

export const dynamicParams = false;
export async function generateStaticParams() {
  const places = await getContent().places.list();
  return LOCALES.flatMap((locale) => places.map((p) => ({ locale, slug: p.slug })));
}

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const place = await getContent().places.getBySlug((await params).slug);
  if (!place) return {};
  return buildMetadata({
    locale, path: `/lugares/${place.slug}`,
    title: place.seo?.title?.[locale] ?? place.title[locale],
    description: place.seo?.description?.[locale] ?? place.summary[locale],
    image: place.photos[0]?.src,
  });
}

export default async function PlacePage({ params }: P) {
  const locale = await getLocale(params);
  const { slug } = await params;
  const repo = getContent();
  const place = await repo.places.getBySlug(slug);
  if (!place) notFound();
  const d = getDictionary(locale);
  const L = d.labels;
  const cat = (await repo.categories.getById(place.categoryId))!;
  const card = placeToCard(place, cat, locale, d);
  const [{ places }, tagList, articles, routes] = await Promise.all([getAllCards(locale), repo.tags.list(), repo.articles.list(), repo.routes.list()]);
  const related = places.filter((c) => c.id !== place.id).sort((a, b) => Number(b.categoryId === card.categoryId) - Number(a.categoryId === card.categoryId)).slice(0, 3);
  const nearRoutes = card.coords ? routesNearPoint(routes, [card.coords.lat, card.coords.lng], NEARBY_RADIUS_M) : [];
  const art = pickRelatedArticle(place, articles);
  const access = { free: L.free, paid: L.paid, reservation: L.reservation, unknown: L.unknownAccess }[place.access];
  const area = place.location.area[locale];

  return (
    <DetailLayout
      locale={locale} dict={d} card={card}
      crumbs={[{ label: L.home, href: href(locale, null) }, { label: place.isSecret ? d.nav.secret : d.nav.free, href: href(locale, place.isSecret ? "lugares-secretos" : "gratis") }, { label: card.title }]}
      hero={{
        photo: card.photo, tagline: place.tagline?.[locale],
        chips: [
          { label: access, color: place.access === "free" ? "pink" : "yellow", icon: "Tag" },
          { label: area, color: "teal", icon: "MapPin" },
          { label: cat.name[locale], color: "purple", icon: cat.icon },
          ...(place.isSecret ? [{ label: d.nav.secret, color: "pink" as const, icon: "Heart" }] : []),
          ...(card.pending ? [{ label: L.pending, color: "yellow" as const, icon: "Info" }] : []),
        ],
      }}
      description={place.description[locale]}
      tags={tagList.filter((t) => place.tagIds.includes(t.id)).map((t) => t.name[locale])}
      rows={[
        { icon: "Tag", label: d.detail.type, value: cat.name[locale] },
        { icon: "CircleDollarSign", label: L.price, value: place.priceNote ? `${access} — ${place.priceNote[locale]}` : access },
        ...(place.hours ? [{ icon: "Clock", label: L.hours, value: place.hours[locale] }] : []),
        ...(place.accessibility ? [{ icon: "Accessibility", label: d.detail.accessibility, value: place.accessibility[locale] }] : []),
        { icon: "MapPin", label: L.location, value: area },
      ]}
      verification={place.verification}
      gallery={place.photos.map((p) => ({ src: p.src, alt: p.alt[locale], credit: p.credit }))}
      activities={place.activities.map((a) => ({ icon: a.icon, title: a.title[locale] }))}
      location={{ area, address: place.location.address, howToGet: place.howToGet?.[locale] }}
      reach={<RoutesNearby routes={nearRoutes} locale={locale} dict={d} radius={NEARBY_RADIUS_M} />}
      tips={place.tips[locale]}
      related={related}
      readAlso={art ? { title: art.title[locale], excerpt: art.excerpt[locale], href: href(locale, "blog", art.slug) } : null}
      showSuggest
    />
  );
}
