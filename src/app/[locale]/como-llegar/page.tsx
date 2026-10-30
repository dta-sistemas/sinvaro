import { getDictionary } from "@/i18n/dictionaries";
import { getAllCards } from "@/lib/cards";
import { categoryGroup } from "@/lib/filters";
import { getLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/site";
import { CollectionBrowser } from "@/components/CollectionBrowser";
import { Notice, PageHero } from "@/components/ui";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const t = getDictionary(locale).pages.routes;
  return buildMetadata({ locale, path: "/como-llegar", title: t.seoTitle, description: t.seoDesc });
}

export default async function RoutesPage({ params }: P) {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  const { routes, categories } = await getAllCards(locale);
  const groups = [categoryGroup(categories.filter((c) => c.kind === "route"), d.pages.routes.zone, locale)];
  return (
    <>
      <PageHero a={d.pages.routes.a} b={d.pages.routes.b} intro={d.pages.routes.intro} color="teal" icon="Bus" />
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
        {routes.length > 0 && <Notice tone="warn">{d.pages.routes.disclaimer}</Notice>}
        <CollectionBrowser items={routes} groups={groups} dict={d} emptyKind="routes" />
      </div>
    </>
  );
}
