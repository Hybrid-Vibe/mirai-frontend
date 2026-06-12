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
  productId?: string;
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  ratingAvg?: number;
  ratingCount?: number;
  imageUrl?: string;
};

const mockDenimProducts: Product[] = [
  {
    id: "denim-1",
    name: "Denim & Gold Stars Case",
    price: "160.000đ",
    badge: "ON DENIM",
    ratingAvg: 4.9,
    ratingCount: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "denim-2",
    name: "Denim Badge 'I Did My Best' Case",
    price: "165.000đ",
    badge: "PATCH",
    ratingAvg: 4.7,
    ratingCount: 19,
    imageUrl:
      "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "denim-3",
    name: "Denim & White Lace Case",
    price: "155.000đ",
    badge: "LACE",
    ratingAvg: 4.8,
    ratingCount: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "denim-4",
    name: "Denim & Teddy Bear Case",
    price: "175.000đ",
    badge: "BEAR",
    ratingAvg: 5,
    ratingCount: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=500&auto=format&fit=crop&q=60",
  },
];

export default function DenimCollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const res = await productApi.getProductsByFilter({ pageSize: 100 });
        if (res && res.length > 0) {
          const filtered = res.filter(
            (p) =>
              p.name?.toLowerCase().includes("gold stars") ||
              p.name?.toLowerCase().includes("i did my best") ||
              p.name?.toLowerCase().includes("white lace") ||
              p.name?.toLowerCase().includes("teddy bear"),
          );

          if (filtered.length > 0) {
            const mapped = filtered.map((p) => {
              const variant = p.variants?.[0];
              let priceStr =
                (variant?.price ?? 0).toLocaleString("vi-VN") + "đ";
              let oldPriceStr = undefined;
              let badgeStr = "DENIM";

              if (variant?.isFlashSale && variant?.flashSalePrice != null) {
                priceStr = variant.flashSalePrice.toLocaleString("vi-VN") + "đ";
                oldPriceStr =
                  (variant.price ?? 0).toLocaleString("vi-VN") + "đ";
                badgeStr = "FLASH SALE";
              }

              return {
                id: variant?.variantId || p.productId,
                productId: p.productId,
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
        console.error("Error loading Denim collection:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const displayProducts = products.length > 0 ? products : mockDenimProducts;

  return (
    <main className="bg-background py-14 min-h-screen">
      <section className="page-shell">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbLink href="/collections">Bộ sưu tập</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>ON DENIM</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="border-b border-border/40 pb-6 mb-8">
          <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">
            ON DENIM
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Chất bụi bặm mang hơi hướng thời trang đường phố cổ điển. Dòng sản
            phẩm lấy cảm hứng từ chất liệu vải bò Denim bền bỉ, cá tính và cực
            kỳ sành điệu.
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
