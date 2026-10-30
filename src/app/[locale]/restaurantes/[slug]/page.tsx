import { notFound } from "next/navigation";
import { LOCALES } from "@/content/schemas";
import { DetailLayout, osmLinkFor } from "@/components/DetailLayout";
import { getDictionary } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import { getAllCards, restaurantToCard } from "@/lib/cards";
import { getLocale } from "@/lib/locale";
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
  const tagNames = await repo.tags.list();
  const L = d.labels;
  const card = restaurantToCard(r, (await repo.categories.getById(r.categoryId))!, locale, d);
  const related = (await getAllCards(locale)).restaurants.filter((c) => c.id !== r.id).slice(0, 3);
  const meals = r.mealTypes.map((m) => d.filters[m]).join(", ");
  return (
    <DetailLayout
      locale={locale} dict={d} card={card}
      crumbs={[{ label: L.home, href: href(locale, null) }, { label: d.nav.cheapEats, href: href(locale, "comer-barato") }, { label: card.title }]}
      description={r.description[locale]}
      rows={[
        { label: L.location, value: [r.location.area[locale], r.location.address].filter(Boolean).join(" · ") },
        { label: L.price, value: r.priceNote?.[locale] ?? (r.priceBand === "unknown" ? L.noPrice : d.filters[r.priceBand]) },
        ...(meals ? [{ label: d.filters.meal, value: meals }] : []),
        ...(r.hours ? [{ label: L.hours, value: r.hours[locale] }] : []),
      ]}
      sections={r.tips[locale].length ? [{ title: L.tips, items: r.tips[locale] }] : []}
      extra={r.externalUrl ? <p className="mt-8"><a href={r.externalUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">{r.externalUrl}</a></p> : null}
      tags={tagNames.filter((t) => r.tagIds.includes(t.id)).map((t) => t.name[locale])}
      related={related} verification={r.verification} osmLink={osmLinkFor(card.coords)}
    />
  );
}
