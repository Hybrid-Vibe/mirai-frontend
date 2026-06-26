"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { productApi, collectionApi } from "@/lib/api-client";
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

// Static mock data for robust fallback
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

const mockGreenRedProducts: Product[] = [
  {
    id: "gr-1",
    name: "Green Butterflies Case",
    price: "150.000đ",
    badge: "BUTTERFLY",
    ratingAvg: 4.8,
    ratingCount: 16,
    imageUrl:
      "https://images.unsplash.com/photo-1545486332-9e0998c535b2?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "gr-2",
    name: "Green Star Case",
    price: "150.000đ",
    badge: "STAR",
    ratingAvg: 5,
    ratingCount: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "gr-3",
    name: "Lucky Vicky Case",
    price: "150.000đ",
    badge: "REDRED",
    ratingAvg: 4.6,
    ratingCount: 22,
    imageUrl:
      "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "gr-4",
    name: "Polka Dots Green Case",
    price: "150.000đ",
    badge: "DOTS",
    ratingAvg: 4.9,
    ratingCount: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "gr-5",
    name: "Polka Dots Red Case",
    price: "150.000đ",
    badge: "DOTS",
    ratingAvg: 4.7,
    ratingCount: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "gr-6",
    name: "Red Star Case",
    price: "150.000đ",
    badge: "STAR",
    ratingAvg: 4.9,
    ratingCount: 21,
    imageUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "gr-7",
    name: "Green Stripe Case",
    price: "150.000đ",
    badge: "STRIPE",
    ratingAvg: 4.8,
    ratingCount: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "gr-8",
    name: "Red Stripe Case",
    price: "150.000đ",
    badge: "STRIPE",
    ratingAvg: 4.5,
    ratingCount: 19,
    imageUrl:
      "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=500&auto=format&fit=crop&q=60",
  },
];

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

const STATIC_METADATA: Record<
  string,
  { name: string; description: string; tag: string; mockProducts: Product[] }
> = {
  "jardin-de-fleurs": {
    name: "JARDIN DE FLEURS",
    description:
      "Dòng ốp lưng lấy cảm hứng từ những đóa hoa rực rỡ và tràn đầy sức sống. Biến chiếc điện thoại của bạn thành một tác phẩm nghệ thuật thiên nhiên đầy cuốn hút.",
    tag: "Mới nhất",
    mockProducts: mockJardinProducts,
  },
  "greengreen-redred": {
    name: "GREENGREEN + REDRED",
    description:
      "Màu sắc tương phản đầy ấn tượng. Sự kết hợp giữa sắc xanh dịu mắt của thiên nhiên và sắc đỏ nồng nàn rực cháy cho phong cách độc nhất vô nhị.",
    tag: "Nổi bật",
    mockProducts: mockGreenRedProducts,
  },
  "on-denim": {
    name: "ON DENIM",
    description:
      "Chất bụi bặm mang hơi hướng thời trang đường phố cổ điển. Dòng sản phẩm lấy cảm hứng từ chất liệu vải bò Denim bền bỉ, cá tính và cực kỳ sành điệu.",
    tag: "Xu hướng",
    mockProducts: mockDenimProducts,
  },
};

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [collection, setCollection] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    // Use default fallback if slug matches static ones
    const staticMeta = STATIC_METADATA[slug];

    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch collection details
        let fetchedCollection = null;
        try {
          fetchedCollection = await collectionApi.getBySlug(slug);
          if (fetchedCollection) {
            setCollection({
              name: fetchedCollection.name,
              description: fetchedCollection.description || "",
            });
          }
        } catch (colErr) {
          console.warn(
            "Could not load collection details, falling back:",
            colErr,
          );
        }

        if (!fetchedCollection && staticMeta) {
          setCollection({
            name: staticMeta.name,
            description: staticMeta.description,
          });
        }

        // Fetch products in this collection
        const res = await productApi.getProductsByFilter({
          collectionSlug: slug,
          pageSize: 100,
        });
        if (res && res.length > 0) {
          const mapped = res.map((p) => {
            const variant = p.variants?.[0];
            let priceStr = (variant?.price ?? 0).toLocaleString("vi-VN") + "đ";
            let oldPriceStr = undefined;
            let badgeStr = staticMeta ? staticMeta.name : "COLLECTION";

            if (variant?.isFlashSale && variant?.flashSalePrice != null) {
              priceStr = variant.flashSalePrice.toLocaleString("vi-VN") + "đ";
              oldPriceStr = (variant.price ?? 0).toLocaleString("vi-VN") + "đ";
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
              imageUrl:
                p.productImages?.[0]?.imageUrl ||
                "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=60",
            };
          });
          setProducts(mapped);
        } else if (staticMeta) {
          setProducts(staticMeta.mockProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error loading collection products:", err);
        if (staticMeta) {
          setCollection({
            name: staticMeta.name,
            description: staticMeta.description,
          });
          setProducts(staticMeta.mockProducts);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const displayCollectionName =
    collection?.name || (STATIC_METADATA[slug]?.name ?? "Bộ sưu tập");
  const displayCollectionDesc =
    collection?.description || (STATIC_METADATA[slug]?.description ?? "");

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
              <BreadcrumbPage>{displayCollectionName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="border-b border-border/40 pb-6 mb-8">
          <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl uppercase">
            {displayCollectionName}
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            {displayCollectionDesc}
          </p>
        </div>

        {isLoading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-(--mirai-sem-primary)" />
            <p>Đang tải bộ sưu tập...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <p>Không tìm thấy sản phẩm nào trong bộ sưu tập này.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {products.map((product, index) => (
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
