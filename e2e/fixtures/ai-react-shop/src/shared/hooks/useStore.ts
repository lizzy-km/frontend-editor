import { useSyncExternalStore } from "react";
import type { PersistentStore } from "@/shared/lib/persistentStore";

// Gives a component the current value of a persistent store and re-renders it on change.
export function useStore<T>(store: PersistentStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get);
}
