import { useStore } from "@/shared/hooks/useStore";
import { favouritesStore } from "../store";

export type FavouritesApi = {
  ids: string[];
  isFavourite: (productId: string) => boolean;
  toggleFavourite: (productId: string) => void;
};

// Gives a component the saved favourite product ids and a way to add or remove one.
export function useFavourites(): FavouritesApi {
  const ids = useStore(favouritesStore);

  return {
    ids,
    isFavourite: (productId) => ids.includes(productId),
    toggleFavourite: (productId) => {
      const current = favouritesStore.get();
      favouritesStore.set(
        current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
      );
    },
  };
}
