import { getDictionary } from "@/i18n/dictionaries";
import { getAllCards } from "@/lib/cards";
import { getLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/site";
import { MapExplorer } from "@/components/MapExplorer";
import { PageHero } from "@/components/ui";

export const revalidate = 3600;
type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const t = getDictionary(locale).pages.map;
  return buildMetadata({ locale, path: "/mapa", title: t.seoTitle, description: t.seoDesc });
}

export default async function MapPage({ params }: P) {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  const c = await getAllCards(locale);
  const items = [...c.places, ...c.restaurants, ...c.offers.filter((o) => o.offerStatus !== "expired")];
  return (
    <>
      <PageHero a={d.pages.map.a} b={d.pages.map.b} intro={d.pages.map.intro} color="teal" icon="Map" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <MapExplorer items={items} dict={d} />
        <p className="mt-3 text-xs text-neutral-600">{d.pages.map.attribution}</p>
      </div>
    </>
  );
}
