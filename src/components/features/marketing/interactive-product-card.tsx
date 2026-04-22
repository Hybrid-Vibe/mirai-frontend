"use client";

import { Heart, Star } from "lucide-react";
import { useState } from "react";

export type Product = {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
};

export function InteractiveProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article className="group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative rounded-[4px] bg-(--mirai-sem-surface-muted) p-4 overflow-hidden">
        {product.badge && (
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

        <div className="mx-auto mb-4 h-40 w-24 rounded-[24px] border border-(--mirai-sem-border) bg-gradient-to-b from-(--mirai-sem-text) via-(--mirai-sem-accent) to-(--mirai-sem-primary) transition-transform duration-500 group-hover:scale-105" />

        <div className={`absolute inset-x-0 bottom-0 p-4 transition-transform duration-300 ${isHovered ? "translate-y-0" : "translate-y-full"}`}>
          <button
            type="button"
            className="w-full rounded-[4px] bg-(--mirai-sem-text) py-2.5 text-xs font-semibold text-(--mirai-sem-background) shadow-lg transition-all hover:bg-[#48E1ED] hover:text-[#0F0F0F] active:scale-[0.98]"
            onClick={(e) => {
              e.preventDefault();
              // Add to cart logic
            }}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      <h3 className="mt-4 font-body text-base font-semibold text-foreground cursor-pointer hover:text-(--mirai-sem-primary) transition-colors">
        {product.name}
      </h3>
      <div className="mt-1 flex items-center gap-3 text-sm">
        <span className="font-semibold text-(--mirai-sem-danger)">{product.price}</span>
        {product.oldPrice && (
          <span className="text-muted-foreground line-through">
            {product.oldPrice}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-1 text-(--mirai-sem-warning)">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={`${product.id}-${i}`} className="h-4 w-4 fill-current" />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">(65)</span>
      </div>
    </article>
  );
}
