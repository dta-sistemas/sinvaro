"use client";
import { useSyncExternalStore } from "react";
import type { CardItem } from "@/lib/cards";
import type { Dict } from "@/i18n/dictionaries";
import { useFavorites } from "@/hooks/useFavorites";
import { ItemCard } from "./cards";
import { EmptyState } from "./ui";

const noop = () => () => {};

export function FavoritesClient({ cards, dict }: { cards: CardItem[]; dict: Dict }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const { keys } = useFavorites();
  if (!hydrated) return <p className="text-neutral-600" role="status">…</p>;
  const saved = keys.map((k) => cards.find((c) => c.key === k)).filter((c): c is CardItem => !!c);
  if (saved.length === 0) return <EmptyState title={dict.pages.favorites.emptyTitle} text={dict.pages.favorites.emptyText} />;
  return (
    <>
      <p className="mb-4 text-xs text-neutral-600">{dict.pages.favorites.localNote}</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {saved.map((it) => (<li key={it.key}><ItemCard item={it} labels={dict.labels} routeLabels={dict.pages.routes} /></li>))}
      </ul>
    </>
  );
}
