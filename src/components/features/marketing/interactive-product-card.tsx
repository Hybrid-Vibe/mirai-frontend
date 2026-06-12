"use client";

import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores";
import { useDesignStore } from "@/lib/store";
import { toast } from "sonner";
import Link from "next/link";

export type Product = {
  id: string;
  productId?: string;
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  ratingAvg?: number;
  ratingCount?: number;
  imageUrl?: string;
};

export function InteractiveProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const userId = useDesignStore((state) => state.user?.id);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAddingId(product.id);
    try {
      const numericPrice =
        parseInt(product.price.replace(/[^\d]/g, ""), 10) || 0;
      await addItem(
        {
          id: product.id,
          name: product.name,
          price: numericPrice,
          quantity: 1,
          phoneModel: "Universal",
        },
        userId || "guest",
      );
      toast.success("Đã thêm vào giỏ hàng");
    } catch {
      toast.error("Không thể thêm vào giỏ hàng");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <article
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative rounded-[4px] bg-(--mirai-sem-surface-muted) p-4 overflow-hidden">
        {product.badge && product.badge !== "FLASH SALE" && (
          <span className="absolute left-3 top-3 z-10 rounded-[4px] bg-(--mirai-sem-primary) px-2 py-1 text-xs font-semibold text-foreground">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-sm transition-transform hover:scale-110 active:scale-95"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isWishlisted ? "fill-(--mirai-sem-danger) text-(--mirai-sem-danger)" : "text-foreground"}`}
          />
        </button>

        <Link
          href={`/shop/${product.productId || product.id}`}
          className="mx-auto mb-4 h-40 w-24 rounded-[24px] border border-(--mirai-sem-border) bg-(--mirai-sem-surface) overflow-hidden relative flex items-center justify-center p-3 transition-transform duration-500 group-hover:scale-105 block"
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-b from-(--mirai-sem-text) via-(--mirai-sem-accent) to-(--mirai-sem-primary)" />
          )}
        </Link>

        <div
          className={`absolute inset-x-0 bottom-0 p-4 transition-transform duration-300 ${isHovered ? "translate-y-0" : "translate-y-full"}`}
        >
          <button
            type="button"
            className="w-full rounded-[4px] bg-(--mirai-sem-text) py-2.5 text-xs font-semibold text-(--mirai-sem-background) shadow-lg transition-all hover:bg-[#48E1ED] hover:text-[#0F0F0F] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleAdd}
            disabled={addingId === product.id}
          >
            {addingId === product.id ? "Đang thêm..." : "Thêm vào giỏ hàng"}
          </button>
        </div>
      </div>

      <Link href={`/shop/${product.productId || product.id}`} className="block">
        <h3 className="mt-4 font-body text-base font-semibold text-foreground cursor-pointer hover:text-(--mirai-sem-primary) transition-colors">
          {product.name}
        </h3>
      </Link>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-(--mirai-sem-danger) text-base">
          {product.price}
        </span>
        {product.badge === "FLASH SALE" && (
          <span className="rounded bg-(--mirai-sem-danger) px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
            Flash Sale
          </span>
        )}
        {product.oldPrice && (
          <span className="text-muted-foreground line-through text-xs ml-auto">
            {product.oldPrice}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-1 text-(--mirai-sem-warning)">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={`${product.id}-${i}`}
            className={`h-4 w-4 ${i < (product.ratingAvg ?? 5) ? "fill-current" : "fill-transparent text-muted-foreground"}`}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">
          ({product.ratingCount ?? 0})
        </span>
      </div>
    </article>
  );
}
