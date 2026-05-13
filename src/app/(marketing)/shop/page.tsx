"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Heart, SlidersHorizontal, Star, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { productApi, categoryApi } from "@/lib/api-client";
import { GetAllProductsByFilterDto, CategoryResponseDto } from "@/types/api";
import { useCartStore } from "@/stores";
import { useDesignStore } from "@/lib/store";
import { toast } from "sonner";

type PriceFilter = "all" | "under-100" | "100-200" | "over-200";
type SortOption = "newest" | "price-asc" | "price-desc";

const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function ShopPage() {
  const [products, setProducts] = useState<GetAllProductsByFilterDto[]>([]);
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategoryId, setActiveCategoryId] = useState<string | "all">(
    "all",
  );
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [wishlisted, setWishlisted] = useState<string[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const userId = useDesignStore((state) => state.user?.id);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [productsData, categoriesData] = await Promise.all([
          productApi.getProductsByFilter({}),
          categoryApi.getAllCategoriesActive(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch {
        setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const visibleProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchCategory =
        activeCategoryId === "all" || product.categoryId === activeCategoryId;

      const matchPrice =
        priceFilter === "all" ||
        (priceFilter === "under-100" &&
          (product.variants?.[0]?.price || 0) < 100000) ||
        (priceFilter === "100-200" &&
          (product.variants?.[0]?.price || 0) >= 100000 &&
          (product.variants?.[0]?.price || 0) <= 200000) ||
        (priceFilter === "over-200" &&
          (product.variants?.[0]?.price || 0) > 200000);

      return matchCategory && matchPrice;
    });

    if (sortBy === "price-asc") {
      filtered = [...filtered].sort(
        (a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0),
      );
    } else if (sortBy === "price-desc") {
      filtered = [...filtered].sort(
        (a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0),
      );
    }

    return filtered;
  }, [products, activeCategoryId, priceFilter, sortBy]);

  const toggleWishlist = (id: string) => {
    setWishlisted((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleAdd = async (product: GetAllProductsByFilterDto) => {
    const variant = product.variants?.[0];
    if (!variant) {
      toast.error("Sản phẩm này hiện chưa có biến thể để đặt hàng.");
      return;
    }

    setAddingId(product.productId);
    try {
      await addItem(
        {
          id: variant.variantId || "",
          name: product.name,
          price: variant.price || 0,
          quantity: 1,
          imageUrl: product.productImages?.[0]?.imageUrl,
          phoneModel: variant.phoneModel,
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
            {showMobileFilters ? (
              <X className="h-4 w-4" />
            ) : (
              <SlidersHorizontal className="h-4 w-4" />
            )}
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
                        activeCategoryId === "all" &&
                          "font-semibold text-foreground",
                      )}
                      onClick={() => setActiveCategoryId("all")}
                    >
                      Tất cả
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category.categoryId}>
                      <button
                        type="button"
                        className={cn(
                          "transition",
                          activeCategoryId === category.categoryId &&
                            "font-semibold text-foreground",
                        )}
                        onClick={() => setActiveCategoryId(category.categoryId)}
                      >
                        {category.name}
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
                      className={cn(
                        priceFilter === "under-100" &&
                          "font-semibold text-foreground",
                      )}
                    >
                      Dưới 100.000đ
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setPriceFilter("100-200")}
                      className={cn(
                        priceFilter === "100-200" &&
                          "font-semibold text-foreground",
                      )}
                    >
                      100.000đ - 200.000đ
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setPriceFilter("over-200")}
                      className={cn(
                        priceFilter === "over-200" &&
                          "font-semibold text-foreground",
                      )}
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
                  ].map((color) => (
                    <span
                      key={color}
                      className="h-5 w-5 rounded-full border border-(--mirai-sem-border)"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveCategoryId("all");
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
                  onChange={(event) =>
                    setSortBy(event.target.value as SortOption)
                  }
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </label>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-(--mirai-sem-primary)" />
                <p>Đang tải sản phẩm...</p>
              </div>
            ) : error ? (
              <div className="rounded-[4px] border border-destructive/20 bg-destructive/5 p-12 text-center text-destructive">
                {error}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="rounded-[4px] border border-dashed border-(--mirai-color-line) p-24 text-center text-muted-foreground">
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {visibleProducts.map((product) => (
                  <article key={product.productId}>
                    <div className="relative rounded-[4px] bg-(--mirai-sem-surface-muted) p-4">
                      {(product.variants?.[0]?.price || 0) <
                        (product.variants?.[0]?.price || 0) * 1.2 && ( // Placeholder logic for badge
                        <span className="absolute left-3 top-3 rounded-[4px] bg-(--mirai-sem-primary) px-2 py-1 text-xs font-semibold text-foreground">
                          SALE
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.productId)}
                        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-card"
                        aria-label="Add to wishlist"
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4",
                            wishlisted.includes(product.productId) &&
                              "fill-current text-(--mirai-sem-danger)",
                          )}
                        />
                      </button>

                      <div className="mx-auto mb-4 h-40 w-24 rounded-[24px] border border-(--mirai-sem-border) bg-(--mirai-sem-surface) overflow-hidden">
                        {product.productImages?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.productImages[0].imageUrl || ""}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-b from-(--mirai-sem-text) via-(--mirai-sem-accent) to-(--mirai-sem-primary)" />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdd(product)}
                        className="w-full rounded-[4px] bg-(--mirai-sem-text) py-2 text-xs font-medium text-(--mirai-sem-background) hover:opacity-90 transition-opacity"
                        disabled={addingId === product.productId}
                      >
                        {addingId === product.productId
                          ? "Đang thêm..."
                          : "Thêm vào giỏ"}
                      </button>
                    </div>

                    <h2 className="mt-4 font-body text-base font-semibold text-foreground truncate">
                      {product.name}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.variants?.[0]?.phoneModel || "Universal"}
                    </p>
                    <p className="mt-1 text-sm text-(--mirai-sem-danger)">
                      <span className="font-semibold">
                        {formatPrice(product.variants?.[0]?.price || 0)}
                      </span>
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-(--mirai-sem-warning)">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={`${product.productId}-${i}`}
                          className="h-4 w-4 fill-current"
                        />
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">
                        (5.0)
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}

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
