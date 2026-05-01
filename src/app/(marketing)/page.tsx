import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Headphones,
  Headset,
  Laptop,
  ShieldCheck,
  Smartphone,
  Truck,
  Watch,
} from "lucide-react";
import { InteractiveProductCard } from "@/components/features/marketing/interactive-product-card";
import { CountdownTimer } from "@/components/features/marketing/countdown-timer";

type Product = {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
};

const heroCategories = [
  { label: "Phone Cases", href: "/shop?category=phone-cases" },
  { label: "Laptop Cases", href: "/shop?category=laptop-cases" },
  { label: "Airpod Cases", href: "/shop?category=airpod-cases" },
  { label: "Phụ kiện", href: "/shop?category=accessories" },
  { label: "Bộ sưu tập", href: "/collections" },
];

const flashSales: Product[] = [
  {
    id: "fs-1",
    name: "Ốp lưng ASA STAR HEART",
    price: "85.000d",
    oldPrice: "100.000d",
    badge: "-15%",
  },
  {
    id: "fs-2",
    name: "Phụ kiện móc khoá",
    price: "95.000d",
    oldPrice: "120.000d",
    badge: "-20%",
  },
  {
    id: "fs-3",
    name: "Ốp lưng Airpod Metallic",
    price: "120.000d",
    oldPrice: "150.000d",
  },
  {
    id: "fs-4",
    name: "Phone Case Icon",
    price: "90.000d",
    oldPrice: "100.000d",
  },
  {
    id: "fs-5",
    name: "Phone Case Wave",
    price: "88.000d",
    oldPrice: "96.000d",
  },
];

const bestSelling: Product[] = [
  {
    id: "bs-1",
    name: "Phone Case Chrome",
    price: "120.000d",
    oldPrice: "150.000d",
  },
  {
    id: "bs-2",
    name: "Phone Case Pixel",
    price: "129.000d",
    oldPrice: "150.000d",
  },
  {
    id: "bs-3",
    name: "Phone Case Bloom",
    price: "129.000d",
    oldPrice: "150.000d",
  },
  { id: "bs-4", name: "Phone Case Mini", price: "122.000d" },
];

const exploreProducts: Product[] = [
  {
    id: "ep-1",
    name: "Phone Case",
    price: "120.000d",
    oldPrice: "150.000d",
    badge: "-35%",
  },
  { id: "ep-2", name: "Phone Case", price: "129.000d" },
  { id: "ep-3", name: "Phone Case", price: "129.000d" },
  { id: "ep-4", name: "Phone Case", price: "120.000d" },
  { id: "ep-5", name: "Phone Case", price: "120.000d", oldPrice: "150.000d" },
  { id: "ep-6", name: "Phone Case", price: "129.000d" },
  { id: "ep-7", name: "Phone Case", price: "110.000d", badge: "NEW" },
  { id: "ep-8", name: "Phone Case", price: "120.000d" },
];

const categories = [
  { label: "Phone Cases", icon: <Smartphone className="h-7 w-7" /> },
  { label: "Laptop Cases", icon: <Laptop className="h-7 w-7" /> },
  { label: "Smart Watch", icon: <Watch className="h-7 w-7" /> },
  { label: "Airpod Cases", icon: <Headphones className="h-7 w-7" /> },
  { label: "Others", icon: <Camera className="h-7 w-7" /> },
];

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-3">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-block h-8 w-2 rounded-sm bg-(--mirai-sem-accent)" />
          <span className="text-sm font-semibold text-(--mirai-sem-accent)">
            {label}
          </span>
        </div>
        <h2 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
          {title}
        </h2>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--mirai-color-line)"
          aria-label="Previous"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--mirai-color-line)"
          aria-label="Next"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ProductCard is removed and replaced by InteractiveProductCard from features/marketing

export default function HomePage() {
  return (
    <main className="bg-background pb-20">
      <section className="page-shell border-b border-(--mirai-color-line) py-8">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="hidden border-r border-(--mirai-color-line) pr-6 lg:block">
            <ul className="space-y-3 pt-2">
              {heroCategories.map((item, idx) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between text-sm text-foreground transition-all duration-200 hover:text-(--mirai-sem-primary) hover:translate-x-1 active:scale-[0.98]"
                  >
                    <span>{item.label}</span>
                    <ArrowRight
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${idx < 2 ? "opacity-100 group-hover:translate-x-1" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div className="grid gap-4">
            <div className="grid min-h-[330px] items-center gap-6 rounded-[4px] bg-(--mirai-sem-text) px-8 py-8 text-(--mirai-sem-background) md:grid-cols-2 md:px-12">
              <div>
                <p className="mb-3 text-sm text-(--mirai-sem-primary)">
                  AI Custom Case
                </p>
                <h1 className="font-heading text-4xl font-semibold leading-tight md:text-5xl">
                  Thiết kế ốp lưng mang dấu ấn riêng của bạn
                </h1>
                <Link
                  href="/customize"
                  className="mt-8 inline-flex items-center gap-2 text-sm underline transition-colors hover:text-(--mirai-sem-primary)"
                >
                  Khám phá ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mx-auto flex h-56 w-48 items-center justify-center rounded-[28px] border border-(--mirai-sem-border) bg-gradient-to-b from-(--mirai-sem-text-muted) via-(--mirai-sem-accent) to-(--mirai-sem-primary) shadow-[0_30px_80px_var(--mirai-state-focus-ring)]">
                <span className="font-heading text-4xl font-semibold text-(--mirai-sem-background)">
                  MIRAI
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${i === 2 ? "bg-(--mirai-sem-primary)" : "bg-(--mirai-sem-surface-muted)"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16">
        <SectionHeading label="Hôm nay" title="Flash Sales" />
        <CountdownTimer
          initialDays={3}
          initialHours={23}
          initialMinutes={19}
          initialSeconds={56}
          format="block"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {flashSales.map((product) => (
            <InteractiveProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex min-w-44 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-(--mirai-state-primary-hover) active:scale-[0.98]"
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
      </section>

      <section className="page-shell border-t border-(--mirai-color-line) py-16">
        <SectionHeading label="Danh mục" title="Tìm kiếm theo Danh mục" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((category, index) => (
            <button
              key={category.label}
              type="button"
              className={`flex h-36 flex-col items-center justify-center gap-3 rounded-[4px] border border-(--mirai-color-line) text-center transition-all duration-200 hover:border-(--mirai-sem-primary) hover:-translate-y-1 hover:shadow-md active:scale-[0.98] ${
                index === 0
                  ? "bg-(--mirai-sem-primary) text-foreground hover:bg-(--mirai-state-primary-hover)"
                  : "bg-card text-foreground hover:text-(--mirai-sem-primary)"
              }`}
            >
              {category.icon}
              <span className="font-body text-sm font-medium">
                {category.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="page-shell border-t border-(--mirai-color-line) py-16">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block h-8 w-2 rounded-sm bg-(--mirai-sem-accent)" />
              <span className="text-sm font-semibold text-(--mirai-sem-accent)">
                Tháng này
              </span>
            </div>
            <h2 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
              Sản phẩm bán chạy nhất tháng
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex h-10 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-(--mirai-state-primary-hover) active:scale-[0.98]"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestSelling.map((product) => (
            <InteractiveProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="page-shell py-16">
        <div className="grid min-h-[320px] items-center gap-8 rounded-[4px] bg-(--mirai-sem-text) px-8 py-10 text-(--mirai-sem-background) md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm text-(--mirai-sem-primary)">
              Bộ sưu tập tháng
            </p>
            <h2 className="font-heading text-4xl font-semibold leading-tight md:text-5xl">
              Khám phá phong cách của riêng bạn
            </h2>
            <CountdownTimer
              initialDays={23}
              initialHours={5}
              initialMinutes={39}
              initialSeconds={35}
              format="inline"
            />
            <Link
              href="/customize"
              className="mt-8 inline-flex min-w-36 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-(--mirai-state-primary-hover) active:scale-[0.98]"
            >
              Mua ngay
            </Link>
          </div>
          <div className="mx-auto h-64 w-full max-w-xs rounded-3xl border border-(--mirai-sem-border) bg-gradient-to-br from-(--mirai-sem-text-muted) via-(--mirai-sem-text) to-(--mirai-sem-primary)/70" />
        </div>
      </section>

      <section className="page-shell py-16">
        <SectionHeading label="Sản phẩm" title="Khám phá sản phẩm" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {exploreProducts.map((product) => (
            <InteractiveProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex min-w-44 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-(--mirai-state-primary-hover) active:scale-[0.98]"
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
      </section>

      <section className="page-shell border-t border-(--mirai-color-line) py-16">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-8 w-2 rounded-sm bg-(--mirai-sem-accent)" />
            <span className="text-sm font-semibold text-(--mirai-sem-accent)">
              Nổi bật
            </span>
          </div>
          <h2 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
            Tính năng mới
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <article className="relative min-h-[420px] rounded-[4px] bg-(--mirai-sem-text) p-8 text-(--mirai-sem-background)">
            <h3 className="font-heading text-4xl font-semibold">Customize</h3>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Trải nghiệm tạo mẫu cá nhân hóa với AI và chỉnh sửa thủ công.
            </p>
            <Link
              href="/customize"
              className="mt-5 inline-flex items-center text-sm underline transition-colors hover:text-(--mirai-sem-primary)"
            >
              Mua ngay
            </Link>
            <div className="absolute bottom-8 right-8 h-40 w-28 rounded-2xl bg-gradient-to-br from-(--mirai-sem-primary) to-(--mirai-sem-accent)" />
          </article>

          <div className="grid gap-5">
            <article className="relative min-h-[200px] rounded-[4px] bg-(--mirai-sem-text) p-6 text-(--mirai-sem-background)">
              <h3 className="font-heading text-3xl font-semibold">
                Women&apos;s Collections
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Các bộ sưu tập theo chủ đề nổi bật trong tuần.
              </p>
            </article>

            <div className="grid gap-5 md:grid-cols-2">
              <article className="relative min-h-[200px] rounded-[4px] bg-(--mirai-sem-text) p-6 text-(--mirai-sem-background)">
                <h3 className="font-heading text-3xl font-semibold">
                  Hot cases
                </h3>
              </article>
              <article className="relative min-h-[200px] rounded-[4px] bg-(--mirai-sem-warning) p-6 text-(--mirai-sem-text)">
                <h3 className="font-heading text-3xl font-semibold">
                  Phụ kiện
                </h3>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-8">
        <div className="grid gap-8 py-6 md:grid-cols-3">
          {[
            {
              icon: <Truck className="h-6 w-6" />,
              title: "GIAO HÀNG MIỄN PHÍ VÀ NHANH CHÓNG",
              desc: "Miễn phí giao hàng cho tất cả đơn hàng từ 500.000d.",
            },
            {
              icon: <Headset className="h-6 w-6" />,
              title: "DỊCH VỤ KHÁCH HÀNG 24/7",
              desc: "Hỗ trợ khách hàng nhanh nhất mọi thời điểm.",
            },
            {
              icon: <ShieldCheck className="h-6 w-6" />,
              title: "ĐẢM BẢO HOÀN TIỀN",
              desc: "Chính sách hoàn tiền trong vòng 3 ngày.",
            },
          ].map((service) => (
            <article key={service.title} className="text-center">
              <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-(--mirai-sem-text-muted) text-(--mirai-sem-background)">
                {service.icon}
              </span>
              <h3 className="mt-5 font-body text-base font-semibold text-foreground">
                {service.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {service.desc}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
