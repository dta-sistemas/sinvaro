import { getDictionary } from "@/i18n/dictionaries";
import { getAllCards } from "@/lib/cards";
import { categoryGroup, areaGroup } from "@/lib/filters";
import { getLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/site";
import { CollectionBrowser } from "@/components/CollectionBrowser";
import { PageHero } from "@/components/ui";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const t = getDictionary(locale).pages.free;
  return buildMetadata({ locale, path: "/gratis", title: t.seoTitle, description: t.seoDesc });
}

export default async function FreePage({ params }: P) {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  const { places, categories } = await getAllCards(locale);
  const items = places.filter((p) => p.filters.access.includes("free"));
  const groups = [categoryGroup(categories.filter((c) => c.kind === "place"), d.filters.category, locale), areaGroup(items, d.filters.area)];
  return (
    <>
      <PageHero a={d.pages.free.a} b={d.pages.free.b} intro={d.pages.free.intro} color="pink" />
      <div className="mx-auto max-w-6xl px-4 py-6"><CollectionBrowser items={items} groups={groups} dict={d} /></div>
    </>
  );
}
