import { getDictionary } from "@/i18n/dictionaries";
import { getAllCards } from "@/lib/cards";
import { areaGroup, categoryGroup, valueGroup } from "@/lib/filters";
import { getLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/site";
import { CollectionBrowser } from "@/components/CollectionBrowser";
import { PageHero } from "@/components/ui";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const t = getDictionary(locale).pages.eats;
  return buildMetadata({ locale, path: "/comer-barato", title: t.seoTitle, description: t.seoDesc });
}

export default async function EatsPage({ params }: P) {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  const { restaurants, categories } = await getAllCards(locale);
  const groups = [
    categoryGroup(categories.filter((c) => c.kind === "restaurant"), d.filters.category, locale),
    valueGroup("price", d.filters.price, [["free", d.filters.free], ["under50", d.filters.under50], ["under100", d.filters.under100], ["under150", d.filters.under150], ["over150", d.filters.over150]]),
    valueGroup("meal", d.filters.meal, [["breakfast", d.filters.breakfast], ["lunch", d.filters.lunch], ["dinner", d.filters.dinner]]),
    areaGroup(restaurants, d.filters.area),
  ];
  return (
    <>
      <PageHero a={d.pages.eats.a} b={d.pages.eats.b} intro={d.pages.eats.intro} color="yellow" icon="Utensils" />
      <div className="mx-auto max-w-7xl px-4 py-6"><CollectionBrowser items={restaurants} groups={groups} dict={d} note={d.filters.priceNote} /></div>
    </>
  );
}
