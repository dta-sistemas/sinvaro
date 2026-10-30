"use client";
import { useMemo, useState } from "react";
import type { CardItem } from "@/lib/cards";
import { fmt, type Dict } from "@/i18n/dictionaries";
import { applyFilters, type FilterGroup } from "@/lib/filters";
import { EmptyState } from "./ui";
import { ItemCard } from "./cards";


export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-extrabold uppercase tracking-wide ring-1 transition ${active ? "bg-sv-black text-white ring-sv-black" : "bg-white text-sv-black ring-black/15 hover:bg-sv-gray"}`}>
      {children}
    </button>
  );
}

export function CollectionBrowser({ items, groups, dict, pageSize = 12, note, emptyKind = "collection" }: {
  items: CardItem[]; groups: FilterGroup[]; dict: Dict; pageSize?: number; note?: string; emptyKind?: "collection" | "offers";
}) {
  const [selected, setSelected] = useState<Record<string, string | undefined>>({});
  const [visible, setVisible] = useState(pageSize);
  const f = dict.filters;
  const filtered = useMemo(() => applyFilters(items, selected), [items, selected]);
  const shown = filtered.slice(0, visible);
  const anySelected = Object.values(selected).some(Boolean);

  const pick = (key: string, value: string | undefined) => { setSelected((s) => ({ ...s, [key]: value })); setVisible(pageSize); };

  return (
    <div>
      {items.length > 0 && groups.map((g) => (
        <div key={g.key} role="group" aria-label={g.label} className="mb-3">
          {groups.length > 1 && <p className="mb-1.5 text-xs font-extrabold uppercase tracking-widest text-neutral-600">{g.label}</p>}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <Chip active={!selected[g.key]} onClick={() => pick(g.key, undefined)}>{f.all}</Chip>
            {g.options.map((o) => (
              <Chip key={o.value} active={selected[g.key] === o.value} onClick={() => pick(g.key, o.value)}>{o.label}</Chip>
            ))}
          </div>
        </div>
      ))}
      {note && items.length > 0 && <p className="mb-3 text-xs text-neutral-600">{note}</p>}
      <p aria-live="polite" className="mb-4 mt-2 text-sm font-semibold text-neutral-700">
        {filtered.length === 1 ? f.result1 : fmt(f.results, { n: filtered.length })}
        {anySelected && (
          <button type="button" onClick={() => { setSelected({}); setVisible(pageSize); }} className="ml-3 min-h-11 font-extrabold underline">{f.clear}</button>
        )}
      </p>

      {items.length === 0 ? (
        <EmptyState
          title={emptyKind === "offers" ? dict.pages.offers.emptyTitle : f.emptyCollectionTitle}
          text={emptyKind === "offers" ? dict.pages.offers.emptyText : f.emptyCollectionText}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title={f.noResultsTitle} text={f.noResultsText}
          action={<button type="button" onClick={() => setSelected({})} className="min-h-11 rounded-xl bg-sv-yellow px-5 text-sm font-extrabold uppercase">{f.clear}</button>} />
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((it) => (<li key={it.key}><ItemCard item={it} labels={dict.labels} /></li>))}
          </ul>
          {filtered.length > shown.length && (
            <div className="mt-8 text-center">
              <button type="button" onClick={() => setVisible((v) => v + pageSize)} className="min-h-12 rounded-xl bg-sv-pink px-8 text-sm font-extrabold uppercase text-white">{f.showMore}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { applyFilters, type FilterGroup };
