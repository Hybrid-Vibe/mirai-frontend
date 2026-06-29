export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Headset, ShieldCheck, Truck } from "lucide-react";
import { InteractiveProductCard } from "@/components/features/marketing/interactive-product-card";
import { CountdownTimer } from "@/components/features/marketing/countdown-timer";
import { ScrollButtons } from "@/components/features/marketing/scroll-buttons";
import { HomeBannerCarousel } from "@/components/features/marketing/home-banner-carousel";
import { productApi } from "@/lib/api-client";
import { cookies } from "next/headers";
import vi from "@/dictionaries/vi.json";
import en from "@/dictionaries/en.json";

type Product = {
  id: string;
  productId?: string;
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  ratingAvg?: number;
  ratingCount?: number;
  endTime?: string;
  imageUrl?: string;
};

const flashSales: Product[] = [
  {
    id: "VAR121",
    name: "Ốp lưng ASA STAR HEART (PayOS Test)",
    price: "2.000đ",
    oldPrice: "100.000đ",
    badge: "TEST",
  },
  {
    id: "VAR002",
    name: "Phụ kiện móc khoá",
    price: "95.000đ",
    oldPrice: "120.000đ",
    badge: "-20%",
  },
  {
    id: "VAR003",
    name: "Ốp lưng Airpod Metallic",
    price: "120.000đ",
    oldPrice: "150.000đ",
  },
  {
    id: "VAR004",
    name: "Phone Case Icon",
    price: "90.000đ",
    oldPrice: "100.000đ",
  },
  {
    id: "VAR005",
    name: "Phone Case Wave",
    price: "88.000đ",
    oldPrice: "96.000đ",
  },
];

const bestSelling: Product[] = [
  {
    id: "VAR006",
    name: "Phone Case Chrome",
    price: "120.000đ",
    oldPrice: "150.000đ",
  },
  {
    id: "VAR007",
    name: "Phone Case Pixel",
    price: "129.000đ",
    oldPrice: "150.000đ",
  },
  {
    id: "VAR008",
    name: "Phone Case Bloom",
    price: "129.000đ",
    oldPrice: "150.000đ",
  },
  { id: "VAR009", name: "Phone Case Mini", price: "122.000đ" },
];

const exploreProducts: Product[] = [
  {
    id: "VAR010",
    name: "Phone Case",
    price: "120.000đ",
    oldPrice: "150.000đ",
    badge: "-35%",
  },
  { id: "VAR011", name: "Phone Case", price: "129.000đ" },
  { id: "VAR012", name: "Phone Case", price: "129.000đ" },
  { id: "VAR013", name: "Phone Case", price: "120.000đ" },
  { id: "VAR014", name: "Phone Case", price: "120.000đ", oldPrice: "150.000đ" },
  { id: "VAR015", name: "Phone Case", price: "129.000đ" },
  { id: "VAR016", name: "Phone Case", price: "110.000đ", badge: "NEW" },
  { id: "VAR017", name: "Phone Case", price: "120.000đ" },
];

function SectionHeading({
  label,
  title,
  targetId,
}: {
  label: string;
  title: string;
  targetId?: string;
}) {
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
      {targetId && <ScrollButtons targetId={targetId} />}
    </div>
  );
}

// ProductCard is removed and replaced by InteractiveProductCard from features/marketing

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

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as "vi" | "en") || "vi";
  const dict = locale === "en" ? en : vi;

  const t = (key: string): string => {
    const parts = key.split(".");
    let current: unknown = dict;
    for (const part of parts) {
      if (
        current &&
        typeof current === "object" &&
        part in (current as Record<string, unknown>)
      ) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof current === "string" ? current : key;
  };

  const heroCategories = [
    { label: "Phone Cases", href: "/shop?category=phone-cases" },
    {
      label: locale === "vi" ? "Bộ sưu tập" : "Collections",
      href: "/collections",
    },
  ];

  let dbProducts: Product[] = [];
  let jardinProducts: Product[] = [];
  try {
    const res = await productApi.getProductsByFilter({ pageSize: 100 });
    if (res && res.length > 0) {
      const jardinRes = res.filter(
        (p) =>
          p.name?.toLowerCase().includes("hoa cẩm tú cầu") ||
          p.name?.toLowerCase().includes("hoa lily") ||
          p.name?.toLowerCase().includes("hoa mẫu đơn") ||
          p.name?.toLowerCase().includes("hoa hồng"),
      );

      const mapProduct = (p: (typeof res)[0]): Product => {
        const variant = p.variants?.[0];
        let priceStr = (variant?.price ?? 0).toLocaleString("vi-VN") + "đ";
        let oldPriceStr = undefined;
        let badgeStr = p.categoryId === "some-id" ? "NEW" : undefined;
        let endTimeStr = undefined;

        if (variant?.isFlashSale && variant?.flashSalePrice != null) {
          priceStr = variant.flashSalePrice.toLocaleString("vi-VN") + "đ";
          oldPriceStr = (variant.price ?? 0).toLocaleString("vi-VN") + "đ";
          badgeStr = "FLASH SALE";
          endTimeStr = variant.flashSaleEndTime;
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
          endTime: endTimeStr,
          imageUrl: p.productImages?.[0]?.imageUrl,
        };
      };

      jardinProducts = jardinRes.map(mapProduct);
      dbProducts = res.filter((p) => !jardinRes.includes(p)).map(mapProduct);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  let dbFlashSales: Product[] = [];
  try {
    const fsRes = await productApi.getFlashSaleProducts();
    if (fsRes && fsRes.length > 0) {
      dbFlashSales = fsRes.map((fs) => ({
        id: fs.variantId || fs.productId,
        productId: fs.productId,
        name: fs.productName || "Sản phẩm Flash Sale",
        price: fs.flashSalePrice.toLocaleString("vi-VN") + "đ",
        oldPrice: fs.originalPrice.toLocaleString("vi-VN") + "đ",
        badge: "FLASH SALE",
        endTime: fs.endTime,
        imageUrl: fs.imageUrl,
      }));
    }
  } catch (error) {
    console.error("Error fetching flash sales:", error);
  }

  const flashSalesDisplay =
    dbFlashSales.length > 0 ? dbFlashSales.slice(0, 8) : flashSales;
  const bestSellingDisplay =
    dbProducts.length > 0 ? dbProducts.slice(0, 4) : bestSelling;
  const exploreProductsDisplay =
    dbProducts.length > 0
      ? dbProducts.length > 4
        ? dbProducts.slice(4, 12)
        : dbProducts
      : exploreProducts.slice(0, 8);

  const jardinProductsDisplay =
    jardinProducts.length > 0 ? jardinProducts : mockJardinProducts;

  const targetFlashSaleDate = flashSalesDisplay.find((p) => p.endTime)?.endTime;

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

          <HomeBannerCarousel />
        </div>
      </section>

      <section className="page-shell py-16">
        <SectionHeading
          label={t("home.flash_sales_label")}
          title={t("home.flash_sales_title")}
          targetId="flash-sales-list"
        />
        <CountdownTimer
          targetDate={targetFlashSaleDate}
          initialDays={3}
          initialHours={23}
          initialMinutes={19}
          initialSeconds={56}
          format="block"
        />
        <div
          id="flash-sales-list"
          className="flex gap-6 overflow-x-auto pb-6 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        >
          {flashSalesDisplay.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="min-w-[260px] snap-start"
            >
              <InteractiveProductCard product={product} />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex min-w-44 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-(--mirai-state-primary-hover) active:scale-[0.98]"
          >
            {t("common.see_all")}
          </Link>
        </div>
      </section>

      {/* Jardin De Fleurs Collection Section */}
      <section className="page-shell border-t border-(--mirai-color-line) py-16 bg-gradient-to-b from-transparent via-accent/5 to-transparent">
        <SectionHeading
          label={t("home.jardin_label")}
          title={t("home.jardin_title")}
        />
        <p className="mb-8 -mt-6 text-sm text-muted-foreground">
          {t("home.jardin_desc")}
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {jardinProductsDisplay.map((product, index) => (
            <InteractiveProductCard
              key={`${product.id}-${index}`}
              product={product}
            />
          ))}
        </div>
      </section>

      <section className="page-shell border-t border-(--mirai-color-line) py-16">
        <SectionHeading
          label={t("home.best_selling_label")}
          title={t("home.best_selling_title")}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellingDisplay.map((product, index) => (
            <InteractiveProductCard
              key={`${product.id}-${index}`}
              product={product}
            />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex min-w-44 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-(--mirai-state-primary-hover) active:scale-[0.98]"
          >
            {t("common.see_all")}
          </Link>
        </div>
      </section>

      <section className="page-shell py-16">
        <SectionHeading
          label={t("home.discover_label")}
          title={t("home.discover_title")}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {exploreProductsDisplay.map((product, index) => (
            <InteractiveProductCard
              key={`${product.id}-${index}`}
              product={product}
            />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex min-w-44 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-(--mirai-state-primary-hover) active:scale-[0.98]"
          >
            {t("common.see_all")}
          </Link>
        </div>
      </section>

      <section className="page-shell border-t border-(--mirai-color-line) py-16">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-8 w-2 rounded-sm bg-(--mirai-sem-accent)" />
            <span className="text-sm font-semibold text-(--mirai-sem-accent)">
              {t("home.new_features_label")}
            </span>
          </div>
          <h2 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
            {t("home.new_features_title")}
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <article className="relative min-h-[420px] rounded-[4px] bg-(--mirai-sem-text) p-8 text-(--mirai-sem-background)">
            <h3 className="font-heading text-4xl font-semibold">Customize</h3>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {t("home.new_features_desc")}
            </p>
            <Link
              href="/customize"
              className="mt-5 inline-flex items-center text-sm underline transition-colors hover:text-(--mirai-sem-primary)"
            >
              {t("common.buy_now")}
            </Link>
            <div className="absolute bottom-8 right-8 h-40 w-28 rounded-2xl bg-gradient-to-br from-(--mirai-sem-primary) to-(--mirai-sem-accent)" />
          </article>

          <div className="grid gap-5">
            <article className="relative min-h-[200px] rounded-[4px] bg-(--mirai-sem-text) p-6 text-(--mirai-sem-background) flex flex-col justify-between">
              <div>
                <Link href="/collections/jardin-de-fleurs">
                  <h3 className="font-heading text-3xl font-semibold text-(--mirai-sem-primary) hover:underline cursor-pointer">
                    Jardin De Fleurs
                  </h3>
                </Link>
                <p className="mt-2 text-sm text-muted-foreground">
                  {locale === "vi"
                    ? "Bộ sưu tập ốp lưng họa tiết hoa cỏ thiên nhiên mới ra mắt."
                    : "A newly released collection of floral and botanical patterned cases."}
                </p>
              </div>
              <Link
                href="/collections/jardin-de-fleurs"
                className="mt-4 inline-flex items-center text-xs underline transition-colors hover:text-(--mirai-sem-primary)"
              >
                {locale === "vi" ? "Xem bộ sưu tập" : "View collection"}
              </Link>
            </article>

            <div className="grid gap-5 md:grid-cols-2">
              <article className="relative min-h-[200px] rounded-[4px] bg-(--mirai-sem-text) p-6 text-(--mirai-sem-background)">
                <h3 className="font-heading text-3xl font-semibold">
                  {t("home.hot_cases")}
                </h3>
              </article>
              <article className="relative min-h-[200px] rounded-[4px] bg-(--mirai-sem-warning) p-6 text-(--mirai-sem-text)">
                <h3 className="font-heading text-3xl font-semibold">
                  {locale === "vi" ? "Phụ kiện" : "Accessories"}
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
              title: t("home.services.free_shipping"),
              desc: t("home.services.free_shipping_desc"),
            },
            {
              icon: <Headset className="h-6 w-6" />,
              title: t("home.services.customer_service"),
              desc: t("home.services.customer_service_desc"),
            },
            {
              icon: <ShieldCheck className="h-6 w-6" />,
              title: t("home.services.money_back"),
              desc: t("home.services.money_back_desc"),
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
