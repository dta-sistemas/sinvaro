"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Map, Ticket, TreePalm } from "lucide-react";
import type { Locale } from "@/content/schemas";
import type { Dict } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";

export function BottomNav({ locale, nav }: { locale: Locale; nav: Dict["nav"] }) {
  const pathname = usePathname() || "/";
  const items = [
    { label: nav.home, to: href(locale, null), I: Home },
    { label: nav.bottomFree, to: href(locale, "gratis"), I: TreePalm },
    { label: nav.offers, to: href(locale, "ofertas"), I: Ticket },
    { label: nav.map, to: href(locale, "mapa"), I: Map },
    { label: nav.saved, to: href(locale, "favoritos"), I: Heart },
  ];
  return (
    <nav aria-label={nav.bottom} className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ label, to, I }) => {
          const active = to === href(locale, null) ? pathname === to : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link href={to} aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.65rem] font-bold ${active ? "text-sv-pink" : "text-neutral-700"}`}>
                <I aria-hidden className="h-5 w-5" />{label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
