import { getLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/site";
import { LegalPage } from "@/components/LegalPage";
import { loadAllContent } from "@/lib/content/load";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P) {
  const locale = await getLocale(params);
  const page = loadAllContent().legal.terms;
  return buildMetadata({ locale, path: "/terminos", title: page.title[locale], description: page.sections[1]?.body[locale] ?? page.title[locale], noindex: true });
}

export default async function Page({ params }: P) {
  return <LegalPage locale={await getLocale(params)} doc="terms" />;
}
