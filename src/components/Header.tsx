"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, Search, X } from "lucide-react";
import type { Locale } from "@/content/schemas";
import type { Dict } from "@/i18n/dictionaries";
import { href, switchLocalePath } from "@/i18n/routes";
import { useFavorites } from "@/hooks/useFavorites";
import { Logo } from "./Logo";

export function Header({ locale, nav: t }: { locale: Locale; nav: Dict["nav"] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const { count } = useFavorites();
  const other: Locale = locale === "es" ? "en" : "es";
  const nav = [
    { label: t.home, to: href(locale, null) },
    { label: t.free, to: href(locale, "gratis") },
    { label: t.cheapEats, to: href(locale, "comer-barato") },
    { label: t.offers, to: href(locale, "ofertas") },
    { label: t.secret, to: href(locale, "lugares-secretos") },
    { label: t.blog, to: href(locale, "blog") },
    { label: t.map, to: href(locale, "mapa") },
  ];
  const isActive = (to: string) => (to === href(locale, null) ? pathname === to : pathname.startsWith(to));

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Logo href={href(locale, null)} className="shrink-0" />
        <nav aria-label={t.main} className="ml-4 hidden flex-1 items-center gap-5 lg:flex">
          {nav.map((n) => (
            <Link key={n.to} href={n.to} aria-current={isActive(n.to) ? "page" : undefined}
              className={`text-xs font-extrabold uppercase tracking-wide hover:text-sv-pink ${isActive(n.to) ? "border-b-[3px] border-sv-yellow" : ""}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href={switchLocalePath(pathname, other)} hrefLang={other} lang={other} aria-label={`${t.language}: ${other === "es" ? "Español" : "English"}`}
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-xs font-extrabold uppercase ring-1 ring-black/15 hover:bg-sv-gray">
            {other}
          </Link>
          <Link href={href(locale, "buscar")} aria-label={t.search} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-sv-gray">
            <Search aria-hidden className="h-5 w-5" />
          </Link>
          <Link href={href(locale, "favoritos")} className="hidden h-11 items-center gap-2 rounded-xl bg-sv-yellow px-4 text-xs font-extrabold uppercase sm:inline-flex">
            <Heart aria-hidden className="h-4 w-4" />{t.saved}{count > 0 && <span className="rounded-full bg-sv-black px-1.5 text-white" aria-label={`${count}`}>{count}</span>}
          </Link>
          <button type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? t.closeMenu : t.menu}
            onClick={() => setOpen((o) => !o)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sv-yellow lg:hidden">
            {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label={t.main} className="border-t border-black/5 bg-white px-4 pb-4 lg:hidden">
          <ul className="grid gap-1 pt-2">
            {nav.map((n) => (
              <li key={n.to}>
                <Link href={n.to} onClick={() => setOpen(false)} aria-current={isActive(n.to) ? "page" : undefined}
                  className={`flex min-h-12 items-center rounded-xl px-3 text-sm font-extrabold uppercase ${isActive(n.to) ? "bg-sv-yellow" : "hover:bg-sv-gray"}`}>
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={href(locale, "favoritos")} onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-xl px-3 text-sm font-extrabold uppercase hover:bg-sv-gray">
                {t.saved}{count > 0 ? ` (${count})` : ""}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
