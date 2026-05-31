import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartApi } from "@/lib/api-client";
import { CartDto, CartItemDto } from "@/types/api";
import { useDesignStore } from "@/lib/store";

export interface CartItem {
  id: string; // This is the variantId from backend
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  phoneModel?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem, userId?: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  fetchCart: (userId: string) => Promise<void>;
  loadUserCart: (userId: string) => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (item, userId) => {
        // Local state update
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          let newItems;
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            );
          } else {
            newItems = [...state.items, item];
          }
          const activeUserId = userId || useDesignStore.getState().user?.id;
          if (activeUserId && typeof window !== "undefined") {
            localStorage.setItem(
              `mirai_cart_${activeUserId}`,
              JSON.stringify(newItems),
            );
          }
          return { items: newItems };
        });

        // Backend sync if user is logged in
        const activeUserId = userId || useDesignStore.getState().user?.id;
        if (activeUserId) {
          try {
            await cartApi.createCartItem({
              userId: activeUserId,
              variantId: item.id,
              quantity: item.quantity,
            });
          } catch (error) {
            console.error("Failed to sync cart item with backend:", error);
          }
        }
      },
      removeItem: async (id) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          const userId = useDesignStore.getState().user?.id;
          if (userId && typeof window !== "undefined") {
            localStorage.setItem(
              `mirai_cart_${userId}`,
              JSON.stringify(newItems),
            );
          }
          return { items: newItems };
        });

        // Backend sync if user is logged in
        const activeUserId = useDesignStore.getState().user?.id;
        if (activeUserId) {
          try {
            await cartApi.deleteCartItem(activeUserId, id);
          } catch (error) {
            console.error("Failed to delete cart item from backend:", error);
          }
        }
      },
      updateQuantity: (id, quantity) =>
        set((state) => {
          const newItems = state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.max(1, Math.min(quantity, 10)) }
              : i,
          );
          const userId = useDesignStore.getState().user?.id;
          if (userId && typeof window !== "undefined") {
            localStorage.setItem(
              `mirai_cart_${userId}`,
              JSON.stringify(newItems),
            );
          }
          return { items: newItems };
        }),
      clearCart: () => set({ items: [] }),
      fetchCart: async (userId: string) => {
        try {
          const response = (await cartApi.getCartById({
            userId,
          })) as unknown as CartDto & { items?: (CartItemDto & CartDto)[] };
          if (response) {
            // Check if response is PagedResult<CartDto> (items of CartDto) or a CartDto directly
            const cartDto =
              response.items &&
              Array.isArray(response.items) &&
              response.items.length > 0 &&
              ("items" in response.items[0] || "cartId" in response.items[0])
                ? response.items[0]
                : response;

            if (cartDto && cartDto.items) {
              // Map backend cart items to local CartItem type
              const newItems = (cartDto.items as CartItemDto[]).map(
                (item: CartItemDto) => ({
                  id: item.variantId || "",
                  name: item.productName || "Sản phẩm",
                  price: item.price || 0,
                  quantity: item.quantity || 1,
                  imageUrl: item.image,
                }),
              );
              // Filter out any invalid items
              const validItems = newItems.filter((i: CartItem) => i.id !== "");
              set({ items: validItems });
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  `mirai_cart_${userId}`,
                  JSON.stringify(validItems),
                );
              }
            } else {
              set({ items: [] });
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  `mirai_cart_${userId}`,
                  JSON.stringify([]),
                );
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch cart from backend:", error);
        }
      },
      loadUserCart: (userId: string) => {
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(`mirai_cart_${userId}`);
          if (saved) {
            try {
              const items = JSON.parse(saved);
              // Clean up any corrupted items from local storage
              const validItems = Array.isArray(items)
                ? items.filter((i: CartItem) => i && i.id && i.id !== "")
                : [];
              set({ items: validItems });
            } catch (e) {
              console.error("Failed to parse saved cart:", e);
            }
          } else {
            set({ items: [] });
          }
        }
      },
      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },
      getSubtotal: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "mirai-cart-storage",
    },
  ),
);
