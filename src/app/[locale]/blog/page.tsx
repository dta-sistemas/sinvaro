import { getDictionary } from "@/i18n/dictionaries";
import { getAllCards } from "@/lib/cards";
import { categoryGroup } from "@/lib/filters";
import { getLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/site";
import { CollectionBrowser } from "@/components/CollectionBrowser";
import { PageHero } from "@/components/ui";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const t = getDictionary(locale).pages.blog;
  return buildMetadata({ locale, path: "/blog", title: t.seoTitle, description: t.seoDesc });
}

export default async function BlogPage({ params }: P) {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  const { articles, categories } = await getAllCards(locale);
  return (
    <>
      <PageHero a={d.pages.blog.a} b={d.pages.blog.b} intro={d.pages.blog.intro} color="pink" icon="Lightbulb" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <CollectionBrowser items={articles} groups={[categoryGroup(categories.filter((c) => c.kind === "article"), d.filters.category, locale)]} dict={d} />
      </div>
    </>
  );
}
