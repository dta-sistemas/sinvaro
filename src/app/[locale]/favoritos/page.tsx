import { getDictionary } from "@/i18n/dictionaries";
import { getAllCards } from "@/lib/cards";
import { getLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/site";
import { FavoritesClient } from "@/components/FavoritesClient";
import { PageHero } from "@/components/ui";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  return buildMetadata({ locale, path: "/favoritos", title: getDictionary(locale).pages.favorites.seoTitle, description: getDictionary(locale).site.description, noindex: true });
}

export default async function FavoritesPage({ params }: P) {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  const c = await getAllCards(locale);
  const all = [...c.places, ...c.restaurants, ...c.offers];
  return (
    <>
      <PageHero a={d.pages.favorites.a} b={d.pages.favorites.b} intro={d.pages.favorites.intro} color="pink" />
      <div className="mx-auto max-w-6xl px-4 py-6"><FavoritesClient cards={all} dict={d} /></div>
    </>
  );
}
