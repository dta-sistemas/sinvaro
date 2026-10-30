import Link from "next/link";
import type { Locale } from "@/content/schemas";
import type { Dict } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import site from "../../content/site.json";
import { Logo } from "./Logo";
import { NewsletterForm } from "./forms";

export function Footer({ locale, dict, showRoutes }: { locale: Locale; dict: Dict; showRoutes: boolean }) {
  const socials = site.socials as { label: string; url: string }[];
  const links = [
    [dict.nav.free, href(locale, "gratis")], [dict.nav.cheapEats, href(locale, "comer-barato")], [dict.nav.offers, href(locale, "ofertas")],
    [dict.nav.secret, href(locale, "lugares-secretos")],
    ...(showRoutes ? [[dict.nav.getAround, href(locale, "como-llegar")]] : []), [dict.nav.blog, href(locale, "blog")], [dict.nav.map, href(locale, "mapa")],
  ];
  return (
    <footer className="mt-16 bg-sv-black pb-24 text-white lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="[&_span]:!text-white [&_span:last-child]:!text-sv-black"><Logo href={href(locale, null)} /></div>
          <p className="mt-4 max-w-xs text-sm text-neutral-300">{dict.footer.text}</p>
          {socials.length > 0 && (
            <ul aria-label={dict.footer.socials} className="mt-4 flex flex-wrap gap-3 text-sm">
              {socials.map((s) => (<li key={s.url}><a href={s.url} rel="noopener noreferrer" target="_blank" className="underline">{s.label}</a></li>))}
            </ul>
          )}
        </div>
        <nav aria-label={dict.footer.navTitle}>
          <h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-sv-yellow">{dict.footer.navTitle}</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {links.map(([label, to]) => (<li key={to}><Link href={to} className="hover:underline">{label}</Link></li>))}
          </ul>
        </nav>
        <nav aria-label={dict.footer.legalTitle}>
          <h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-sv-yellow">{dict.footer.legalTitle}</h2>
          <ul className="grid gap-2 text-sm">
            <li><Link href={href(locale, "terminos")} className="hover:underline">{dict.footer.terms}</Link></li>
            <li><Link href={href(locale, "privacidad")} className="hover:underline">{dict.footer.privacy}</Link></li>
            <li><Link href={href(locale, "contacto")} className="hover:underline">{dict.footer.contact}</Link></li>
            <li><Link href={`${href(locale, "contacto")}#colaboracion`} className="hover:underline">{dict.footer.collab}</Link></li>
          </ul>
        </nav>
        <div>
          <NewsletterForm locale={locale} dict={dict} compact />
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-neutral-400">{dict.footer.made}</p>
    </footer>
  );
}
