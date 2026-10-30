import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/site";
import { ContactForm } from "@/components/forms";
import { PageHero } from "@/components/ui";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const t = getDictionary(locale).pages.contact;
  return buildMetadata({ locale, path: "/contacto", title: t.seoTitle, description: t.seoDesc });
}

export default async function ContactPage({ params }: P) {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  return (
    <>
      <PageHero a={d.pages.contact.a} b={d.pages.contact.b} intro={d.pages.contact.intro} color="yellow" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-6 lg:grid-cols-2">
        <ContactForm dict={d} />
        <section id="colaboracion" className="h-fit rounded-2xl bg-sv-gray p-6">
          <h2 className="font-display text-2xl">{d.pages.contact.collab}</h2>
          <p className="mt-2 text-neutral-800">{d.pages.contact.collabText}</p>
        </section>
      </div>
    </>
  );
}
