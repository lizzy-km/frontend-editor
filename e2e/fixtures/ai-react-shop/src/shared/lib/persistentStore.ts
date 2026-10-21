import { readJson, writeJson } from "@/shared/lib/storage";

export type PersistentStore<T> = {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
};

// Creates a small value holder that is saved in the browser and can be watched by components.
export function createPersistentStore<T>(key: string, initial: T): PersistentStore<T> {
  let value = readJson<T>(key, initial);
  const listeners = new Set<() => void>();

  return {
    get: () => value,
    set: (next) => {
      value = next;
      writeJson(key, next);
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
