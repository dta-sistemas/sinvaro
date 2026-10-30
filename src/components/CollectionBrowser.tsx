"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { CardItem } from "@/lib/cards";
import { fmt, type Dict } from "@/i18n/dictionaries";
import { applyFilters, presentGroups, type FilterGroup } from "@/lib/filters";
import { matchesQuery } from "@/lib/text";
import { EmptyState } from "./ui";
import { ItemCard } from "./cards";

type Selected = Record<string, string | undefined>;

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-extrabold uppercase tracking-wide ring-1 transition active:scale-95 ${active ? "bg-sv-black text-white ring-sv-black" : "bg-white text-sv-black ring-black/15 hover:bg-sv-gray"}`}>
      {children}
    </button>
  );
}

/** Panel de filtros (columna fija en escritorio, hoja inferior en móvil). Radios nativos = accesible por teclado. */
function FilterPanel({ groups, selected, countFor, onPick, dict, uid }: {
  groups: FilterGroup[]; selected: Selected; countFor: (key: string, value: string | undefined) => number;
  onPick: (key: string, value: string | undefined) => void; dict: Dict; uid: string;
}) {
  return (
    <div className="grid gap-5">
      {groups.map((g) => (
        <fieldset key={g.key}>
          <legend className="mb-2 text-xs font-extrabold uppercase tracking-widest text-neutral-600">{g.label}</legend>
          <div className="grid gap-1">
            {[{ value: undefined as string | undefined, label: dict.filters.all }, ...g.options].map((o) => {
              const active = (selected[g.key] ?? undefined) === o.value;
              const n = countFor(g.key, o.value);
              const disabled = n === 0 && !active;
              return (
                <label key={o.value ?? "all"} className={`${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
                  <input type="radio" name={`${uid}-${g.key}`} className="peer sr-only" checked={active} disabled={disabled} onChange={() => onPick(g.key, o.value)} />
                  <span className={`flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 text-sm transition peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-sv-purple ${active ? "bg-sv-yellow font-extrabold" : "hover:bg-sv-gray"}`}>
                    <span>{o.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-sv-black text-white" : "bg-sv-gray text-neutral-600"}`}>{n}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export function CollectionBrowser({ items, groups: allGroups, dict, pageSize = 12, note, emptyKind = "collection" }: {
  items: CardItem[]; groups: FilterGroup[]; dict: Dict; pageSize?: number; note?: string; emptyKind?: "collection" | "offers" | "routes";
}) {
  const uid = useId();
  const dlg = useRef<HTMLDialogElement>(null);
  const groups = useMemo(() => presentGroups(items, allGroups), [items, allGroups]);
  const [selected, setSelected] = useState<Selected>({});
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(pageSize);
  const f = dict.filters;

  const textOk = (it: CardItem) => !q.trim() || matchesQuery(`${it.title} ${it.summary} ${it.area ?? ""} ${it.categoryName}`, q);
  const filtered = useMemo(() => applyFilters(items, selected).filter(textOk), [items, selected, q]); // eslint-disable-line react-hooks/exhaustive-deps
  const countFor = (key: string, value: string | undefined) => applyFilters(items, { ...selected, [key]: value }).filter(textOk).length;
  const shown = filtered.slice(0, visible);
  const activeEntries = groups.flatMap((g) => (selected[g.key] ? [{ key: g.key, label: g.options.find((o) => o.value === selected[g.key])?.label ?? "" }] : []));

  // Filtros compartibles por URL (?category=playas&q=...): se leen una vez y se escriben al cambiar.
  const synced = useRef(false);
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const init: Selected = {};
    for (const g of groups) { const v = sp.get(g.key); if (v && g.options.some((o) => o.value === v)) init[g.key] = v; }
    if (Object.keys(init).length) setSelected(init);
    const qq = sp.get("q"); if (qq) setQ(qq.slice(0, 60));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!synced.current) { synced.current = true; return; }
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(selected)) if (v) sp.set(k, v);
    if (q.trim()) sp.set("q", q.trim());
    const qs = sp.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
  }, [selected, q]);

  const pick = (key: string, value: string | undefined) => { setSelected((s) => ({ ...s, [key]: value })); setVisible(pageSize); };
  const clearAll = () => { setSelected({}); setQ(""); setVisible(pageSize); };
  const anyActive = activeEntries.length > 0 || q.trim() !== "";

  if (items.length === 0) {
    const empty = emptyKind === "offers" ? dict.pages.offers : emptyKind === "routes" ? dict.pages.routes : null;
    return <EmptyState title={empty ? empty.emptyTitle : f.emptyCollectionTitle} text={empty ? empty.emptyText : f.emptyCollectionText} />;
  }

  return (
    <div className={groups.length ? "grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start" : ""}>
      {groups.length > 0 && (
        <aside aria-label={f.title} className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto rounded-2xl bg-white p-4 ring-1 ring-black/10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl"><SlidersHorizontal aria-hidden className="h-5 w-5" />{f.title}</h2>
          <FilterPanel groups={groups} selected={selected} countFor={countFor} onPick={pick} dict={dict} uid={`${uid}-d`} />
          {note && <p className="mt-5 border-t border-black/10 pt-3 text-xs text-neutral-600">{note}</p>}
        </aside>
      )}

      <div className="min-w-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <label htmlFor={`${uid}-q`} className="sr-only">{f.searchList}</label>
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input id={`${uid}-q`} type="search" value={q} onChange={(e) => { setQ(e.target.value); setVisible(pageSize); }} placeholder={f.searchPlaceholder} maxLength={60}
              className="min-h-12 w-full rounded-xl border border-black/15 bg-white pl-10 pr-3 text-sm" />
          </div>
          {groups.length > 0 && (
            <button type="button" onClick={() => dlg.current?.showModal()} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-sv-yellow px-4 text-xs font-extrabold uppercase lg:hidden">
              <SlidersHorizontal aria-hidden className="h-4 w-4" />{f.title}{activeEntries.length > 0 && <span className="rounded-full bg-sv-black px-1.5 text-white">{activeEntries.length}</span>}
            </button>
          )}
        </div>

        {activeEntries.length > 0 && (
          <ul aria-label={f.title} className="mt-3 flex flex-wrap gap-2">
            {activeEntries.map((a) => (
              <li key={a.key}>
                <button type="button" onClick={() => pick(a.key, undefined)} aria-label={`${f.removeFilter}: ${a.label}`}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-sv-black px-3 text-xs font-bold text-white hover:bg-neutral-800">
                  {a.label}<X aria-hidden className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <p aria-live="polite" className="mb-4 mt-4 text-sm font-semibold text-neutral-700">
          {filtered.length === 1 ? f.result1 : fmt(f.results, { n: filtered.length })}
          {anyActive && <button type="button" onClick={clearAll} className="ml-3 min-h-11 font-extrabold underline">{f.clear}</button>}
        </p>

        {filtered.length === 0 ? (
          <EmptyState title={f.noResultsTitle} text={f.noResultsText}
            action={<button type="button" onClick={clearAll} className="min-h-11 rounded-xl bg-sv-yellow px-5 text-sm font-extrabold uppercase">{f.clear}</button>} />
        ) : (
          <>
            <ul className={`grid gap-4 sm:grid-cols-2 ${groups.length ? "xl:grid-cols-3" : "lg:grid-cols-3"}`}>
              {shown.map((it) => (<li key={it.key}><ItemCard item={it} labels={dict.labels} routeLabels={dict.pages.routes} /></li>))}
            </ul>
            {filtered.length > shown.length && (
              <div className="mt-8 text-center">
                <button type="button" onClick={() => setVisible((v) => v + pageSize)} className="min-h-12 rounded-xl bg-sv-pink px-8 text-sm font-extrabold uppercase text-white transition hover:brightness-95 active:scale-95">{f.showMore}</button>
              </div>
            )}
          </>
        )}
        {note && <p className="mt-6 text-xs text-neutral-600 lg:hidden">{note}</p>}
      </div>

      {groups.length > 0 && (
        <dialog ref={dlg} aria-labelledby={`${uid}-t`} onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }}
          className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none overflow-hidden rounded-t-3xl p-0 backdrop:bg-black/50 lg:hidden">
          <div className="flex max-h-[88vh] flex-col">
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
              <h2 id={`${uid}-t`} className="font-display text-xl">{f.title}</h2>
              <button type="button" onClick={() => dlg.current?.close()} aria-label={f.close} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-sv-gray"><X aria-hidden className="h-5 w-5" /></button>
            </div>
            <div className="overflow-y-auto px-5 py-4"><FilterPanel groups={groups} selected={selected} countFor={countFor} onPick={pick} dict={dict} uid={`${uid}-m`} /></div>
            <div className="flex gap-2 border-t border-black/10 bg-white px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={clearAll} className="min-h-12 rounded-xl px-4 text-sm font-extrabold underline">{f.clear}</button>
              <button type="button" onClick={() => dlg.current?.close()} className="min-h-12 flex-1 rounded-xl bg-sv-black px-4 text-sm font-extrabold uppercase text-white">{fmt(f.showResults, { n: filtered.length })}</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

export { applyFilters, type FilterGroup };
