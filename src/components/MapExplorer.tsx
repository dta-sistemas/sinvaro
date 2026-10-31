"use client";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import type { CardItem } from "@/lib/cards";
import { fmt, type Dict } from "@/i18n/dictionaries";
import { COLOR } from "@/lib/colors";
import { applyFilters } from "@/lib/filters";
import { Chip } from "./CollectionBrowser";
import { Icon } from "./ui";

const CANCUN: [number, number] = [21.1619, -86.8515];
const KINDS = ["place", "restaurant", "offer"] as const;

export function MapExplorer({ items, dict }: { items: CardItem[]; dict: Dict }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const [ready, setReady] = useState<"loading" | "ok" | "error">("loading");
  const [kind, setKind] = useState<string | undefined>();
  const t = dict.pages.map;

  const withKind = useMemo(() => items.map((i) => ({ ...i, filters: { ...i.filters, kind: [i.type] } })), [items]);
  const visible = useMemo(() => applyFilters(withKind, { kind }), [withKind, kind]);
  const located = visible.filter((i) => i.coords);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        if (cancelled || !el.current || map.current) return;
        const m = L.map(el.current, { scrollWheelZoom: false }).setView(CANCUN, 11);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(m);
        map.current = m;
        layer.current = L.layerGroup().addTo(m);
        setReady("ok");
      } catch { if (!cancelled) setReady("error"); }
    })();
    return () => { cancelled = true; map.current?.remove(); map.current = null; layer.current = null; };
  }, []);

  useEffect(() => {
    if (ready !== "ok" || !map.current || !layer.current) return;
    (async () => {
      const L = (await import("leaflet")).default;
      const lg = layer.current!; lg.clearLayers();
      const pts: [number, number][] = [];
      for (const it of located) {
        const { lat, lng, approx } = it.coords!;
        const icon = L.divIcon({
          className: "sv-marker", iconSize: [28, 28], iconAnchor: [14, 14],
          html: `<span style="background:${COLOR[it.color].hex}"></span>`,
        });
        const wrap = document.createElement("div");
        const h = document.createElement("strong"); h.textContent = it.title; wrap.append(h);
        if (approx) { const p = document.createElement("p"); p.textContent = dict.labels.approx; p.style.margin = "4px 0"; wrap.append(p); }
        const a = document.createElement("a"); a.href = it.href; a.textContent = dict.labels.details; a.style.display = "block"; a.style.fontWeight = "700"; wrap.append(a);
        L.marker([lat, lng], { icon, title: it.title, alt: it.title }).bindPopup(wrap).addTo(lg);
        pts.push([lat, lng]);
      }
      if (pts.length > 1) map.current!.fitBounds(pts, { padding: [40, 40], maxZoom: 14 });
      else if (pts.length === 1) map.current!.setView(pts[0], 14);
      else map.current!.setView(CANCUN, 11);
    })();
  }, [ready, located, dict.labels]);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="order-2 lg:order-1">
        <div role="group" aria-label={dict.filters.category} className="mb-3 flex flex-wrap gap-2">
          <Chip active={!kind} onClick={() => setKind(undefined)}>{dict.filters.all}</Chip>
          {KINDS.map((k) => (<Chip key={k} active={kind === k} onClick={() => setKind(k)}>{dict.pages.search.types[k]}</Chip>))}
        </div>
        <h2 className="sr-only">{t.list}</h2>
        <p aria-live="polite" className="mb-2 text-sm font-semibold">{fmt(t.showing, { n: located.length })}</p>
        <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
          {visible.map((it) => (
            <li key={it.key}>
              <Link href={it.href} className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-black/10 hover:bg-sv-gray">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${COLOR[it.color].bg}`}><Icon name={it.icon} className="h-4 w-4" /></span>
                <span className="min-w-0 text-sm"><span className="block truncate font-bold">{it.title}</span>
                  <span className="block truncate text-xs text-neutral-600">{it.coords ? it.area : `${it.area ?? ""} · ${t.noCoords}`}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative order-1 lg:sticky lg:top-24 lg:order-2 lg:self-start">
        <div ref={el} role="region" aria-label={t.seoTitle} className="h-[60vh] min-h-80 w-full overflow-hidden rounded-2xl bg-sv-gray ring-1 ring-black/10 lg:h-[34rem]" />
        {ready === "loading" && <p role="status" className="absolute inset-0 flex items-center justify-center text-sm">{t.loading}</p>}
        {ready === "error" && <p role="alert" className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-red-800">{t.error}</p>}
      </div>
    </div>
  );
}
