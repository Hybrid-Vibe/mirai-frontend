"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { collectionApi } from "@/lib/api-client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CollectionUIItem {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  href: string;
  itemCount: number;
  tag?: string;
}

const STATIC_FALLBACK_COLLECTIONS: CollectionUIItem[] = [
  {
    id: "jardin-de-fleurs",
    name: "JARDIN DE FLEURS",
    description:
      "Dòng sản phẩm lấy cảm hứng từ thiên nhiên hoa cỏ nhiệt đới rực rỡ và nghệ thuật. Mang đến vẻ ngoài tinh tế, thời trang cho chiếc điện thoại của bạn.",
    coverImage:
      "https://stuwtmcljxqhdlsawtif.supabase.co/storage/v1/object/public/images/uploads/peony.jpg",
    href: "/collections/jardin-de-fleurs",
    itemCount: 4,
    tag: "Mới nhất",
  },
  {
    id: "greengreen-redred",
    name: "GREENGREEN + REDRED",
    description:
      "Sự kết hợp màu sắc đầy ngẫu hứng và độc đáo giữa tông xanh lá mát mắt cùng tông đỏ cá tính và nhiệt huyết.",
    coverImage: "/images/collections/greengreen_redred_cover.png",
    href: "/collections/greengreen-redred",
    itemCount: 8,
    tag: "Nổi bật",
  },
  {
    id: "on-denim",
    name: "ON DENIM",
    description:
      "Bộ sưu tập mang chất liệu và họa tiết Denim cổ điển bụi bặm, đậm chất thời trang đường phố và cực kỳ phong cách.",
    coverImage: "/images/collections/on_denim_cover.png",
    href: "/collections/on-denim",
    itemCount: 4,
    tag: "Xu hướng",
  },
];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionUIItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      setIsLoading(true);
      try {
        const res = await collectionApi.getAllActive();
        if (res && res.length > 0) {
          const mapped = res.map((col) => {
            // Apply cover image fallbacks if backend does not return one
            let coverImage = col.coverImageUrl || "";
            if (!coverImage) {
              if (col.slug === "jardin-de-fleurs") {
                coverImage =
                  "https://stuwtmcljxqhdlsawtif.supabase.co/storage/v1/object/public/images/uploads/peony.jpg";
              } else if (col.slug === "greengreen-redred") {
                coverImage = "/images/collections/greengreen_redred_cover.png";
              } else if (col.slug === "on-denim") {
                coverImage = "/images/collections/on_denim_cover.png";
              } else {
                coverImage =
                  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=60";
              }
            }

            return {
              id: col.collectionId,
              name: col.name,
              description: col.description || "",
              coverImage: coverImage,
              href: `/collections/${col.slug}`,
              itemCount: col.itemCount,
              tag: col.tag || undefined,
            };
          });
          setCollections(mapped);
        } else {
          setCollections(STATIC_FALLBACK_COLLECTIONS);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
        setCollections(STATIC_FALLBACK_COLLECTIONS);
      } finally {
        setIsLoading(false);
      }
    }
    loadCollections();
  }, []);

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
              <BreadcrumbPage>Bộ sưu tập</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="border-b border-border/40 pb-6 mb-10">
          <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">
            Danh sách Bộ sưu tập
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Khám phá những bộ sưu tập ốp lưng và phụ kiện được thiết kế theo các
            chủ đề nghệ thuật độc đáo.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-(--mirai-sem-primary)" />
            <p>Đang tải danh sách bộ sưu tập...</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {collections.map((col) => (
              <article
                key={col.id}
                className="group relative rounded-[4px] border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {col.tag && (
                      <span className="absolute left-4 top-4 z-10 rounded-[4px] bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                        {col.tag}
                      </span>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={col.coverImage}
                      alt={col.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="p-6">
                    <span className="text-xs font-semibold text-primary tracking-wider uppercase">
                      {col.itemCount} sản phẩm
                    </span>
                    <h2 className="mt-2 font-heading text-2xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {col.name}
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {col.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={col.href}
                    className="inline-flex h-10 items-center justify-center rounded-[4px] bg-foreground text-background px-6 text-sm font-semibold transition-all hover:opacity-90 active:scale-95 w-full cursor-pointer"
                  >
                    Khám phá bộ sưu tập
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
