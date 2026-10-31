import { notFound } from "next/navigation";
import { LOCALES } from "@/content/schemas";
import { DetailLayout } from "@/components/DetailLayout";
import { RoutesNearby } from "@/components/RoutesNearby";
import { getDictionary } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import { getAllCards, restaurantToCard } from "@/lib/cards";
import { NEARBY_RADIUS_M } from "@/lib/config";
import { routesNearPoint } from "@/lib/geo";
import { getLocale } from "@/lib/locale";
import { formatPrice } from "@/lib/price";
import { pickRelatedArticle } from "@/lib/related";
import { getContent } from "@/lib/repositories";
import { buildMetadata } from "@/lib/site";

export const dynamicParams = false;
export async function generateStaticParams() {
  const items = await getContent().restaurants.list();
  return LOCALES.flatMap((locale) => items.map((r) => ({ locale, slug: r.slug })));
}

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const r = await getContent().restaurants.getBySlug((await params).slug);
  if (!r) return {};
  return buildMetadata({ locale, path: `/restaurantes/${r.slug}`, title: r.seo?.title?.[locale] ?? r.title[locale], description: r.seo?.description?.[locale] ?? r.summary[locale], image: r.photos[0]?.src });
}

export default async function RestaurantPage({ params }: P) {
  const locale = await getLocale(params);
  const repo = getContent();
  const r = await repo.restaurants.getBySlug((await params).slug);
  if (!r) notFound();
  const d = getDictionary(locale);
  const L = d.labels;
  const cat = (await repo.categories.getById(r.categoryId))!;
  const card = restaurantToCard(r, cat, locale, d);
  const [all, tagList, articles, routes] = await Promise.all([getAllCards(locale), repo.tags.list(), repo.articles.list(), repo.routes.list()]);
  const related = all.restaurants.filter((c) => c.id !== r.id).slice(0, 3);
  const nearRoutes = card.coords ? routesNearPoint(routes, [card.coords.lat, card.coords.lng], NEARBY_RADIUS_M) : [];
  const art = pickRelatedArticle(r, articles);
  const area = r.location.area[locale];
  const meals = r.mealTypes.map((m) => d.filters[m]).join(", ");
  const price = [r.priceMxn !== null ? formatPrice(r.priceMxn, { free: L.free, from: L.from }) : r.priceBand === "unknown" ? L.noPrice : d.filters[r.priceBand], r.priceNote?.[locale]].filter(Boolean).join(" — ");

  return (
    <DetailLayout
      locale={locale} dict={d} card={card}
      crumbs={[{ label: L.home, href: href(locale, null) }, { label: d.nav.cheapEats, href: href(locale, "comer-barato") }, { label: card.title }]}
      hero={{
        photo: card.photo,
        chips: [
          ...(card.badge ? [{ label: card.badge.label, color: "yellow" as const, icon: "CircleDollarSign" }] : []),
          { label: area, color: "teal", icon: "MapPin" },
          { label: cat.name[locale], color: "purple", icon: cat.icon },
          ...(card.pending ? [{ label: L.pending, color: "yellow" as const, icon: "Info" }] : []),
        ],
      }}
      description={r.description[locale]}
      tags={tagList.filter((t) => r.tagIds.includes(t.id)).map((t) => t.name[locale])}
      rows={[
        { icon: "Tag", label: d.detail.type, value: cat.name[locale] },
        { icon: "CircleDollarSign", label: L.price, value: price },
        ...(meals ? [{ icon: "Utensils", label: d.filters.meal, value: meals }] : []),
        ...(r.hours ? [{ icon: "Clock", label: L.hours, value: r.hours[locale] }] : []),
        { icon: "MapPin", label: L.location, value: area },
      ]}
      verification={r.verification}
      gallery={r.photos.map((p) => ({ src: p.src, alt: p.alt[locale], credit: p.credit }))}
      location={{ area, address: r.location.address }}
      reach={<RoutesNearby routes={nearRoutes} locale={locale} dict={d} radius={NEARBY_RADIUS_M} />}
      extra={r.externalUrl ? <p><a href={r.externalUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">{r.externalUrl}</a></p> : null}
      tips={r.tips[locale]}
      related={related}
      readAlso={art ? { title: art.title[locale], excerpt: art.excerpt[locale], href: href(locale, "blog", art.slug) } : null}
      showSuggest
    />
  );
}
