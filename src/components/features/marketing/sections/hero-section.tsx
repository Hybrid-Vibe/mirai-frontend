import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const trustSignals = [
  {
    title: "Miễn phí vận chuyển",
    description: "Áp dụng cho đơn hàng từ 500.000đ",
    icon: Truck,
  },
  {
    title: "In UV cao cấp",
    description: "Màu sắc bền, hạn chế trầy xước",
    icon: ShieldCheck,
  },
  {
    title: "AI gợi ý tức thì",
    description: "Tạo 3 mẫu thiết kế chỉ trong vài giây",
    icon: WandSparkles,
  },
] as const;

const stats = [
  { label: "Khách hàng hài lòng", value: "12.5K+" },
  { label: "Thiết kế đã tạo", value: "48K+" },
  { label: "Đánh giá trung bình", value: "4.9/5" },
] as const;

export function HeroSection() {
  return (
    <section className="border-b border-border py-10 md:py-14">
      <div className="page-shell grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <Badge
            variant="cyan"
            className="mb-5 border-(--mirai-color-brand) bg-(--mirai-color-brand)/10 text-(--mirai-color-brand-strong)"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Thiết kế từ Figma · Light mode first
          </Badge>

          <h1 className="font-heading text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            Thiết kế ốp lưng theo vibe của bạn với{" "}
            <span className="text-(--mirai-color-brand-strong)">MIRAI AI</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Chọn dòng máy, nhập prompt và nhận ngay 3 phương án thiết kế. Sau đó
            bạn có thể chỉnh sửa trước khi đặt hàng.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="h-11 rounded-[6px] bg-(--mirai-color-brand-strong) px-6 text-sm text-white hover:opacity-90"
            >
              <Link href="/customize">
                Bắt đầu thiết kế
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-[6px] px-6 text-sm"
            >
              <Link href="/shop">Xem sản phẩm có sẵn</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-[8px] border border-border bg-card p-3"
              >
                <p className="font-heading text-2xl font-semibold text-(--mirai-color-brand-strong)">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[16px] border border-border bg-card p-4 shadow-(--mirai-shadow-sm) md:p-5">
          <div className="rounded-[12px] bg-(--mirai-color-brand-strong) p-5 text-white">
            <p className="text-sm opacity-80">MIRAI Exclusive Banner</p>
            <p className="mt-2 font-heading text-2xl font-semibold leading-tight">
              Up to 30% off voucher
            </p>
            <Button
              asChild
              variant="ghost"
              className="mt-4 h-auto p-0 text-sm text-white hover:bg-transparent hover:text-white"
            >
              <Link href="/shop">
                Shop now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-4 grid gap-3">
            {trustSignals.map((signal) => (
              <div
                key={signal.title}
                className="flex items-start gap-3 rounded-[8px] border border-border bg-background p-3"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-(--mirai-color-brand)/15 text-(--mirai-color-brand-strong)">
                  <signal.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{signal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {signal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
