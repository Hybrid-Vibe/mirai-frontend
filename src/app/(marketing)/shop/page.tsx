"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Heart, SlidersHorizontal, Star, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { productApi, categoryApi } from "@/lib/api-client";
import { GetAllProductsByFilterDto, CategoryResponseDto } from "@/types/api";
import { useCartStore, useWishlistStore } from "@/stores";
import { useDesignStore } from "@/lib/store";
import { toast } from "sonner";
import { useTranslation } from "@/providers/language-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PriceFilter = "all" | "under-100" | "100-200" | "over-200";
type SortOption = "newest" | "price-asc" | "price-desc";

const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function ShopPage() {
  const { locale } = useTranslation();
  const [products, setProducts] = useState<GetAllProductsByFilterDto[]>([]);
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategoryId, setActiveCategoryId] = useState<string | "all">(
    "all",
  );
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [activeColor, setActiveColor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const addItem = useCartStore((state) => state.addItem);
  const wishlisted = useWishlistStore((state) => state.wishlistProductIds);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const userId = useDesignStore((state) => state.user?.id);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [productsData, categoriesData] = await Promise.all([
          productApi.getProductsByFilter({ pageSize: 9999 }),
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [activeCategoryId, priceFilter, activeColor, sortBy]);

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

      const matchColor =
        activeColor === "all" ||
        (product.name?.charCodeAt(0) || 0) % 3 ===
          [
            "var(--mirai-sem-primary)",
            "var(--mirai-sem-accent)",
            "var(--mirai-sem-text)",
            "var(--mirai-sem-danger)",
            "var(--mirai-sem-warning)",
          ].indexOf(activeColor) %
            3;

      return matchCategory && matchPrice && matchColor;
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
  }, [products, activeCategoryId, priceFilter, sortBy, activeColor]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return visibleProducts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [visibleProducts, currentPage]);

  const totalPages = Math.ceil(visibleProducts.length / PAGE_SIZE);

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
          productId: product.productId,
          name: product.name,
          price: variant.price || 0,
          quantity: 1,
          imageUrl: product.productImages?.[0]?.imageUrl,
          phoneModel: variant.phoneModel,
        },
        userId || "guest",
      );
      toast.success(locale === "vi" ? "Đã thêm vào giỏ hàng" : "Added to cart");
    } catch {
      toast.error(
        locale === "vi" ? "Không thể thêm vào giỏ hàng" : "Cannot add to cart",
      );
    } finally {
      setAddingId(null);
    }
  };

  return (
    <main className="bg-background py-14">
      <section className="page-shell">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Shop</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
            {showMobileFilters ? "Đóng" : locale === "vi" ? "Bộ lọc" : "Filter"}
          </button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {locale === "vi"
            ? "Khám phá bộ sưu tập ốp lưng và phụ kiện mới nhất."
            : "Explore the latest phone case and accessory collections."}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside
            className={cn(
              "rounded-[4px] border border-(--mirai-color-line) bg-card p-5",
              showMobileFilters ? "block" : "hidden",
              "lg:block",
            )}
          >
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
              {locale === "vi" ? "Bộ lọc" : "Filters"}
            </h2>

            <div className="mt-5 space-y-6 text-sm">
              <div>
                <p className="mb-3 font-semibold text-foreground text-xs uppercase tracking-wider">
                  {locale === "vi" ? "Danh mục" : "Category"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
                      activeCategoryId === "all"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                        : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground",
                    )}
                    onClick={() => setActiveCategoryId("all")}
                  >
                    {locale === "vi" ? "Tất cả" : "All"}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.categoryId}
                      type="button"
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
                        activeCategoryId === category.categoryId
                          ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                          : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground",
                      )}
                      onClick={() => setActiveCategoryId(category.categoryId)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 font-semibold text-foreground text-xs uppercase tracking-wider">
                  {locale === "vi" ? "Giá" : "Price"}
                </p>
                <div className="space-y-2">
                  {[
                    {
                      id: "all",
                      label: locale === "vi" ? "Tất cả mức giá" : "All Prices",
                      filter: "all",
                    },
                    {
                      id: "under-100",
                      label:
                        locale === "vi" ? "Dưới 100.000đ" : "Under 100,000đ",
                      filter: "under-100",
                    },
                    {
                      id: "100-200",
                      label: "100.000đ - 200.000đ",
                      filter: "100-200",
                    },
                    {
                      id: "over-200",
                      label:
                        locale === "vi" ? "Trên 200.000đ" : "Over 200,000đ",
                      filter: "over-200",
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPriceFilter(item.filter as PriceFilter)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all duration-200 transform hover:translate-x-0.5",
                        priceFilter === item.filter
                          ? "bg-primary/5 text-primary border-primary/40 font-medium"
                          : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <span>{item.label}</span>
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                          priceFilter === item.filter
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30 bg-transparent",
                        )}
                      >
                        {priceFilter === item.filter && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 font-semibold text-foreground text-xs uppercase tracking-wider">
                  {locale === "vi" ? "Màu sắc" : "Color"}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    {
                      value: "all",
                      bg: "conic-gradient(from 0deg, red, yellow, green, cyan, blue, magenta, red)",
                      name: locale === "vi" ? "Tất cả" : "All",
                    },
                    {
                      value: "var(--mirai-sem-primary)",
                      bg: "var(--mirai-sem-primary)",
                      name: "Primary",
                    },
                    {
                      value: "var(--mirai-sem-accent)",
                      bg: "var(--mirai-sem-accent)",
                      name: "Accent",
                    },
                    {
                      value: "var(--mirai-sem-text)",
                      bg: "var(--mirai-sem-text)",
                      name: "Dark",
                    },
                    {
                      value: "var(--mirai-sem-danger)",
                      bg: "var(--mirai-sem-danger)",
                      name: "Danger",
                    },
                    {
                      value: "var(--mirai-sem-warning)",
                      bg: "var(--mirai-sem-warning)",
                      name: "Warning",
                    },
                  ].map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setActiveColor(color.value)}
                      title={color.name}
                      className={cn(
                        "h-7 w-7 rounded-full border transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center relative shadow-sm",
                        activeColor === color.value
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background border-transparent"
                          : "border-border hover:border-muted-foreground/50",
                      )}
                      style={{ background: color.bg }}
                    >
                      {activeColor === color.value && (
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            color.value === "var(--mirai-sem-text)"
                              ? "bg-white"
                              : "bg-foreground",
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full mt-4 active:scale-95 transition-transform"
                onClick={() => {
                  setActiveCategoryId("all");
                  setPriceFilter("all");
                  setActiveColor("all");
                }}
              >
                Reset filter
              </Button>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between rounded-[4px] border border-(--mirai-color-line) bg-card px-4 py-3 text-sm">
              <p className="text-muted-foreground">
                {locale === "vi"
                  ? `Hiển thị ${visibleProducts.length} sản phẩm`
                  : `Showing ${visibleProducts.length} products`}
              </p>
              <label className="flex items-center gap-2 text-foreground">
                <span className="hidden sm:inline">
                  {locale === "vi" ? "Sắp xếp:" : "Sort:"}
                </span>
                <select
                  className="h-8 rounded-[4px] border border-border bg-card px-2"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as SortOption)
                  }
                >
                  <option value="newest">
                    {locale === "vi" ? "Mới nhất" : "Newest"}
                  </option>
                  <option value="price-asc">
                    {locale === "vi" ? "Giá tăng dần" : "Price: Low to High"}
                  </option>
                  <option value="price-desc">
                    {locale === "vi" ? "Giá giảm dần" : "Price: High to Low"}
                  </option>
                </select>
              </label>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-(--mirai-sem-primary)" />
                <p>
                  {locale === "vi"
                    ? "Đang tải sản phẩm..."
                    : "Loading products..."}
                </p>
              </div>
            ) : error ? (
              <div className="rounded-[4px] border border-destructive/20 bg-destructive/5 p-12 text-center text-destructive">
                {error}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="rounded-[4px] border border-dashed border-(--mirai-color-line) p-24 text-center text-muted-foreground">
                {locale === "vi"
                  ? "Không tìm thấy sản phẩm nào phù hợp với bộ lọc."
                  : "No products match the current filters."}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {paginatedProducts.map((product) => (
                  <article key={product.productId}>
                    <div className="relative rounded-[4px] bg-(--mirai-sem-surface-muted) p-4">
                      {product.variants?.[0]?.isFlashSale ? (
                        <span className="absolute left-3 top-3 rounded bg-(--mirai-sem-danger) px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                          Flash Sale
                        </span>
                      ) : (
                        (product.variants?.[0]?.price || 0) <
                          (product.variants?.[0]?.price || 0) * 1.2 && ( // Placeholder logic for badge
                          <span className="absolute left-3 top-3 rounded-[4px] bg-(--mirai-sem-primary) px-2 py-1 text-xs font-semibold text-foreground">
                            SALE
                          </span>
                        )
                      )}
                      <Tooltip>
                        <TooltipTrigger
                          onClick={() => toggleWishlist(product.productId)}
                          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-card hover:bg-muted transition-colors z-10 cursor-pointer"
                          aria-label="Add to wishlist"
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4",
                              wishlisted.includes(product.productId) &&
                                "fill-current text-(--mirai-sem-danger)",
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {wishlisted.includes(product.productId)
                              ? locale === "vi"
                                ? "Bỏ khỏi wishlist"
                                : "Remove from wishlist"
                              : locale === "vi"
                                ? "Thêm vào wishlist"
                                : "Add to wishlist"}
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      <Link
                        href={`/shop/${product.productId}`}
                        className="mb-4 h-56 w-full rounded-[4px] border border-(--mirai-sem-border) bg-(--mirai-sem-surface) overflow-hidden relative flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 block"
                      >
                        {product.productImages?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.productImages[0].imageUrl || ""}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-b from-(--mirai-sem-text) via-(--mirai-sem-accent) to-(--mirai-sem-primary)" />
                        )}
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleAdd(product)}
                        className="w-full rounded-[4px] bg-(--mirai-sem-text) py-2 text-xs font-medium text-(--mirai-sem-background) hover:opacity-90 transition-opacity cursor-pointer"
                        disabled={addingId === product.productId}
                      >
                        {addingId === product.productId
                          ? locale === "vi"
                            ? "Đang thêm..."
                            : "Adding..."
                          : locale === "vi"
                            ? "Thêm vào giỏ"
                            : "Add to Cart"}
                      </button>
                    </div>

                    <Link
                      href={`/shop/${product.productId}`}
                      className="cursor-pointer block hover:text-(--mirai-sem-primary) transition-colors"
                    >
                      <h2 className="mt-4 font-body text-base font-semibold text-foreground truncate">
                        {product.name}
                      </h2>
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.variants?.[0]?.phoneModel || "Universal"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-(--mirai-sem-danger) text-base">
                        {product.variants?.[0]?.isFlashSale &&
                        product.variants?.[0]?.flashSalePrice != null
                          ? formatPrice(product.variants[0].flashSalePrice)
                          : formatPrice(product.variants?.[0]?.price || 0)}
                      </span>
                      {product.variants?.[0]?.isFlashSale &&
                        product.variants?.[0]?.flashSalePrice != null && (
                          <span className="text-muted-foreground line-through text-xs ml-auto">
                            {formatPrice(product.variants[0].price || 0)}
                          </span>
                        )}
                    </div>

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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2 border-t border-border/40 pt-8">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="inline-flex h-9 items-center justify-center rounded-[4px] border border-border bg-card px-3 text-xs font-semibold text-foreground transition-all hover:bg-accent hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                >
                  {locale === "vi" ? "Trang trước" : "Previous"}
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "inline-flex h-9 w-9 items-center justify-center rounded-[4px] text-xs font-bold transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105"
                            : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex h-9 items-center justify-center rounded-[4px] border border-border bg-card px-3 text-xs font-semibold text-foreground transition-all hover:bg-accent hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                >
                  {locale === "vi" ? "Trang sau" : "Next"}
                </button>
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <Link
                href="/cart"
                className="inline-flex h-11 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 text-sm font-semibold text-foreground"
              >
                {locale === "vi" ? "Đi đến giỏ hàng" : "Go to Cart"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
