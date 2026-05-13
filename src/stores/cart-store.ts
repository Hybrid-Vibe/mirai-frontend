import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartApi } from "@/lib/api-client";

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
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
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
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        });

        // Backend sync if user is logged in
        if (userId) {
          try {
            await cartApi.createCartItem({
              userId,
              variantId: item.id,
              quantity: item.quantity,
            });
          } catch (error) {
            console.error("Failed to sync cart item with backend:", error);
          }
        }
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.max(1, Math.min(quantity, 10)) }
              : i,
          ),
        })),
      clearCart: () => set({ items: [] }),
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
