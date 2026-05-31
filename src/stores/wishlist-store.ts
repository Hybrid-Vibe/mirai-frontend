import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useDesignStore } from "@/lib/store";

interface WishlistState {
  wishlistProductIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  loadUserWishlist: (userId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistProductIds: [],
      toggleWishlist: (productId) => {
        set((state) => {
          const exists = state.wishlistProductIds.includes(productId);
          let newIds;
          if (exists) {
            newIds = state.wishlistProductIds.filter((id) => id !== productId);
          } else {
            newIds = [...state.wishlistProductIds, productId];
          }
          const userId = useDesignStore.getState().user?.id;
          if (userId && typeof window !== "undefined") {
            localStorage.setItem(
              `mirai_wishlist_${userId}`,
              JSON.stringify(newIds),
            );
          }
          return {
            wishlistProductIds: newIds,
          };
        });
      },
      isInWishlist: (productId) => {
        return get().wishlistProductIds.includes(productId);
      },
      clearWishlist: () => set({ wishlistProductIds: [] }),
      loadUserWishlist: (userId) => {
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(`mirai_wishlist_${userId}`);
          if (saved) {
            try {
              const wishlistProductIds = JSON.parse(saved);
              set({ wishlistProductIds });
            } catch (e) {
              console.error("Failed to parse saved wishlist:", e);
            }
          } else {
            set({ wishlistProductIds: [] });
          }
        }
      },
    }),
    {
      name: "mirai-wishlist-storage",
    },
  ),
);
