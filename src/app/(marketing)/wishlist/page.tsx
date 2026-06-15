"use client";

import { useMemo, useState, useEffect } from "react";
import { Star, Trash2, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, useWishlistStore } from "@/stores";
import { useDesignStore } from "@/lib/store";
import { productApi } from "@/lib/api-client";
import { GetAllProductsByFilterDto } from "@/types/api";
import { toast } from "sonner";
import Link from "next/link";
import { AuthGuard } from "@/components/common/guards/auth-guard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function WishlistPage() {
  const [products, setProducts] = useState<GetAllProductsByFilterDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { wishlistProductIds, toggleWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);
  const userId = useDesignStore((state) => state.user?.id);

  const [addingIds, setAddingIds] = useState<string[]>([]);
  const [movedToCartIds, setMovedToCartIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productApi.getProductsByFilter({});
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products for wishlist:", err);
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const wishlistItems = useMemo(() => {
    return products.filter((p) => wishlistProductIds.includes(p.productId));
  }, [products, wishlistProductIds]);

  const suggestedItems = useMemo(() => {
    // Curate suggestions from products that are not currently in the wishlist
    const notWishlisted = products.filter(
      (p) => !wishlistProductIds.includes(p.productId),
    );
    if (notWishlisted.length > 0) {
      return notWishlisted.slice(0, 4);
    }
    // Fallback to first 4 if everything is wishlisted
    return products.slice(0, 4);
  }, [products, wishlistProductIds]);

  const handleAddToCart = async (product: GetAllProductsByFilterDto) => {
    const variant = product.variants?.[0];
    if (!variant) {
      toast.error("Sản phẩm này hiện chưa có biến thể để đặt hàng.");
      return;
    }

    setAddingIds((prev) => [...prev, product.productId]);
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
      setMovedToCartIds((prev) => [...prev, product.productId]);
      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
    } catch {
      toast.error("Không thể thêm vào giỏ hàng");
    } finally {
      setAddingIds((prev) => prev.filter((id) => id !== product.productId));
    }
  };

  const handleAddAllToCart = async () => {
    if (wishlistItems.length === 0) {
      toast.error("Wishlist của bạn đang trống.");
      return;
    }

    let addedCount = 0;
    for (const item of wishlistItems) {
      const variant = item.variants?.[0];
      if (variant) {
        try {
          await addItem(
            {
              id: variant.variantId || "",
              productId: item.productId,
              name: item.name,
              price: variant.price || 0,
              quantity: 1,
              imageUrl: item.productImages?.[0]?.imageUrl,
              phoneModel: variant.phoneModel,
            },
            userId || "guest",
          );
          setMovedToCartIds((prev) => [...prev, item.productId]);
          addedCount++;
        } catch (err) {
          console.error("Failed to add item to cart:", item.productId, err);
        }
      }
    }

    if (addedCount > 0) {
      toast.success(`Đã thêm ${addedCount} sản phẩm từ wishlist vào giỏ hàng!`);
    } else {
      toast.error("Không tìm thấy sản phẩm có sẵn biến thể để thêm vào giỏ.");
    }
  };

  return (
    <AuthGuard>
      <main className="bg-background py-16">
        <div className="page-shell">
          <div className="mb-10 flex items-center justify-between border-b border-border/40 pb-6">
            <h1 className="font-heading text-3xl font-semibold text-foreground">
              Wishlist ({wishlistItems.length})
            </h1>
            <Button
              type="button"
              variant="outline"
              className="min-w-44 rounded-[4px] active:scale-95 transition-transform"
              onClick={handleAddAllToCart}
              disabled={wishlistItems.length === 0}
            >
              Thêm tất cả vào Giỏ
            </Button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-(--mirai-sem-primary)" />
              <p>Đang tải danh sách yêu thích...</p>
            </div>
          ) : error ? (
            <div className="rounded-[4px] border border-destructive/20 bg-destructive/5 p-12 text-center text-destructive">
              {error}
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="rounded-[4px] border border-dashed border-(--mirai-color-line) py-24 text-center text-muted-foreground flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Danh sách yêu thích trống
              </h2>
              <p className="text-sm max-w-sm mb-6">
                Hãy thêm những mẫu thiết kế bạn ưng ý từ Shop vào wishlist để
                theo dõi nhé!
              </p>
              <Link
                href="/shop"
                className="inline-flex h-10 items-center justify-center rounded-[4px] bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10"
              >
                Khám phá sản phẩm ngay
              </Link>
            </div>
          ) : (
            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {wishlistItems.map((item) => (
                <article key={item.productId} className="group">
                  <div className="relative rounded-[4px] bg-(--mirai-sem-surface-muted) p-4 overflow-hidden">
                    <span className="absolute left-3 top-3 rounded-[4px] bg-(--mirai-sem-primary) px-2 py-1 text-[10px] font-semibold text-foreground uppercase">
                      Yêu thích
                    </span>
                    <button
                      type="button"
                      className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-card hover:bg-muted text-foreground transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm border border-border/50 z-10 cursor-pointer"
                      onClick={() => toggleWishlist(item.productId)}
                      aria-label={`Xóa ${item.name} khỏi wishlist`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                    </button>

                    <Link
                      href={`/shop/${item.productId}`}
                      className="mx-auto mb-4 h-40 w-24 rounded-[24px] border border-(--mirai-sem-border) bg-(--mirai-sem-surface) overflow-hidden relative group-hover:scale-105 transition-transform duration-300 shadow-sm block"
                    >
                      {item.productImages?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.productImages[0].imageUrl || ""}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-b from-(--mirai-sem-text) via-(--mirai-sem-accent) to-(--mirai-sem-primary)" />
                      )}
                    </Link>

                    <Button
                      type="button"
                      size="sm"
                      variant={
                        movedToCartIds.includes(item.productId)
                          ? "secondary"
                          : "default"
                      }
                      className="mt-5 w-full rounded-[4px] bg-(--mirai-sem-text) text-(--mirai-sem-background) hover:opacity-90 active:scale-95 transition-all"
                      onClick={() => handleAddToCart(item)}
                      disabled={addingIds.includes(item.productId)}
                    >
                      {addingIds.includes(item.productId)
                        ? "Đang thêm..."
                        : movedToCartIds.includes(item.productId)
                          ? "Đã chuyển vào giỏ"
                          : "Thêm vào giỏ"}
                    </Button>
                  </div>

                  <Link href={`/shop/${item.productId}`} className="block">
                    <h2 className="mt-4 font-body text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </h2>
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.variants?.[0]?.phoneModel || "Universal"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--mirai-sem-danger)">
                    {formatPrice(item.variants?.[0]?.price || 0)}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-(--mirai-sem-warning)">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={`${item.productId}-${i}`}
                        className="h-3.5 w-3.5 fill-current"
                      />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">
                      (5.0)
                    </span>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* Dynamic Suggested Products */}
          {suggestedItems.length > 0 && (
            <>
              <div className="mt-20 mb-8 flex items-center justify-between border-b border-border/40 pb-6">
                <div className="flex items-center gap-3">
                  <span className="inline-block h-8 w-2 rounded-sm bg-(--mirai-sem-accent)" />
                  <h2 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
                    Dành Cho Bạn
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="inline-flex h-10 items-center justify-center rounded-[4px] border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-muted active:scale-95 transition-all shadow-sm"
                >
                  Xem Tất Cả
                </Link>
              </div>

              <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {suggestedItems.map((item) => (
                  <article key={item.productId} className="group">
                    <div className="relative rounded-[4px] bg-(--mirai-sem-surface-muted) p-4 overflow-hidden">
                      <Tooltip>
                        <TooltipTrigger
                          onClick={() => toggleWishlist(item.productId)}
                          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-card hover:bg-muted text-foreground transition-all duration-200 transform hover:scale-105 active:scale-95 border border-border/50 z-10 cursor-pointer shadow-sm"
                          aria-label="Add to wishlist"
                        >
                          <Heart className="h-4 w-4 fill-current text-muted-foreground/30 hover:text-destructive" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Thêm vào wishlist</p>
                        </TooltipContent>
                      </Tooltip>

                      <Link
                        href={`/shop/${item.productId}`}
                        className="mx-auto mb-4 h-40 w-24 rounded-[24px] border border-(--mirai-sem-border) bg-(--mirai-sem-surface) overflow-hidden relative group-hover:scale-105 transition-transform duration-300 shadow-sm block"
                      >
                        {item.productImages?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.productImages[0].imageUrl || ""}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-b from-(--mirai-sem-text) via-(--mirai-sem-accent) to-(--mirai-sem-primary)" />
                        )}
                      </Link>

                      <Button
                        type="button"
                        size="sm"
                        className="mt-5 w-full rounded-[4px] bg-(--mirai-sem-text) text-(--mirai-sem-background) hover:opacity-90 active:scale-95 transition-all"
                        onClick={() => handleAddToCart(item)}
                        disabled={addingIds.includes(item.productId)}
                      >
                        {addingIds.includes(item.productId)
                          ? "Đang thêm..."
                          : movedToCartIds.includes(item.productId)
                            ? "Đã chuyển vào giỏ"
                            : "Thêm vào giỏ"}
                      </Button>
                    </div>

                    <Link href={`/shop/${item.productId}`} className="block">
                      <h2 className="mt-4 font-body text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {item.name}
                      </h2>
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.variants?.[0]?.phoneModel || "Universal"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-(--mirai-sem-danger)">
                      {formatPrice(item.variants?.[0]?.price || 0)}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-(--mirai-sem-warning)">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={`${item.productId}-${i}`}
                          className="h-3.5 w-3.5 fill-current"
                        />
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">
                        (5.0)
                      </span>
                    </div>
                  </article>
                ))}
              </section>
            </>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
