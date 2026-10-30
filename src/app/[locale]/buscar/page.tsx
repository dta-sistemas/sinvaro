import { getDictionary } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import { searchCards } from "@/lib/cards";
import { getLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/site";
import { ItemCard } from "@/components/cards";
import { EmptyState, PageHero, SectionHeading } from "@/components/ui";
import { Search } from "lucide-react";

type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string | string[] }> };
export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  return buildMetadata({ locale, path: "/buscar", title: getDictionary(locale).pages.search.seoTitle, description: getDictionary(locale).site.description, noindex: true });
}

export default async function SearchPage({ params, searchParams }: P) {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  const t = d.pages.search;
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw ?? "").trim().slice(0, 80);
  const res = q.length >= 2 ? await searchCards(locale, q) : null;
  const groups = res ? ([["place", res.places], ["restaurant", res.restaurants], ["offer", res.offers], ["article", res.articles]] as const).filter(([, l]) => l.length) : [];

  return (
    <>
      <PageHero a={t.a} b={t.b} intro={t.intro} color="pink" icon="Search" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <form role="search" action={href(locale, "buscar")} method="get" className="flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">{t.button}</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder={t.placeholder} minLength={2} maxLength={80} className="min-h-12 flex-1 rounded-xl border border-black/20 px-4" />
          <button type="submit" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-sv-yellow px-5 text-sm font-extrabold uppercase"><Search aria-hidden className="h-4 w-4" />{t.button}</button>
        </form>
        <div className="mt-8" aria-live="polite">
          {!q ? null : !res ? (<p className="text-sm text-neutral-700">{t.hint}</p>) : groups.length === 0 ? (
            <EmptyState title={d.filters.noResultsTitle} text={d.filters.noResultsText} />
          ) : (
            groups.map(([type, list]) => (
              <section key={type} className="mb-10">
                <SectionHeading title={t.types[type]} />
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((c) => (<li key={c.key}><ItemCard item={c} labels={d.labels} /></li>))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </>
  );
}
