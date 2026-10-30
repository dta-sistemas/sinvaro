import { getDictionary } from "@/i18n/dictionaries";
import { getAllCards } from "@/lib/cards";
import { areaGroup, categoryGroup, valueGroup } from "@/lib/filters";
import { getLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/site";
import { CollectionBrowser } from "@/components/CollectionBrowser";
import { ItemCard } from "@/components/cards";
import { PageHero, SectionHeading } from "@/components/ui";

export const revalidate = 3600;

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const t = getDictionary(locale).pages.offers;
  return buildMetadata({ locale, path: "/ofertas", title: t.seoTitle, description: t.seoDesc });
}

export default async function OffersPage({ params }: P) {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  const { offers, categories } = await getAllCards(locale);
  const current = offers.filter((o) => o.offerStatus !== "expired");
  const expired = offers.filter((o) => o.offerStatus === "expired");
  const groups = [
    categoryGroup(categories.filter((c) => c.kind === "offer"), d.filters.category, locale),
    valueGroup("status", d.filters.status, [["active", d.filters.active], ["upcoming", d.filters.upcoming]]),
    areaGroup(current, d.filters.area),
  ];
  return (
    <>
      <PageHero a={d.pages.offers.a} b={d.pages.offers.b} intro={d.pages.offers.intro} color="purple" icon="Ticket" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <CollectionBrowser items={current} groups={groups} dict={d} emptyKind="offers" />
        {expired.length > 0 && (
          <section className="mt-14" aria-labelledby="expired">
            <div id="expired"><SectionHeading title={d.pages.offers.expiredTitle} /></div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {expired.map((o) => (<li key={o.key}><ItemCard item={o} labels={d.labels} /></li>))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
