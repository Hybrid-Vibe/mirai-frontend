import { Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: "best-1",
    name: "Anime Sakura Bloom",
    model: "iPhone 15 Pro Max",
    price: "179.000đ",
    oldPrice: "249.000đ",
    rating: "4.9",
    color: "from-[#fd89c6] to-[#9f67f6]",
    isNew: true,
  },
  {
    id: "best-2",
    name: "Dark Urban Neon",
    model: "Samsung S24 Ultra",
    price: "169.000đ",
    oldPrice: "229.000đ",
    rating: "4.8",
    color: "from-[#4349e7] to-[#48e1ed]",
    isNew: false,
  },
  {
    id: "best-3",
    name: "Y2K Chrome Wave",
    model: "iPhone 14 Pro",
    price: "159.000đ",
    oldPrice: "219.000đ",
    rating: "4.7",
    color: "from-[#48e1ed] to-[#4ba4ff]",
    isNew: true,
  },
  {
    id: "best-4",
    name: "Minimal Monochrome",
    model: "Xiaomi 14",
    price: "149.000đ",
    oldPrice: "199.000đ",
    rating: "4.8",
    color: "from-[#4a4a4a] to-[#111111]",
    isNew: false,
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="border-y border-border py-12 md:py-16">
      <div className="page-shell">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[color:var(--mirai-color-brand-strong)]">
              Best selling products
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">
              Sản phẩm bán chạy
            </h2>
          </div>
          <Button variant="outline" className="hidden rounded-[6px] md:inline-flex">
            Xem tất cả
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-[10px] border border-border bg-card"
            >
              <div className={`relative flex h-52 items-center justify-center bg-gradient-to-br ${product.color}`}>
                {product.isNew && <Badge className="absolute left-3 top-3 bg-white text-black">NEW</Badge>}
                <button
                  type="button"
                  aria-label={`Add ${product.name} to wishlist`}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-white/90 text-black"
                >
                  <Heart className="h-4 w-4" />
                </button>
                <div className="h-36 w-20 rounded-[18px] border border-white/40 bg-black/10" />
              </div>

              <div className="p-4">
                <p className="text-xs text-muted-foreground">{product.model}</p>
                <h3 className="mt-1 font-heading text-lg font-semibold">{product.name}</h3>

                <div className="mt-2 flex items-center gap-1 text-xs">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{product.rating}</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <p className="font-heading text-lg font-semibold text-[color:var(--mirai-color-brand-strong)]">
                    {product.price}
                  </p>
                  <p className="text-sm text-muted-foreground line-through">{product.oldPrice}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
