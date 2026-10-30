import Link from "next/link";
import type { Locale, Route } from "@/content/schemas";
import type { Dict } from "@/i18n/dictionaries";
import { href } from "@/i18n/routes";
import { readableOn } from "@/lib/colors";
import { fmt } from "@/i18n/dictionaries";

/** Bloque "Cómo llegar en autobús" para fichas de lugar/restaurante: rutas que pasan cerca. */
export function RoutesNearby({ routes, locale, dict, radius }: { routes: (Route & { distance: number })[]; locale: Locale; dict: Dict; radius: number }) {
  if (routes.length === 0) return null;
  const t = dict.pages.routes;
  return (
    <section className="mt-8" aria-labelledby="reach">
      <h2 id="reach" className="mb-1 font-display text-2xl">{t.reach}</h2>
      <p className="mb-3 text-sm text-neutral-700">{fmt(t.reachIntro, { m: radius })}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {routes.map((r) => (
          <li key={r.id}>
            <Link href={href(locale, "como-llegar", r.slug)} className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-black/10 transition hover:bg-sv-gray">
              <span className="flex h-11 min-w-14 items-center justify-center rounded-lg px-2 font-display text-lg" style={{ background: r.color, color: readableOn(r.color) }}>{r.code}</span>
              <span className="min-w-0 text-sm"><span className="block truncate font-bold">{r.name[locale]}</span><span className="block text-xs text-neutral-600">{fmt(t.away, { m: r.distance })}</span></span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-neutral-600">{t.disclaimer}</p>
    </section>
  );
}
