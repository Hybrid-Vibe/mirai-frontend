"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { productApi } from "@/lib/api-client";
import { InteractiveProductCard } from "@/components/features/marketing/interactive-product-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Product = {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  ratingAvg?: number;
  ratingCount?: number;
  imageUrl?: string;
};

const mockGreenRedProducts: Product[] = [
  {
    id: "gr-1",
    name: "Ốp Camo Green & Crimson Red",
    price: "135.000đ",
    badge: "NEW",
    ratingAvg: 4.8,
    ratingCount: 16,
    imageUrl:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "gr-2",
    name: "Ốp Forest Green & Burgundy Red",
    price: "140.000đ",
    badge: "GREENGREEN",
    ratingAvg: 5,
    ratingCount: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "gr-3",
    name: "Ốp Mint Green & Cherry Red",
    price: "125.000đ",
    badge: "REDRED",
    ratingAvg: 4.6,
    ratingCount: 22,
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "gr-4",
    name: "Ốp Lime Green & Scarlet Red",
    price: "130.000đ",
    oldPrice: "160.000đ",
    badge: "SALE",
    ratingAvg: 4.9,
    ratingCount: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
  },
];

export default function GreenRedCollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const res = await productApi.getProductsByFilter({ pageSize: 100 });
        if (res && res.length > 0) {
          // Lọc các sản phẩm có chữ Green hoặc Red trong tên hoặc mô tả từ database nếu có
          const filtered = res.filter(
            (p) =>
              p.name?.toLowerCase().includes("green") ||
              p.name?.toLowerCase().includes("red") ||
              p.name?.toLowerCase().includes("đỏ") ||
              p.name?.toLowerCase().includes("xanh lá"),
          );

          if (filtered.length > 0) {
            const mapped = filtered.map((p) => {
              const variant = p.variants?.[0];
              let priceStr =
                (variant?.price ?? 0).toLocaleString("vi-VN") + "đ";
              let oldPriceStr = undefined;
              let badgeStr = "GREEN-RED";

              if (variant?.isFlashSale && variant?.flashSalePrice != null) {
                priceStr = variant.flashSalePrice.toLocaleString("vi-VN") + "đ";
                oldPriceStr =
                  (variant.price ?? 0).toLocaleString("vi-VN") + "đ";
                badgeStr = "FLASH SALE";
              }

              return {
                id: variant?.variantId || p.productId,
                name: p.name || "Sản phẩm",
                price: priceStr,
                oldPrice: oldPriceStr,
                badge: badgeStr,
                ratingAvg: p.ratingAvg ?? 5,
                ratingCount: p.ratingCount ?? 0,
                imageUrl: p.productImages?.[0]?.imageUrl,
              };
            });
            setProducts(mapped);
            return;
          }
        }
      } catch (err) {
        console.error("Error loading GreenRed collection:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const displayProducts = products.length > 0 ? products : mockGreenRedProducts;

  return (
    <main className="bg-background py-14 min-h-screen">
      <section className="page-shell">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/collections">Bộ sưu tập</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>GREENGREEN + REDRED</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="border-b border-border/40 pb-6 mb-8">
          <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">
            GREENGREEN + REDRED
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Màu sắc tương phản đầy ấn tượng. Sự kết hợp giữa sắc xanh dịu mắt
            của thiên nhiên và sắc đỏ nồng nàn rực cháy cho phong cách độc nhất
            vô nhị.
          </p>
        </div>

        {isLoading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-(--mirai-sem-primary)" />
            <p>Đang tải bộ sưu tập...</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {displayProducts.map((product, index) => (
              <InteractiveProductCard
                key={`${product.id}-${index}`}
                product={product}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
