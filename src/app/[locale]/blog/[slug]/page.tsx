import { notFound } from "next/navigation";
import { LOCALES } from "@/content/schemas";
import { Breadcrumbs, Badge, SectionHeading } from "@/components/ui";
import { CardImage, ItemCard } from "@/components/cards";
import { getDictionary } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import { articleToCard } from "@/lib/cards";
import { formatDate } from "@/lib/format";
import { getLocale } from "@/lib/locale";
import { getContent } from "@/lib/repositories";
import { SITE_URL, buildMetadata } from "@/lib/site";

export const dynamicParams = false;
export async function generateStaticParams() {
  const items = await getContent().articles.list();
  return LOCALES.flatMap((locale) => items.map((a) => ({ locale, slug: a.slug })));
}

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const a = await getContent().articles.getBySlug((await params).slug);
  if (!a) return {};
  return buildMetadata({
    locale, path: `/blog/${a.slug}`, type: "article",
    title: a.seo?.title?.[locale] ?? a.title[locale], description: a.seo?.description?.[locale] ?? a.excerpt[locale],
    image: (a.featuredImage ?? a.photos[0])?.src,
  });
}

export default async function ArticlePage({ params }: P) {
  const locale = await getLocale(params);
  const repo = getContent();
  const a = await repo.articles.getBySlug((await params).slug);
  if (!a) notFound();
  const d = getDictionary(locale);
  const L = d.labels;
  const cat = (await repo.categories.getById(a.categoryId))!;
  const card = articleToCard(a, cat, locale);
  const related = await Promise.all((await repo.articles.related(a, 3)).map(async (r) => articleToCard(r, (await repo.categories.getById(r.categoryId))!, locale)));
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Article", headline: a.title[locale], description: a.excerpt[locale],
    datePublished: a.publishedAt, dateModified: a.updatedAt, inLanguage: locale, author: { "@type": "Organization", name: a.author },
    mainEntityOfPage: `${SITE_URL}${href(locale, "blog", a.slug)}`,
  };

  return (
    <>
      <Breadcrumbs items={[{ label: L.home, href: href(locale, null) }, { label: d.nav.blog, href: href(locale, "blog") }, { label: card.title }]} />
      <article className="mx-auto max-w-3xl px-4 py-6">
        <Badge color={cat.color}>{cat.name[locale]}</Badge>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{a.title[locale]}</h1>
        <p className="mt-3 text-sm text-neutral-600">{L.by} {a.author} · {L.publishedOn} <time dateTime={a.publishedAt}>{formatDate(a.publishedAt, locale)}</time></p>
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-black/10"><CardImage item={card} labels={L} sizes="768px" showLabel /></div>
        <div className="mt-8 space-y-4 text-lg leading-relaxed text-neutral-800">
          {a.body[locale].map((line, i) =>
            line.startsWith("## ") ? <h2 key={i} className="pt-4 font-display text-2xl text-sv-black">{line.slice(3)}</h2> : <p key={i}>{line}</p>,
          )}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </article>
      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-6">
          <SectionHeading title={L.related} />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((r) => (<li key={r.key}><ItemCard item={r} labels={L} /></li>))}</ul>
        </section>
      )}
    </>
  );
}
