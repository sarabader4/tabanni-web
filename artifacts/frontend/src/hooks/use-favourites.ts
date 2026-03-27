import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMyFavourites,
  useToggleFavourite,
  getGetMyFavouritesQueryKey,
  type Pet,
} from "@workspace/api-client-react";
import { useCurrentUser } from "./use-current-user";

export function useFavourites() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const queryClient = useQueryClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: favourites, isLoading: favLoading } = useGetMyFavourites({
    query: { enabled: !!user } as any,
  });

  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const pendingIdsRef = useRef(pendingIds);
  pendingIdsRef.current = pendingIds;

  const toggleMutation = useToggleFavourite();

  const favouriteIds = new Set((favourites ?? []).map((p) => p.id));

  const isFavourited = useCallback(
    (petId: number) => favouriteIds.has(petId),
    [favouriteIds],
  );

  const isPendingFor = useCallback(
    (petId: number) => pendingIds.has(petId),
    [pendingIds],
  );

  const toggleFavourite = useCallback(
    async (petId: number) => {
      if (!user) return false;
      if (pendingIdsRef.current.has(petId)) return false;

      const queryKey = getGetMyFavouritesQueryKey();
      const wasAdded = !favouriteIds.has(petId);

      setPendingIds((prev) => new Set(prev).add(petId));

      queryClient.setQueryData<Pet[]>(queryKey, (old) => {
        if (!old) return old;
        if (wasAdded) {
          return [...old, { id: petId } as Pet];
        }
        return old.filter((p) => p.id !== petId);
      });

      try {
        await toggleMutation.mutateAsync({ id: petId, data: { userId: user.id } });
      } catch {
        queryClient.setQueryData<Pet[]>(queryKey, (old) => {
          if (!old) return old;
          if (wasAdded) {
            return old.filter((p) => p.id !== petId);
          }
          return [...old, { id: petId } as Pet];
        });
      } finally {
        queryClient.invalidateQueries({ queryKey });
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(petId);
          return next;
        });
      }

      return true;
    },
    [user, favouriteIds, queryClient, toggleMutation],
  );

  return {
    isLoggedIn: !!user,
    isLoading: userLoading || favLoading,
    isFavourited,
    isPendingFor,
    toggleFavourite,
    isPending: toggleMutation.isPending,
  };
}
