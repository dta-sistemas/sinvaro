"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

/** Mapa pequeño con un solo pin (Leaflet + OpenStreetMap). */
export function PlaceMap({ lat, lng, title, hex, label, loading, error }: { lat: number; lng: number; title: string; hex: string; label: string; loading: string; error: string }) {
  const el = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let map: LeafletMap | null = null;
    let cancelled = false;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        if (cancelled || !el.current) return;
        map = L.map(el.current, { scrollWheelZoom: false }).setView([lat, lng], 14);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
        L.marker([lat, lng], {
          icon: L.divIcon({ className: "sv-marker", iconSize: [28, 28], iconAnchor: [14, 14], html: `<span style="background:${hex}"></span>` }),
          title, alt: title,
        }).bindTooltip(title, { permanent: true, direction: "right", offset: [14, 0] }).addTo(map);
        setState("ok");
      } catch { if (!cancelled) setState("error"); }
    })();
    return () => { cancelled = true; map?.remove(); };
  }, [lat, lng, title, hex]);

  return (
    <div className="relative">
      <div ref={el} role="region" aria-label={label} className="h-56 w-full overflow-hidden rounded-2xl bg-sv-gray ring-1 ring-black/10 sm:h-64" />
      {state === "loading" && <p role="status" className="absolute inset-0 flex items-center justify-center text-sm">{loading}</p>}
      {state === "error" && <p role="alert" className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm font-semibold text-red-800">{error}</p>}
    </div>
  );
}
