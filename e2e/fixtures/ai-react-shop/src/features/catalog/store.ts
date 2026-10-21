import { createPersistentStore } from "@/shared/lib/persistentStore";
import { FAVOURITES_STORAGE_KEY } from "./constants";

export const favouritesStore = createPersistentStore<string[]>(FAVOURITES_STORAGE_KEY, []);
