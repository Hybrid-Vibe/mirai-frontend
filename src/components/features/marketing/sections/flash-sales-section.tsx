"use client";

import { useEffect, useMemo, useState } from "react";
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
    gradient: "from-(--mirai-sem-accent) to-(--mirai-sem-primary)",
  },
  {
    id: "deal-2",
    name: "Cyan Pulse Collection",
    model: "Samsung S24 Ultra",
    salePrice: "149.000đ",
    oldPrice: "229.000đ",
    rating: "4.8",
    gradient: "from-(--mirai-sem-text) to-(--mirai-sem-accent)",
  },
  {
    id: "deal-3",
    name: "Retro Pixel Mood",
    model: "Xiaomi 14",
    salePrice: "129.000đ",
    oldPrice: "199.000đ",
    rating: "4.7",
    gradient: "from-(--mirai-sem-primary) to-(--mirai-sem-accent)",
  },
  {
    id: "deal-4",
    name: "Classic Black Mirror",
    model: "iPhone 14",
    salePrice: "119.000đ",
    oldPrice: "179.000đ",
    rating: "4.8",
    gradient: "from-(--mirai-sem-text-muted) to-(--mirai-sem-text)",
  },
] as const;

const INITIAL_REMAINING_SECONDS = 3 * 60 * 60 + 25 * 60 + 48;

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hours} : ${minutes} : ${seconds}`;
}

export function FlashSalesSection() {
  const [remainingSeconds, setRemainingSeconds] = useState(
    INITIAL_REMAINING_SECONDS,
  );
  const [addingDealId, setAddingDealId] = useState<string | null>(null);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const countdownLabel = useMemo(
    () => formatCountdown(remainingSeconds),
    [remainingSeconds],
  );

  const handleQuickAdd = (dealId: string) => {
    setAddingDealId(dealId);
    window.setTimeout(() => {
      setAddingDealId((prev) => (prev === dealId ? null : prev));
    }, 700);
  };

  return (
    <section id="flash-sales" className="py-12 md:py-16">
      <div className="page-shell">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-[10px] border border-border bg-card p-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-(--mirai-sem-warning)" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Today
              </p>
              <h2 className="type-heading-md">Flash Sales</h2>
            </div>
            <Badge variant="danger" className="ml-1 hidden sm:inline-flex">
              HOT
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Timer className="h-4 w-4 text-(--mirai-color-brand-strong)" />
            <span className="text-muted-foreground">Kết thúc sau:</span>
            <span className="rounded-[6px] bg-(--mirai-color-brand-strong) px-2 py-1 font-medium text-(--mirai-sem-background)">
              {countdownLabel}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deals.map((deal) => (
            <article
              key={deal.id}
              className="overflow-hidden rounded-[10px] border border-border bg-card"
            >
              <div
                className={`flex h-44 items-center justify-center bg-gradient-to-br ${deal.gradient}`}
              >
                <div className="h-32 w-20 rounded-[16px] border border-white/40 bg-black/10" />
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground">{deal.model}</p>
                <h3 className="mt-1 font-heading text-lg font-semibold">
                  {deal.name}
                </h3>

                <div className="mt-2 flex items-center gap-1 text-xs">
                  <Star className="h-3.5 w-3.5 fill-current text-(--mirai-sem-warning)" />
                  <span>{deal.rating}</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <p className="font-heading text-lg font-semibold text-(--mirai-color-brand-strong)">
                    {deal.salePrice}
                  </p>
                  <p className="text-sm text-muted-foreground line-through">
                    {deal.oldPrice}
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  className="mt-4 w-full rounded-[6px]"
                  loading={addingDealId === deal.id}
                  loadingText="Đang thêm..."
                  onClick={() => handleQuickAdd(deal.id)}
                >
                  Thêm vào giỏ
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="group rounded-[6px] border-(--mirai-color-brand)/40 bg-transparent px-6"
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
