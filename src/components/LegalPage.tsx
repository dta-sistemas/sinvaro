import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/content/schemas";
import { loadAllContent } from "@/lib/content/load";
import { Notice } from "./ui";

export function LegalPage({ locale, doc }: { locale: Locale; doc: "privacy" | "terms" }) {
  const page = loadAllContent().legal[doc];
  const d = getDictionary(locale);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl sm:text-5xl">{page.title[locale]}</h1>
      <div className="mt-4"><Notice tone="warn">{d.legal.draftBadge}</Notice></div>
      {page.sections.map((s) => (
        <section key={s.heading.es} className="mt-8"><h2 className="font-display text-2xl">{s.heading[locale]}</h2><p className="mt-2 leading-relaxed text-neutral-800">{s.body[locale]}</p></section>
      ))}
    </div>
  );
}
