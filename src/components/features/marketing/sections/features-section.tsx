"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const products = [
  {
    id: "best-1",
    name: "Anime Sakura Bloom",
    model: "iPhone 15 Pro Max",
    price: "179.000đ",
    oldPrice: "249.000đ",
    rating: "4.9",
    color: "from-(--mirai-sem-accent) to-(--mirai-sem-primary)",
    isNew: true,
  },
  {
    id: "best-2",
    name: "Dark Urban Neon",
    model: "Samsung S24 Ultra",
    price: "169.000đ",
    oldPrice: "229.000đ",
    rating: "4.8",
    color: "from-(--mirai-sem-text) to-(--mirai-sem-accent)",
    isNew: false,
  },
  {
    id: "best-3",
    name: "Y2K Chrome Wave",
    model: "iPhone 14 Pro",
    price: "159.000đ",
    oldPrice: "219.000đ",
    rating: "4.7",
    color: "from-(--mirai-sem-primary) to-(--mirai-sem-accent)",
    isNew: true,
  },
  {
    id: "best-4",
    name: "Minimal Monochrome",
    model: "Xiaomi 14",
    price: "149.000đ",
    oldPrice: "199.000đ",
    rating: "4.8",
    color: "from-(--mirai-sem-text-muted) to-(--mirai-sem-text)",
    isNew: false,
  },
] as const;

const filters = ["all", "iPhone", "Samsung", "Xiaomi"] as const;

export function FeaturesSection() {
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("all");
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const visibleProducts = useMemo(() => {
    if (activeFilter === "all") {
      return products;
    }

    return products.filter((product) => product.model.includes(activeFilter));
  }, [activeFilter]);

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  return (
    <section id="features" className="border-y border-border py-12 md:py-16">
      <div className="page-shell">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-(--mirai-color-brand-strong)">
              Best selling products
            </p>
            <h2 className="mt-2 type-heading-md">Sản phẩm bán chạy</h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="hidden rounded-[6px] md:inline-flex"
          >
            <Link href="/shop">Xem tất cả</Link>
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "h-8 rounded-full border px-3 text-xs font-medium transition",
                activeFilter === filter
                  ? "border-(--mirai-sem-primary) bg-(--mirai-sem-primary) text-(--mirai-sem-text)"
                  : "border-border bg-card text-muted-foreground hover:border-(--mirai-sem-primary)/60 hover:text-foreground",
              )}
            >
              {filter === "all" ? "Tất cả" : filter}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-[10px] border border-border bg-card"
              >
                <div
                  className={`relative flex h-52 items-center justify-center bg-gradient-to-br ${product.color}`}
                >
                  {product.isNew && (
                    <Badge className="absolute left-3 top-3 bg-card text-foreground">
                      NEW
                    </Badge>
                  )}
                  <button
                    type="button"
                    aria-label={`Add ${product.name} to wishlist`}
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-card/90 text-foreground"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 transition",
                        isWishlisted &&
                          "fill-current text-(--mirai-sem-danger)",
                      )}
                    />
                  </button>
                  <div className="h-36 w-20 rounded-[18px] border border-white/40 bg-black/10" />
                </div>

                <div className="p-4">
                  <p className="text-xs text-muted-foreground">
                    {product.model}
                  </p>
                  <h3 className="mt-1 font-heading text-lg font-semibold">
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <Star className="h-3.5 w-3.5 fill-current text-(--mirai-sem-warning)" />
                    <span>{product.rating}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <p className="font-heading text-lg font-semibold text-(--mirai-color-brand-strong)">
                      {product.price}
                    </p>
                    <p className="text-sm text-muted-foreground line-through">
                      {product.oldPrice}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
