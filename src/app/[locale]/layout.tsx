import type { Metadata, Viewport } from "next";
import "@fontsource/luckiest-guy/400.css";
import "@fontsource/bangers/400.css";
import "@fontsource-variable/inter";
import "../globals.css";
import { LOCALES } from "@/content/schemas";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/lib/locale";
import { SITE_URL, alternatesFor } from "@/lib/site";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FFD600" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await getLocale(params);
  const d = getDictionary(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${d.site.name} — ${d.site.tagline}`, template: `%s | ${d.site.name}` },
    description: d.site.description,
    alternates: alternatesFor("/", locale),
  };
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = await getLocale(params);
  const dict = getDictionary(locale);
  return (
    <html lang={locale === "es" ? "es-MX" : "en"}>
      <body className="min-h-screen antialiased">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-sv-yellow focus:px-4 focus:py-2 focus:font-bold">
          {dict.nav.skip}
        </a>
        <Header locale={locale} nav={dict.nav} />
        <main id="contenido">{children}</main>
        <Footer locale={locale} dict={dict} />
        <BottomNav locale={locale} nav={dict.nav} />
      </body>
    </html>
  );
}
