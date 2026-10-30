"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { readableOn } from "@/lib/colors";

export interface RouteMapData {
  color: string;
  paths: { id: string; name: string; coordinates: [number, number][] }[];
  stops: { name: string; lat: number; lng: number; pathId?: string }[];
  nearby: { key: string; title: string; href: string; hex: string; distance: number; lat: number; lng: number; approx: boolean }[];
}

export interface RouteMapLabels {
  map: string; direction: string; showNearby: string; legendRoute: string; legendStop: string; legendPlace: string;
  start: string; end: string; away: string; approx: string; loading: string; error: string; details: string;
}

const CANCUN: [number, number] = [21.1619, -86.8515];

export function RouteMap({ data, labels }: { data: RouteMapData; labels: RouteMapLabels }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const [ready, setReady] = useState<"loading" | "ok" | "error">("loading");
  const [pathId, setPathId] = useState(data.paths[0].id);
  const [showNearby, setShowNearby] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        if (cancelled || !el.current || map.current) return;
        const m = L.map(el.current, { scrollWheelZoom: false }).setView(CANCUN, 12);
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
      const path = data.paths.find((p) => p.id === pathId) ?? data.paths[0];
      const bounds: [number, number][] = [...path.coordinates];

      // Casing + línea del recorrido
      L.polyline(path.coordinates, { color: "#111111", weight: 9, opacity: 0.85, lineCap: "round", lineJoin: "round" }).addTo(lg);
      L.polyline(path.coordinates, { color: data.color, weight: 5, lineCap: "round", lineJoin: "round" }).addTo(lg);

      // Paradas aproximadas
      for (const s of data.stops.filter((s) => !s.pathId || s.pathId === path.id)) {
        L.circleMarker([s.lat, s.lng], { radius: 6, color: data.color, weight: 3, fillColor: "#ffffff", fillOpacity: 1 })
          .bindTooltip(s.name).addTo(lg);
        bounds.push([s.lat, s.lng]);
      }

      // Inicio y final
      const badge = (txt: string, bg: string) => L.divIcon({
        className: "sv-marker", iconSize: [30, 30], iconAnchor: [15, 15],
        html: `<span style="background:${bg};color:${readableOn(bg)};display:flex;align-items:center;justify-content:center;font:800 13px/1 sans-serif">${txt}</span>`,
      });
      L.marker(path.coordinates[0], { icon: badge("A", "#ffffff"), title: labels.start, alt: labels.start }).bindTooltip(labels.start).addTo(lg);
      L.marker(path.coordinates[path.coordinates.length - 1], { icon: badge("B", "#FFD600"), title: labels.end, alt: labels.end }).bindTooltip(labels.end).addTo(lg);

      // Lugares cercanos
      if (showNearby) {
        for (const n of data.nearby) {
          const wrap = document.createElement("div");
          const h = document.createElement("strong"); h.textContent = n.title; wrap.append(h);
          const d = document.createElement("p"); d.style.margin = "4px 0"; d.textContent = labels.away.replace("{m}", String(n.distance)) + (n.approx ? ` · ${labels.approx}` : ""); wrap.append(d);
          const a = document.createElement("a"); a.href = n.href; a.textContent = labels.details; a.style.fontWeight = "700"; wrap.append(a);
          L.marker([n.lat, n.lng], {
            icon: L.divIcon({ className: "sv-marker", iconSize: [28, 28], iconAnchor: [14, 14], html: `<span style="background:${n.hex}"></span>` }),
            title: n.title, alt: n.title, zIndexOffset: 500,
          }).bindPopup(wrap).addTo(lg);
          bounds.push([n.lat, n.lng]);
        }
      }
      map.current!.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    })();
  }, [ready, pathId, showNearby, data, labels]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {data.paths.length > 1 && (
          <div role="group" aria-label={labels.direction} className="flex gap-2">
            {data.paths.map((p) => (
              <button key={p.id} type="button" aria-pressed={pathId === p.id} onClick={() => setPathId(p.id)}
                className={`min-h-11 rounded-full px-4 text-xs font-extrabold uppercase ring-1 transition ${pathId === p.id ? "bg-sv-black text-white ring-sv-black" : "bg-white ring-black/15 hover:bg-sv-gray"}`}>{p.name}</button>
            ))}
          </div>
        )}
        {data.nearby.length > 0 && (
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={showNearby} onChange={(e) => setShowNearby(e.target.checked)} className="h-5 w-5 accent-[#FF2D78]" />{labels.showNearby}
          </label>
        )}
      </div>
      <div className="relative">
        <div ref={el} role="region" aria-label={labels.map} className="h-[55vh] min-h-72 w-full overflow-hidden rounded-2xl bg-sv-gray ring-1 ring-black/10 lg:h-[34rem]" />
        {ready === "loading" && <p role="status" className="absolute inset-0 flex items-center justify-center text-sm">{labels.loading}</p>}
        {ready === "error" && <p role="alert" className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-red-800">{labels.error}</p>}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-700" aria-label="Leyenda">
        <li className="flex items-center gap-1.5"><span aria-hidden className="h-1.5 w-6 rounded-full" style={{ background: data.color }} />{labels.legendRoute}</li>
        <li className="flex items-center gap-1.5"><span aria-hidden className="h-3 w-3 rounded-full border-[3px] bg-white" style={{ borderColor: data.color }} />{labels.legendStop}</li>
        <li className="flex items-center gap-1.5"><span aria-hidden className="h-3.5 w-3.5 rounded-full border-2 border-sv-black bg-sv-pink" />{labels.legendPlace}</li>
      </ul>
    </div>
  );
}
