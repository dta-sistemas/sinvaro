import { notFound } from "next/navigation";
import { LOCALES } from "@/content/schemas";
import { DetailLayout, osmLinkFor } from "@/components/DetailLayout";
import { Notice } from "@/components/ui";
import { fmt, getDictionary } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import { getAllCards, offerToCard } from "@/lib/cards";
import { formatDate } from "@/lib/format";
import { getLocale } from "@/lib/locale";
import { getContent } from "@/lib/repositories";
import { buildMetadata } from "@/lib/site";

export const dynamicParams = false;
export const revalidate = 3600;
export async function generateStaticParams() {
  const items = await getContent().offers.list();
  return LOCALES.flatMap((locale) => items.map((o) => ({ locale, slug: o.slug })));
}

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const o = await getContent().offers.getBySlug((await params).slug);
  if (!o) return {};
  return buildMetadata({ locale, path: `/ofertas/${o.slug}`, title: o.seo?.title?.[locale] ?? o.title[locale], description: o.seo?.description?.[locale] ?? o.summary[locale], image: o.photos[0]?.src, noindex: o.isSample });
}

export default async function OfferPage({ params }: P) {
  const locale = await getLocale(params);
  const repo = getContent();
  const o = await repo.offers.getBySlug((await params).slug);
  if (!o) notFound();
  const d = getDictionary(locale);
  const tagNames = await repo.tags.list();
  const L = d.labels;
  const card = offerToCard(o, (await repo.categories.getById(o.categoryId))!, locale);
  const status = card.offerStatus!;
  const coupon = o.couponCode ?? (await repo.offers.getCouponForOffer(o.id))?.code ?? null;
  const validity =
    status === "expired" ? fmt(L.expiredOn, { date: formatDate(o.endsAt!, locale) })
    : status === "upcoming" ? fmt(L.validFrom, { date: formatDate(o.startsAt!, locale) })
    : o.endsAt ? fmt(L.validUntil, { date: formatDate(o.endsAt, locale) }) : L.noExpiry;
  const related = (await getAllCards(locale)).offers.filter((c) => c.id !== o.id && c.offerStatus !== "expired").slice(0, 3);

  return (
    <DetailLayout
      locale={locale} dict={d} card={card}
      crumbs={[{ label: L.home, href: href(locale, null) }, { label: d.nav.offers, href: href(locale, "ofertas") }, { label: card.title }]}
      description={o.summary[locale]}
      banner={<>
        {o.isSample && <Notice tone="warn">{L.sampleNotice}</Notice>}
        {status === "expired" && <Notice tone="warn">{L.expiredNotice}</Notice>}
        {status === "upcoming" && <Notice>{L.upcomingNotice}</Notice>}
      </>}
      rows={[
        { label: L.business, value: o.business },
        { label: L.benefit, value: o.benefit[locale] },
        { label: L.validity, value: validity },
        { label: L.location, value: [o.location.area[locale], o.location.address].filter(Boolean).join(" · ") },
        ...(coupon && status === "active" ? [{ label: L.coupon, value: <code className="rounded bg-white px-2 py-1 font-bold">{coupon}</code> }] : []),
      ]}
      sections={[{ title: L.conditions, items: o.conditions[locale] }]}
      extra={o.redeemUrl && status !== "expired" ? (
        <div className="mt-8"><a href={o.redeemUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-xl bg-sv-pink px-5 text-sm font-extrabold uppercase text-white">{L.consult}</a><p className="mt-2 text-xs text-neutral-600">{L.verifyDirect}</p></div>
      ) : null}
      tags={tagNames.filter((t) => o.tagIds.includes(t.id)).map((t) => t.name[locale])}
      related={related} verification={o.verification} osmLink={osmLinkFor(card.coords)}
    />
  );
}
