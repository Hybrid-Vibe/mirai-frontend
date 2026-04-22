"use client";

import { useMemo, useState } from "react";
import { Eye, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const initialWishlistItems = [
  {
    id: "wl-1",
    name: "Case + Magsafe",
    price: "290.000đ",
    oldPrice: "390.000đ",
    badge: "-35%",
  },
  { id: "wl-2", name: "Phonecase", price: "120.000đ" },
  { id: "wl-3", name: "Phonecase", price: "120.000đ" },
  { id: "wl-4", name: "Phonecase", price: "120.000đ" },
];

const suggestedItems = [
  {
    id: "s-1",
    name: "Phonecase",
    price: "99.000đ",
    oldPrice: "150.000đ",
    badge: "-35%",
  },
  { id: "s-2", name: "Phonecase", price: "120.000đ" },
  { id: "s-3", name: "Phonecase", price: "120.000đ", badge: "NEW" },
  { id: "s-4", name: "Phonecase", price: "120.000đ" },
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(initialWishlistItems);
  const [movedToCartIds, setMovedToCartIds] = useState<string[]>([]);

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  const removeItem = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const moveToCart = (id: string) => {
    setMovedToCartIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const moveAllToCart = () => {
    setMovedToCartIds(wishlistItems.map((item) => item.id));
  };

  return (
    <main className="bg-background py-16">
      <div className="page-shell">
        <div className="mb-10 flex items-center justify-between border-b border-border/40 pb-6">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Wishlist ({wishlistCount})
          </h1>
          <Button
            type="button"
            variant="outline"
            className="min-w-44 rounded-[4px]"
            onClick={moveAllToCart}
          >
            Thêm vào Giỏ
          </Button>
        </div>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {wishlistItems.map((item) => (
            <article key={item.id}>
              <div className="relative rounded-[4px] bg-(--mirai-sem-surface-muted) p-4">
                {item.badge && (
                  <span className="absolute left-3 top-3 rounded-[4px] bg-(--mirai-sem-primary) px-2 py-1 text-xs font-semibold text-foreground">
                    {item.badge}
                  </span>
                )}
                <button
                  type="button"
                  className="absolute right-3 top-3"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Xóa ${item.name} khỏi wishlist`}
                >
                  <Trash2 className="h-5 w-5 text-foreground" />
                </button>
                <div className="mx-auto h-36 w-24 rounded-xl bg-gradient-to-br from-(--mirai-sem-text-muted) to-(--mirai-sem-accent)" />
                <Button
                  type="button"
                  size="sm"
                  variant={movedToCartIds.includes(item.id) ? "secondary" : "primary"}
                  className="mt-5 w-full rounded-[2px] bg-(--mirai-sem-text) text-(--mirai-sem-background)"
                  onClick={() => moveToCart(item.id)}
                >
                  {movedToCartIds.includes(item.id)
                    ? "Đã chuyển vào giỏ"
                    : "Thêm vào giỏ"}
                </Button>
              </div>
              <h2 className="mt-4 font-body text-base font-semibold text-foreground">
                {item.name}
              </h2>
              <p className="mt-1 text-sm text-(--mirai-sem-danger)">
                {item.price}{" "}
                {item.oldPrice && (
                  <span className="text-muted-foreground line-through">
                    {item.oldPrice}
                  </span>
                )}
              </p>
              <div className="mt-1 flex items-center gap-1 text-(--mirai-sem-warning)">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={`${item.id}-${i}`} className="h-3.5 w-3.5 fill-current" />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">(65)</span>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-16 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block h-8 w-2 rounded-sm bg-(--mirai-sem-accent)" />
            <h2 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
              Dành Cho Bạn
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            className="min-w-36 rounded-[4px]"
          >
            Xem Tất Cả
          </Button>
        </div>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {suggestedItems.map((item) => (
            <article key={item.id}>
              <div className="relative rounded-[4px] bg-(--mirai-sem-surface-muted) p-4">
                {item.badge && (
                  <span className="absolute left-3 top-3 rounded-[4px] bg-(--mirai-sem-primary) px-2 py-1 text-xs font-semibold text-foreground">
                    {item.badge}
                  </span>
                )}
                <button type="button" className="absolute right-3 top-3">
                  <Eye className="h-5 w-5 text-foreground" />
                </button>
                <div className="mx-auto h-36 w-24 rounded-xl bg-gradient-to-br from-(--mirai-sem-text-muted) to-(--mirai-sem-accent)" />
                <Button
                  type="button"
                  size="sm"
                  className="mt-5 w-full rounded-[2px] bg-(--mirai-sem-text) text-(--mirai-sem-background)"
                >
                  Thêm vào giỏ
                </Button>
              </div>
              <h2 className="mt-4 font-body text-base font-semibold text-foreground">
                {item.name}
              </h2>
              <p className="mt-1 text-sm text-(--mirai-sem-danger)">
                {item.price}{" "}
                {item.oldPrice && (
                  <span className="text-muted-foreground line-through">
                    {item.oldPrice}
                  </span>
                )}
              </p>
              <div className="mt-1 flex items-center gap-1 text-(--mirai-sem-warning)">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={`${item.id}-${i}`} className="h-3.5 w-3.5 fill-current" />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">(65)</span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
