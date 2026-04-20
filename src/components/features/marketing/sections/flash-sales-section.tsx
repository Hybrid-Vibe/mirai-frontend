import Link from "next/link";
import { ArrowRight, Flame, Star, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const deals = [
  {
    id: "deal-1",
    name: "Neon Drift Pack",
    model: "iPhone 15 Pro Max",
    salePrice: "139.000đ",
    oldPrice: "219.000đ",
    rating: "4.9",
    gradient: "from-[#ff7ba5] to-[#7367f0]",
  },
  {
    id: "deal-2",
    name: "Cyan Pulse Collection",
    model: "Samsung S24 Ultra",
    salePrice: "149.000đ",
    oldPrice: "229.000đ",
    rating: "4.8",
    gradient: "from-[#4349e7] to-[#48e1ed]",
  },
  {
    id: "deal-3",
    name: "Retro Pixel Mood",
    model: "Xiaomi 14",
    salePrice: "129.000đ",
    oldPrice: "199.000đ",
    rating: "4.7",
    gradient: "from-[#48e1ed] to-[#4d91ff]",
  },
  {
    id: "deal-4",
    name: "Classic Black Mirror",
    model: "iPhone 14",
    salePrice: "119.000đ",
    oldPrice: "179.000đ",
    rating: "4.8",
    gradient: "from-[#5f5f5f] to-[#111111]",
  },
] as const;

export function FlashSalesSection() {
  return (
    <section id="flash-sales" className="py-12 md:py-16">
      <div className="page-shell">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-[10px] border border-border bg-card p-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-[#ff6b35]" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Today
              </p>
              <h2 className="font-heading text-2xl font-semibold md:text-3xl">Flash Sales</h2>
            </div>
            <Badge variant="hot" className="ml-1 hidden sm:inline-flex">
              HOT
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Timer className="h-4 w-4 text-[color:var(--mirai-color-brand-strong)]" />
            <span className="text-muted-foreground">Kết thúc sau:</span>
            <span className="rounded-[6px] bg-[color:var(--mirai-color-brand-strong)] px-2 py-1 font-medium text-white">
              03 : 25 : 48
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deals.map((deal) => (
            <article
              key={deal.id}
              className="overflow-hidden rounded-[10px] border border-border bg-card"
            >
              <div className={`flex h-44 items-center justify-center bg-gradient-to-br ${deal.gradient}`}>
                <div className="h-32 w-20 rounded-[16px] border border-white/40 bg-black/10" />
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground">{deal.model}</p>
                <h3 className="mt-1 font-heading text-lg font-semibold">{deal.name}</h3>

                <div className="mt-2 flex items-center gap-1 text-xs">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{deal.rating}</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <p className="font-heading text-lg font-semibold text-[color:var(--mirai-color-brand-strong)]">
                    {deal.salePrice}
                  </p>
                  <p className="text-sm text-muted-foreground line-through">{deal.oldPrice}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="group rounded-[6px] border-[color:var(--mirai-color-brand)]/40 bg-transparent px-6"
          >
            <Link href="/shop">
              Xem tất cả sản phẩm
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
