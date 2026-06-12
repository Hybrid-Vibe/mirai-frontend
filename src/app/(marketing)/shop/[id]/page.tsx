"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Star,
  ChevronLeft,
  Plus,
  Minus,
  Loader2,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { productApi } from "@/lib/api-client";
import {
  GetAllProductsByFilterDto,
  GetAllProductVariantsByFilterDto,
} from "@/types/api";
import { useCartStore, useWishlistStore } from "@/stores";
import { useDesignStore } from "@/lib/store";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<GetAllProductsByFilterDto | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Selection States
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Stores
  const addItem = useCartStore((state) => state.addItem);
  const wishlisted = useWishlistStore((state) => state.wishlistProductIds);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const userId = useDesignStore((state) => state.user?.id);

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const products = await productApi.getProductsByFilter({
          productId: id,
        });
        if (products && products.length > 0) {
          const prod = products[0];
          setProduct(prod);

          // Auto-select first variant color and model
          const firstVariant = prod.variants?.[0];
          if (firstVariant) {
            setSelectedColor(firstVariant.color || "");
            setSelectedModel(firstVariant.phoneModel || "");
          }
        } else {
          setError("Không tìm thấy sản phẩm này.");
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
        setError("Có lỗi xảy ra khi tải thông tin sản phẩm. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Extract unique colors and models from variants
  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    const colors = new Set<string>();
    product.variants.forEach((v) => {
      if (v.color) colors.add(v.color);
    });
    return Array.from(colors);
  }, [product]);

  const availableModels = useMemo(() => {
    if (!product?.variants) return [];
    const models = new Set<string>();
    product.variants.forEach((v) => {
      if (v.phoneModel) models.add(v.phoneModel);
    });
    return Array.from(models);
  }, [product]);

  // Find currently selected variant based on color and model
  const selectedVariant =
    useMemo<GetAllProductVariantsByFilterDto | null>(() => {
      if (!product?.variants) return null;
      return (
        product.variants.find(
          (v) => v.color === selectedColor && v.phoneModel === selectedModel,
        ) ||
        product.variants.find((v) => v.color === selectedColor) ||
        product.variants?.[0] ||
        null
      );
    }, [product, selectedColor, selectedModel]);

  // Handle color change: auto-select phoneModel if currently selected phoneModel is not available in new color
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (product?.variants) {
      const modelWithNewColor = product.variants.find(
        (v) => v.color === color && v.phoneModel === selectedModel,
      );
      if (!modelWithNewColor) {
        // Fallback to first model available with this color
        const fallbackVariant = product.variants.find((v) => v.color === color);
        if (fallbackVariant?.phoneModel) {
          setSelectedModel(fallbackVariant.phoneModel);
        }
      }
    }
  };

  // Gallery images list (falls back to placeholder if none)
  const images = useMemo(() => {
    if (product?.productImages && product.productImages.length > 0) {
      return product.productImages.map((img) => img.imageUrl || "");
    }
    return [
      selectedVariant?.imageUrl || "/placeholder-case.png", // fallback placeholder
    ];
  }, [product, selectedVariant]);

  const price = selectedVariant?.price || 0;
  const isFlashSale = selectedVariant?.isFlashSale;
  const flashSalePrice = selectedVariant?.flashSalePrice;
  const stock = selectedVariant?.stock ?? 10;

  const handleQuantityChange = (type: "inc" | "dec") => {
    if (type === "inc") {
      if (quantity < stock) setQuantity((prev) => prev + 1);
      else toast.warning(`Chỉ còn ${stock} sản phẩm trong kho.`);
    } else {
      if (quantity > 1) setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async (showToast = true) => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn đầy đủ phân loại.");
      return false;
    }

    setAddingToCart(true);
    try {
      await addItem(
        {
          id: selectedVariant.variantId || "",
          productId: product?.productId || id,
          name: product?.name || "Sản phẩm",
          price: isFlashSale && flashSalePrice != null ? flashSalePrice : price,
          quantity: quantity,
          imageUrl: images[activeImageIndex] || selectedVariant.imageUrl,
          phoneModel: selectedVariant.phoneModel || "Universal",
        },
        userId || "guest",
      );
      if (showToast) {
        toast.success("Đã thêm sản phẩm vào giỏ hàng! 🛒");
      }
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Không thể thêm vào giỏ hàng.");
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart(false);
    if (success) {
      router.push("/cart");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-(--mirai-sem-primary)" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Đang tải chi tiết sản phẩm...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <main className="bg-background py-20 min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <Package className="w-16 h-16 mx-auto opacity-30 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">
            Ối! Đã có lỗi xảy ra
          </h2>
          <p className="text-sm text-muted-foreground">
            {error || "Không thể tải thông tin sản phẩm lúc này."}
          </p>
          <Button asChild className="rounded-[4px]">
            <Link href="/shop">
              <ChevronLeft className="w-4 h-4 mr-2" /> Quay lại cửa hàng
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background py-10 min-h-[80vh]">
      <div className="page-shell">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/shop">Cửa hàng</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground truncate max-w-[200px]">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-6 rounded-[4px] hover:bg-muted"
        >
          <Link href="/shop" className="inline-flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Quay lại cửa hàng
          </Link>
        </Button>

        <div className="grid gap-10 md:grid-cols-2 items-start">
          {/* LEFT: GALLERY SECTION */}
          <div className="space-y-4">
            {/* Primary Image Preview Box */}
            <div className="relative aspect-[3/4] max-w-md mx-auto rounded-3xl border border-(--mirai-sem-border) bg-(--mirai-sem-surface-muted) shadow-md overflow-hidden flex items-center justify-center p-6 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={images[activeImageIndex] || "/placeholder-case.png"}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-full max-w-full object-contain rounded-2xl drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/placeholder-case.png";
                  }}
                />
              </AnimatePresence>

              {isFlashSale && (
                <span className="absolute left-4 top-4 rounded bg-(--mirai-sem-danger) px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wide animate-pulse">
                  Flash Sale
                </span>
              )}
            </div>

            {/* Thumbnail Selection Grid */}
            {images.length > 1 && (
              <div className="flex gap-2 justify-center overflow-x-auto py-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={cn(
                      "h-16 w-16 rounded-xl border-2 overflow-hidden flex items-center justify-center bg-card transition-all active:scale-95 shrink-0 p-1.5",
                      activeImageIndex === index
                        ? "border-(--mirai-sem-primary) shadow-sm"
                        : "border-(--mirai-sem-border) opacity-60 hover:opacity-100 hover:border-muted-foreground",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="max-h-full max-w-full object-contain rounded-lg"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/placeholder-case.png";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS SECTION */}
          <div className="space-y-6">
            {/* Header / Meta */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {product.brandName && (
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20">
                    {product.brandName}
                  </span>
                )}
                {product.categoryName && (
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                    {product.categoryName}
                  </span>
                )}
              </div>

              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating Review Summary */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-(--mirai-sem-warning)">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4 fill-current",
                        i < Math.floor(product.ratingAvg || 5)
                          ? "text-(--mirai-sem-warning)"
                          : "text-muted-foreground/30",
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {product.ratingAvg?.toFixed(1) || "5.0"}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({product.ratingCount || 0} đánh giá)
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-4 rounded-2xl bg-(--mirai-sem-surface-muted) border border-(--mirai-sem-border) flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                  Giá bán sản phẩm
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-(--mirai-sem-danger)">
                    {isFlashSale && flashSalePrice != null
                      ? formatPrice(flashSalePrice)
                      : formatPrice(price)}
                  </span>
                  {isFlashSale && flashSalePrice != null && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status Badge */}
              <div className="text-right">
                <span
                  className={cn(
                    "inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase",
                    stock > 0
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-red-500/10 text-red-500 border border-red-500/20",
                  )}
                >
                  {stock > 0 ? "Còn hàng" : "Hết hàng"}
                </span>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {stock > 0
                    ? `Còn lại ${stock} sản phẩm`
                    : "Vui lòng quay lại sau"}
                </p>
              </div>
            </div>

            {/* Product Variants Selector */}
            <div className="space-y-4">
              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Màu sắc vỏ ốp:{" "}
                    <span className="text-muted-foreground font-normal">
                      {selectedColor}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => {
                      // Determine background color based on name/standard hex fallback
                      let bg = color.toLowerCase();
                      if (bg === "clear" || bg === "trong suốt") bg = "#e5e7eb";
                      if (bg === "primary") bg = "var(--mirai-sem-primary)";
                      if (bg === "accent") bg = "var(--mirai-sem-accent)";

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleColorSelect(color)}
                          className={cn(
                            "px-4 py-2 text-xs font-semibold rounded-xl border transition-all active:scale-95 hover:border-muted-foreground flex items-center gap-2",
                            selectedColor === color
                              ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                              : "bg-card text-muted-foreground border-border",
                          )}
                        >
                          <div
                            className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: bg }}
                          />
                          <span>{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Model Selection */}
              {availableModels.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Dòng máy tương thích:{" "}
                    <span className="text-muted-foreground font-normal">
                      {selectedModel}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableModels.map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => setSelectedModel(model)}
                        className={cn(
                          "px-4 py-2 text-xs font-semibold rounded-xl border transition-all active:scale-95 hover:border-muted-foreground",
                          selectedModel === model
                            ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                            : "bg-card text-muted-foreground border-border",
                        )}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Mô tả sản phẩm
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Actions: Quantity + Cart + Purchase */}
            <div className="pt-4 border-t border-(--mirai-sem-border) space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Quantity input controls */}
                <div className="flex items-center rounded-xl border border-(--mirai-sem-border) bg-card p-1">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange("dec")}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange("inc")}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
                    disabled={quantity >= stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Wishlist Heart button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.productId)}
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-all active:scale-95",
                    wishlisted.includes(product.productId)
                      ? "border-(--mirai-sem-danger) bg-rose-500/5 text-(--mirai-sem-danger)"
                      : "border-(--mirai-sem-border) bg-card hover:bg-muted",
                  )}
                  title={
                    wishlisted.includes(product.productId)
                      ? "Xóa khỏi mục yêu thích"
                      : "Yêu thích sản phẩm"
                  }
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      wishlisted.includes(product.productId) && "fill-current",
                    )}
                  />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <Button
                  onClick={() => handleAddToCart(true)}
                  disabled={addingToCart || stock <= 0}
                  variant="outline"
                  className="rounded-xl h-12 text-sm font-semibold border-2 border-(--mirai-sem-text) text-(--mirai-sem-text) hover:bg-muted transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addingToCart ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
                </Button>

                <Button
                  onClick={handleBuyNow}
                  disabled={stock <= 0}
                  className="rounded-xl h-12 text-sm font-semibold bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
                >
                  Mua ngay
                </Button>
              </div>
            </div>

            {/* Quick Guarantees/Features */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-(--mirai-sem-border) text-[10px] text-muted-foreground text-center font-medium">
              <div className="space-y-1">
                <ShieldCheck className="w-5 h-5 mx-auto text-primary" />
                <p>100% Chính hãng</p>
              </div>
              <div className="space-y-1">
                <Truck className="w-5 h-5 mx-auto text-primary" />
                <p>Giao siêu tốc</p>
              </div>
              <div className="space-y-1">
                <RotateCcw className="w-5 h-5 mx-auto text-primary" />
                <p>7 Ngày đổi trả</p>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS & RATINGS LIST MOCK */}
        <div className="mt-16 border-t border-(--mirai-sem-border) pt-12 max-w-4xl">
          <h3 className="font-heading text-2xl font-bold text-foreground mb-8">
            Đánh Giá từ Khách Hàng
          </h3>

          <div className="space-y-6 divide-y divide-(--mirai-sem-border)">
            {[
              {
                name: "Nguyễn Văn A",
                rating: 5,
                comment:
                  "Ốp điện thoại thiết kế cực kỳ tỉ mỉ, chất lượng gia công cao cấp. Rất đáng đồng tiền bát gạo!",
                date: "24/05/2026",
              },
              {
                name: "Lê Thị B",
                rating: 5,
                comment:
                  "Đã mua lần thứ hai, hình ảnh in ấn tinh xảo sắc nét, bảo vệ máy siêu tốt. Shop giao hàng cực nhanh.",
                date: "12/04/2026",
              },
              {
                name: "Trần Minh C",
                rating: 4,
                comment:
                  "Ốp cầm chắc tay, ôm sát thân máy. Phục vụ nhiệt tình, sẽ ủng hộ tiếp trong tương lai.",
                date: "05/03/2026",
              },
            ].map((review, idx) => (
              <div key={idx} className={cn("space-y-2", idx > 0 && "pt-6")}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">
                    {review.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {review.date}
                  </span>
                </div>
                <div className="flex text-(--mirai-sem-warning)">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5 fill-current",
                        i < review.rating
                          ? "text-(--mirai-sem-warning)"
                          : "text-muted-foreground/30",
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground font-normal">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
