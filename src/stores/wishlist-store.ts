import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  wishlistProductIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistProductIds: [],
      toggleWishlist: (productId) => {
        set((state) => {
          const exists = state.wishlistProductIds.includes(productId);
          if (exists) {
            return {
              wishlistProductIds: state.wishlistProductIds.filter(
                (id) => id !== productId,
              ),
            };
          }
          return {
            wishlistProductIds: [...state.wishlistProductIds, productId],
          };
        });
      },
      isInWishlist: (productId) => {
        return get().wishlistProductIds.includes(productId);
      },
      clearWishlist: () => set({ wishlistProductIds: [] }),
    }),
    {
      name: "mirai-wishlist-storage",
    },
  ),
);
