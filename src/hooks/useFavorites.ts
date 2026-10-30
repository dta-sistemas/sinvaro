"use client";
import { useSyncExternalStore } from "react";
import { favoritesStore } from "@/lib/favorites";

export function useFavorites() {
  const keys = useSyncExternalStore(favoritesStore.subscribe, favoritesStore.getSnapshot, favoritesStore.getServerSnapshot);
  return {
    keys,
    count: keys.length,
    has: (key: string) => keys.includes(key),
    toggle: favoritesStore.toggle,
    remove: favoritesStore.remove,
  };
}
