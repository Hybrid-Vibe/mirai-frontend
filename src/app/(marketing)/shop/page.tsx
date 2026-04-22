"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, SlidersHorizontal, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Category = "Phone Cases" | "Laptop Cases" | "Airpod Cases" | "Phụ kiện";
type PriceFilter = "all" | "under-100" | "100-200" | "over-200";
type SortOption = "newest" | "price-asc" | "price-desc";

type Product = {
  id: string;
  name: string;
  category: Category;
  model: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  rating: number;
};

const products: Product[] = [
  { id: "p-1", name: "Phone Case Aurora", category: "Phone Cases", model: "iPhone 15", price: 120000, oldPrice: 150000, badge: "-35%", rating: 4.9 },
  { id: "p-2", name: "Laptop Sleeve Pixel", category: "Laptop Cases", model: "MacBook Air", price: 229000, rating: 4.7 },
  { id: "p-3", name: "Airpod Case Chrome", category: "Airpod Cases", model: "AirPods Pro", price: 125000, badge: "NEW", rating: 4.8 },
  { id: "p-4", name: "Phone Case Mirror", category: "Phone Cases", model: "Samsung S24", price: 120000, rating: 4.6 },
  { id: "p-5", name: "Charm Set", category: "Phụ kiện", model: "Universal", price: 99000, oldPrice: 150000, rating: 4.5 },
  { id: "p-6", name: "Laptop Skin Neon", category: "Laptop Cases", model: "ThinkPad X1", price: 180000, rating: 4.7 },
  { id: "p-7", name: "Phone Case Frost", category: "Phone Cases", model: "Xiaomi 14", price: 129000, rating: 4.8 },
  { id: "p-8", name: "Airpod Loop", category: "Airpod Cases", model: "AirPods 3", price: 120000, rating: 4.6 },
];

const categories: Category[] = [
  "Phone Cases",
  "Laptop Cases",
  "Airpod Cases",
  "Phụ kiện",
];

const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [wishlisted, setWishlisted] = useState<string[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchCategory =
        activeCategory === "all" || product.category === activeCategory;

      const matchPrice =
        priceFilter === "all" ||
        (priceFilter === "under-100" && product.price < 100000) ||
        (priceFilter === "100-200" && product.price >= 100000 && product.price <= 200000) ||
        (priceFilter === "over-200" && product.price > 200000);

      return matchCategory && matchPrice;
    });

    if (sortBy === "price-asc") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-desc") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [activeCategory, priceFilter, sortBy]);

  const toggleWishlist = (id: string) => {
    setWishlisted((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleAdd = (id: string) => {
    setAddingId(id);
    window.setTimeout(() => {
      setAddingId((prev) => (prev === id ? null : prev));
    }, 600);
  };

  return (
    <main className="bg-background py-14">
      <section className="page-shell">
        <p className="text-sm text-muted-foreground">Home / Shop</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">
            Shop
          </h1>
          <button
            type="button"
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-(--mirai-color-line) px-3 text-sm font-medium text-foreground md:hidden"
          >
            {showMobileFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
            {showMobileFilters ? "Đóng" : "Filter"}
          </button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Khám phá bộ sưu tập ốp lưng và phụ kiện mới nhất.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside
            className={cn(
              "rounded-[4px] border border-(--mirai-color-line) bg-card p-5",
              showMobileFilters ? "block" : "hidden",
              "lg:block",
            )}
          >
            <h2 className="text-sm font-semibold text-foreground">Bộ lọc</h2>

            <div className="mt-5 space-y-5 text-sm">
              <div>
                <p className="mb-2 font-semibold text-foreground">Danh mục</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <button
                      type="button"
                      className={cn(
                        "transition",
                        activeCategory === "all" && "font-semibold text-foreground",
                      )}
                      onClick={() => setActiveCategory("all")}
                    >
                      Tất cả
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category}>
                      <button
                        type="button"
                        className={cn(
                          "transition",
                          activeCategory === category && "font-semibold text-foreground",
                        )}
                        onClick={() => setActiveCategory(category)}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-2 font-semibold text-foreground">Giá</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <button
                      type="button"
                      onClick={() => setPriceFilter("under-100")}
                      className={cn(priceFilter === "under-100" && "font-semibold text-foreground")}
                    >
                      Dưới 100.000đ
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setPriceFilter("100-200")}
                      className={cn(priceFilter === "100-200" && "font-semibold text-foreground")}
                    >
                      100.000đ - 200.000đ
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setPriceFilter("over-200")}
                      className={cn(priceFilter === "over-200" && "font-semibold text-foreground")}
                    >
                      Trên 200.000đ
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <p className="mb-2 font-semibold text-foreground">Màu sắc</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "var(--mirai-sem-primary)",
                    "var(--mirai-sem-accent)",
                    "var(--mirai-sem-text)",
                    "var(--mirai-sem-danger)",
                    "var(--mirai-sem-warning)",
                  ].map(
                    (color) => (
                      <span
                        key={color}
                        className="h-5 w-5 rounded-full border border-(--mirai-sem-border)"
                        style={{ backgroundColor: color }}
                      />
                    ),
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveCategory("all");
                  setPriceFilter("all");
                }}
              >
                Reset filter
              </Button>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between rounded-[4px] border border-(--mirai-color-line) bg-card px-4 py-3 text-sm">
              <p className="text-muted-foreground">
                Hiển thị {visibleProducts.length} sản phẩm
              </p>
              <label className="flex items-center gap-2 text-foreground">
                <span className="hidden sm:inline">Sắp xếp:</span>
                <select
                  className="h-8 rounded-[4px] border border-border bg-card px-2"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <article key={product.id}>
                  <div className="relative rounded-[4px] bg-(--mirai-sem-surface-muted) p-4">
                    {product.badge && (
                      <span className="absolute left-3 top-3 rounded-[4px] bg-(--mirai-sem-primary) px-2 py-1 text-xs font-semibold text-foreground">
                        {product.badge}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-card"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          wishlisted.includes(product.id) && "fill-current text-(--mirai-sem-danger)",
                        )}
                      />
                    </button>

                    <div className="mx-auto mb-4 h-40 w-24 rounded-[24px] border border-(--mirai-sem-border) bg-gradient-to-b from-(--mirai-sem-text) via-(--mirai-sem-accent) to-(--mirai-sem-primary)" />

                    <button
                      type="button"
                      onClick={() => handleAdd(product.id)}
                      className="w-full rounded-[4px] bg-(--mirai-sem-text) py-2 text-xs font-medium text-(--mirai-sem-background)"
                    >
                      {addingId === product.id ? "Đang thêm..." : "Thêm vào giỏ"}
                    </button>
                  </div>

                  <h2 className="mt-4 font-body text-base font-semibold text-foreground">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">{product.model}</p>
                  <p className="mt-1 text-sm text-(--mirai-sem-danger)">
                    <span className="font-semibold">{formatPrice(product.price)}</span>{" "}
                    {product.oldPrice && (
                      <span className="text-muted-foreground line-through">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-(--mirai-sem-warning)">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={`${product.id}-${i}`}
                        className="h-4 w-4 fill-current"
                      />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({product.rating})
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="/cart"
                className="inline-flex h-11 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 text-sm font-semibold text-foreground"
              >
                Đi đến giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
