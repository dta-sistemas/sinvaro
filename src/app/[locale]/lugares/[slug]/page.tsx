import { notFound } from "next/navigation";
import { LOCALES } from "@/content/schemas";
import { DetailLayout, osmLinkFor } from "@/components/DetailLayout";
import { getDictionary } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import { getAllCards, placeToCard } from "@/lib/cards";
import { getLocale } from "@/lib/locale";
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
  const tagNames = await repo.tags.list();
  const cat = (await repo.categories.getById(place.categoryId))!;
  const card = placeToCard(place, cat, locale, d);
  const { places } = await getAllCards(locale);
  const related = places.filter((c) => c.id !== place.id).sort((a, b) => Number(b.categoryId === card.categoryId) - Number(a.categoryId === card.categoryId)).slice(0, 3);
  const L = d.labels;
  const access = { free: L.free, paid: L.paid, reservation: L.reservation, unknown: L.unknownAccess }[place.access];

  return (
    <DetailLayout
      locale={locale} dict={d} card={card}
      crumbs={[{ label: L.home, href: href(locale, null) }, { label: place.isSecret ? d.nav.secret : d.nav.free, href: href(locale, place.isSecret ? "lugares-secretos" : "gratis") }, { label: card.title }]}
      description={place.description[locale]}
      rows={[
        { label: L.location, value: [place.location.area[locale], place.location.address].filter(Boolean).join(" · ") },
        { label: L.price, value: place.priceNote ? `${access} — ${place.priceNote[locale]}` : access },
        ...(place.hours ? [{ label: L.hours, value: place.hours[locale] }] : []),
      ]}
      sections={[
        ...(place.howToGet ? [{ title: L.howToGet, text: place.howToGet[locale] }] : []),
        ...(place.tips[locale].length ? [{ title: L.tips, items: place.tips[locale] }] : []),
      ]}
      tags={tagNames.filter((t) => place.tagIds.includes(t.id)).map((t) => t.name[locale])}
      related={related} verification={place.verification} osmLink={osmLinkFor(card.coords)}
    />
  );
}
