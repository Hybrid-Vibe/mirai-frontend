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

const mockJardinProducts: Product[] = [
  {
    id: "jardin-1",
    name: "Hoa Cẩm Tú Cầu",
    price: "150.000đ",
    badge: "JARDIN",
    ratingAvg: 5,
    ratingCount: 12,
    imageUrl:
      "https://stuwtmcljxqhdlsawtif.supabase.co/storage/v1/object/public/images/uploads/camtucau.jpg",
  },
  {
    id: "jardin-2",
    name: "Hoa Lily",
    price: "150.000đ",
    badge: "JARDIN",
    ratingAvg: 5,
    ratingCount: 8,
    imageUrl:
      "https://stuwtmcljxqhdlsawtif.supabase.co/storage/v1/object/public/images/uploads/lily.jpg",
  },
  {
    id: "jardin-3",
    name: "Hoa Mẫu Đơn",
    price: "150.000đ",
    badge: "JARDIN",
    ratingAvg: 5,
    ratingCount: 15,
    imageUrl:
      "https://stuwtmcljxqhdlsawtif.supabase.co/storage/v1/object/public/images/uploads/peony.jpg",
  },
  {
    id: "jardin-4",
    name: "Hoa Hồng",
    price: "150.000đ",
    badge: "JARDIN",
    ratingAvg: 5,
    ratingCount: 22,
    imageUrl:
      "https://stuwtmcljxqhdlsawtif.supabase.co/storage/v1/object/public/images/uploads/rose.jpg",
  },
];

export default function JardinCollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchJardin() {
      setIsLoading(true);
      try {
        const res = await productApi.getProductsByFilter({ pageSize: 100 });
        if (res && res.length > 0) {
          const floral = res.filter(
            (p) =>
              p.name?.toLowerCase().includes("hoa cẩm tú cầu") ||
              p.name?.toLowerCase().includes("hoa lily") ||
              p.name?.toLowerCase().includes("hoa mẫu đơn") ||
              p.name?.toLowerCase().includes("hoa hồng"),
          );

          if (floral.length > 0) {
            const mapped = floral.map((p) => {
              const variant = p.variants?.[0];
              let priceStr =
                (variant?.price ?? 0).toLocaleString("vi-VN") + "đ";
              let oldPriceStr = undefined;
              let badgeStr = "JARDIN";

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
        console.error("Error loading Jardin collection:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJardin();
  }, []);

  const displayProducts = products.length > 0 ? products : mockJardinProducts;

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
              <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Jardin De Fleurs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="border-b border-border/40 pb-6 mb-8">
          <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">
            Jardin De Fleurs
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Dòng ốp lưng lấy cảm hứng từ những đóa hoa rực rỡ và tràn đầy sức
            sống. Biến chiếc điện thoại của bạn thành một tác phẩm nghệ thuật
            thiên nhiên đầy cuốn hút.
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
