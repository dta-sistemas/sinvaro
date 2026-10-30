import { getDictionary } from "@/i18n/dictionaries";
import { getAllCards } from "@/lib/cards";
import { categoryGroup, valueGroup } from "@/lib/filters";
import { getLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/site";
import { getContent } from "@/lib/repositories";
import { CollectionBrowser } from "@/components/CollectionBrowser";
import { Notice, PageHero } from "@/components/ui";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const t = getDictionary(locale).pages.secret;
  return buildMetadata({ locale, path: "/lugares-secretos", title: t.seoTitle, description: t.seoDesc });
}

export default async function SecretPage({ params }: P) {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  const { places, categories } = await getAllCards(locale);
  const secretIds = new Set((await getContent().places.list({ isSecret: true })).map((p) => `place:${p.id}`));
  const items = places.filter((p) => secretIds.has(p.key));
  const groups = [
    categoryGroup(categories.filter((c) => c.kind === "place"), d.filters.category, locale),
    valueGroup("access", d.filters.access, [["free", d.labels.free], ["paid", d.labels.paid], ["reservation", d.labels.reservation], ["unknown", d.labels.unknownAccess]]),
  ];
  return (
    <>
      <PageHero a={d.pages.secret.a} b={d.pages.secret.b} intro={d.pages.secret.intro} color="purple" />
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <Notice tone="warn">{d.pages.secret.notice}</Notice>
        <CollectionBrowser items={items} groups={groups} dict={d} />
      </div>
    </>
  );
}
