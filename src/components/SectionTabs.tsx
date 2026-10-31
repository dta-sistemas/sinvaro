"use client";
import { useEffect, useState } from "react";

/** Pestañas ancladas y fijas bajo el header; resaltan la sección visible al hacer scroll. */
export function SectionTabs({ tabs, label }: { tabs: { id: string; label: string }[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.id);

  useEffect(() => {
    const els = tabs.map((t) => document.getElementById(t.id)).filter((e): e is HTMLElement => !!e);
    if (!("IntersectionObserver" in window) || els.length === 0) return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? visible.set(e.target.id, e.boundingClientRect.top) : visible.delete(e.target.id);
        const first = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
        if (first) setActive(first[0]);
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: 0 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [tabs]);

  return (
    <nav aria-label={label} className="sticky top-16 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
        {tabs.map((t) => (
          <li key={t.id} className="shrink-0">
            <a href={`#${t.id}`} aria-current={active === t.id ? "true" : undefined} onClick={() => setActive(t.id)}
              className={`inline-flex min-h-12 items-center border-b-[3px] px-4 text-sm font-bold transition ${active === t.id ? "border-sv-pink text-sv-pink" : "border-transparent text-neutral-700 hover:text-sv-black"}`}>
              {t.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
